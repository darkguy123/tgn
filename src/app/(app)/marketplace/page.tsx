'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import {
  collection,
  query,
  where,
  runTransaction,
  doc,
  serverTimestamp,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import type { Product, AffiliateReferral, Commission } from '@/lib/types';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Wallet, CheckCircle, XCircle, ShoppingBag, List, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AdPlacement } from '@/components/AdPlacement';

export default function MarketplacePage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { wallet, isLoading: walletLoading } = useWallet();
  const { toast } = useToast();
  const { user: currentUser } = useUser();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBuyDialogOpen, setBuyDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referrer, setReferrer] = useState<AffiliateReferral | null>(null);
  const [isFindingReferrer, setIsFindingReferrer] = useState(true);

  // Effect to find the referrer for the current user
  useEffect(() => {
    if (!currentUser || !firestore) {
      setIsFindingReferrer(false);
      return;
    }
    const findReferrer = async () => {
      const referralsRef = collection(firestore, 'affiliate_referrals');
      const q = query(referralsRef, where('referredMemberId', '==', currentUser.uid), where('level', '==', 1));
      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const referrerDoc = querySnapshot.docs[0];
          setReferrer({ id: referrerDoc.id, ...referrerDoc.data() } as AffiliateReferral);
        }
      } catch (error) {
        console.error("Error finding referrer:", error);
      } finally {
        setIsFindingReferrer(false);
      }
    };
    findReferrer();
  }, [currentUser, firestore]);

  const productsQuery = useMemoFirebase(
    () =>
      query(
        collection(firestore, 'products'),
        where('approvalStatus', '==', 'approved')
      ),
    [firestore]
  );
  const {
    data: products,
    isLoading,
    error,
  } = useCollection<Product>(productsQuery);

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setBuyDialogOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct || !wallet || !currentUser || !firestore) return;

    if (wallet.balance < selectedProduct.price) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Funds',
        description: 'You do not have enough money in your wallet.',
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      await runTransaction(firestore, async (transaction) => {
        const buyerWalletRef = doc(firestore, 'wallets', currentUser.uid);
        const sellerWalletRef = doc(firestore, 'wallets', selectedProduct.sellerMemberId);
        const referrerWalletRef = referrer ? doc(firestore, 'wallets', referrer.referrerMemberId) : null;

        const buyerWalletDoc = await transaction.get(buyerWalletRef);
        if (!buyerWalletDoc.exists() || buyerWalletDoc.data().balance < selectedProduct.price) {
          throw new Error("Insufficient funds.");
        }

        // --- Perform Balance Updates ---
        // 1. Debit Buyer
        const newBuyerBalance = buyerWalletDoc.data().balance - selectedProduct.price;
        transaction.update(buyerWalletRef, { balance: newBuyerBalance });

        // 2. Credit Seller
        const sellerWalletDoc = await transaction.get(sellerWalletRef);
        const sellerBalance = sellerWalletDoc.exists() ? sellerWalletDoc.data().balance : 0;
        const newSellerBalance = sellerBalance + selectedProduct.price;
        transaction.set(sellerWalletRef, { balance: newSellerBalance, memberId: selectedProduct.sellerMemberId, currency: 'USD' }, { merge: true });
        
        // 3. Credit Referrer (if exists)
        if (referrer && referrerWalletRef) {
            const commissionRate = 0.05; // Level 1 is 5%
            const commissionAmount = selectedProduct.price * commissionRate;

            const referrerWalletDoc = await transaction.get(referrerWalletRef);
            const referrerBalance = referrerWalletDoc.exists() ? referrerWalletDoc.data().balance : 0;
            const newReferrerBalance = referrerBalance + commissionAmount;
            
            transaction.set(referrerWalletRef, { balance: newReferrerBalance, memberId: referrer.referrerMemberId, currency: 'USD' }, { merge: true });
        }
      });
      
      // --- Log Transactions (post-atomic update) ---
      // Log Buyer's Purchase
      const buyerTransactionsRef = collection(firestore, 'users', currentUser.uid, 'transactions');
      await addDoc(buyerTransactionsRef, {
          type: 'purchase',
          status: 'completed',
          amount: -selectedProduct.price,
          currency: 'USD',
          description: `Purchase: ${selectedProduct.name}`,
          createdAt: serverTimestamp(),
      });
      
      // Log Referrer's Commission
      if (referrer) {
          const commissionRate = 0.05;
          const commissionAmount = selectedProduct.price * commissionRate;
          const commissionsRef = collection(firestore, 'commissions');
          await addDoc(commissionsRef, {
              referrerId: referrer.referrerMemberId,
              buyerId: currentUser.uid,
              productId: selectedProduct.id,
              saleAmount: selectedProduct.price,
              commissionAmount: commissionAmount,
              createdAt: serverTimestamp(),
          } as Omit<Commission, 'id'>);
      }

      toast({
        title: 'Purchase Successful!',
        description: `You have purchased "${selectedProduct.name}".`,
      });

    } catch (e: any) {
        console.error("Purchase failed:", e);
        toast({ variant: 'destructive', title: 'Purchase Failed', description: e.message || "An error occurred."});
    } finally {
        setIsSubmitting(false);
        setBuyDialogOpen(false);
        setSelectedProduct(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      <div className="lg:col-span-3 space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground">
                Books, courses, and tools from our expert members.
            </p>
            </div>
            <div className="flex gap-2">
                <Button asChild variant="outline">
                    <Link href="/marketplace/my-products">
                        <List className="mr-2 h-4 w-4" />
                        My Products
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/marketplace/new">Sell Your Product</Link>
                </Button>
            </div>
        </header>

        <Card>
            <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-10" />
                </div>
                <div>
                <Select>
                    <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="book">Books</SelectItem>
                    <SelectItem value="course">Courses</SelectItem>
                    <SelectItem value="tool">Tools</SelectItem>
                    <SelectItem value="digital-asset">Digital Assets</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div>
                <Select>
                    <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
            </CardContent>
        </Card>

        {isLoading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-96 w-full" />
            ))}
            </div>
        )}

        {error && <p className="text-destructive">Failed to load products.</p>}

        {!isLoading && products?.length === 0 && (
            <Card className="py-20 text-center">
                <CardContent>
                    <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Marketplace is Empty</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Be the first one to sell a product on the platform.
                    </p>
                    <Button className="mt-6" asChild>
                        <Link href="/marketplace/new">Sell a Product</Link>
                    </Button>
                </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products?.map(product => {
            return (
                <Card key={product.id} className="flex flex-col overflow-hidden group">
                <CardHeader className="p-0 relative">
                    <Link href="#">
                    <Image
                        src={product.imageUrl || 'https://placehold.co/600x400'}
                        alt={product.name}
                        width={600}
                        height={400}
                        className="aspect-[3/2] w-full object-cover transition-transform group-hover:scale-105"
                    />
                    </Link>
                    <Badge
                    className="absolute top-3 right-3"
                    variant={
                        product.type === 'Book' || product.type === 'Tool'
                        ? 'secondary'
                        : 'default'
                    }
                    >
                    {product.type}
                    </Badge>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col">
                    <CardTitle className="text-lg mb-2 leading-tight">
                    <Link href="#" className="hover:text-primary transition-colors">{product.name}</Link>
                    </CardTitle>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={product.sellerAvatarUrl} />
                            <AvatarFallback>{product.sellerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{product.sellerName}</span>
                    </div>

                    <p className="text-2xl font-semibold mt-auto">
                    ${product.price.toFixed(2)}
                    </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <Button className="w-full" onClick={() => handleBuyClick(product)}>
                    Buy Now
                    </Button>
                </CardFooter>
                </Card>
            );
            })}
        </div>
      </div>
      <aside className="lg:col-span-1 space-y-6 hidden lg:block sticky top-24">
        <AdPlacement size="skyscraper" />
      </aside>

      <Dialog open={isBuyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase &quot;{selectedProduct?.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="p-4 border rounded-lg flex justify-between items-center">
              <span className="font-medium text-lg">{selectedProduct?.name}</span>
              <span className="font-bold text-lg">${selectedProduct?.price.toFixed(2)}</span>
            </div>
             <div className="p-4 border rounded-lg flex justify-between items-center bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="h-5 w-5" />
                    <span>Your Wallet Balance</span>
                </div>
                <span className="font-semibold">{wallet ? `$${wallet.balance.toFixed(2)}` : <Skeleton className="h-5 w-20"/>}</span>
            </div>
            {wallet && selectedProduct && wallet.balance < selectedProduct.price && (
                 <div className="p-3 border rounded-lg flex items-center gap-3 bg-destructive/10 text-destructive border-destructive/20 text-sm">
                    <XCircle className="h-5 w-5" />
                    <span>You have insufficient funds for this purchase.</span>
                </div>
            )}
             {wallet && selectedProduct && wallet.balance >= selectedProduct.price && (
                 <div className="p-3 border rounded-lg flex items-center gap-3 bg-green-500/10 text-green-700 border-green-500/20 text-sm">
                    <CheckCircle className="h-5 w-5" />
                    <span>You have sufficient funds.</span>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBuyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmPurchase} disabled={isSubmitting || !wallet || !selectedProduct || wallet.balance < selectedProduct.price}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
