'use client';
import { useState } from 'react';
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import placeholderImages from '@/lib/placeholder-images.json';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Wallet, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find(p => p.id === imageId);
};

export default function MarketplacePage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { wallet } = useWallet();
  const { toast } = useToast();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBuyDialogOpen, setBuyDialogOpen] = useState(false);

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

  const handleConfirmPurchase = () => {
    if (!selectedProduct || !wallet) return;

    if (wallet.balance < selectedProduct.price) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Funds',
        description: 'You do not have enough money in your wallet.',
      });
    } else {
      // In a real app, this would trigger a backend function
      toast({
        title: 'Purchase Successful!',
        description: `You have purchased "${selectedProduct.name}".`,
      });
    }
    setBuyDialogOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">
            Books, courses, and tools from our expert members.
          </p>
        </div>
        <Button asChild>
          <Link href="/marketplace/new">Sell Your Product</Link>
        </Button>
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products?.map(product => {
          const img = getImage(product.imageId);
          const sellerImg = getImage(product.sellerImageId);
          return (
            <Card key={product.id} className="flex flex-col overflow-hidden group">
              <CardHeader className="p-0 relative">
                <Link href="#">
                  <Image
                    src={img?.imageUrl || 'https://placehold.co/600x400'}
                    alt={product.name}
                    width={600}
                    height={400}
                    className="aspect-[3/2] w-full object-cover transition-transform group-hover:scale-105"
                    data-ai-hint={img?.imageHint}
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
                        <AvatarImage src={sellerImg?.imageUrl} />
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
            <Button onClick={handleConfirmPurchase} disabled={!wallet || !selectedProduct || wallet.balance < selectedProduct.price}>
                Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
