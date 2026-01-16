'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc, runTransaction } from 'firebase/firestore';
import type { Cause, TGNMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, PlusCircle, PackageSearch, Users, Calendar, MapPin, Target } from 'lucide-react';
import Link from 'next/link';
import placeholderImages from '@/lib/placeholder-images.json';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Wallet as WalletIcon, CreditCard, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find(p => p.id === imageId);
};

const PAYMENT_METHODS = [
  { id: 'wallet', label: 'TGN Wallet', icon: WalletIcon },
  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
  { id: 'usdt', label: 'USDT', icon: TrendingUp },
];

export default function CausesPage() {
  const firestore = useFirestore();
  const causesQuery = useMemoFirebase(
    () =>
      query(collection(firestore, 'causes'), where('status', '==', 'approved')),
    [firestore]
  );
  const { data: causes, isLoading: causesLoading, error } = useCollection<Cause>(causesQuery);
  
  const usersRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: allUsers, isLoading: usersLoading } = useCollection<TGNMember>(usersRef);

  const { wallet, isLoading: walletLoading } = useWallet();
  const { toast } = useToast();

  const [selectedCause, setSelectedCause] = useState<Cause | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("wallet");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = causesLoading || usersLoading;

  const totalRaised = causes?.reduce((acc, cause) => acc + cause.currentAmount, 0) || 0;
  const totalBackers = causes?.reduce((acc, cause) => acc + (cause.backersCount || 0), 0) || 0;

  const handleContribute = async () => {
    if (!selectedCause || !contributionAmount) return;

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Amount' });
        return;
    }

    if (selectedPayment === 'wallet') {
        if (!wallet || wallet.balance < amount) {
            toast({ variant: 'destructive', title: 'Insufficient wallet balance' });
            return;
        }
    }
    
    setIsSubmitting(true);

    try {
        const causeRef = doc(firestore, 'causes', selectedCause.id);

        await runTransaction(firestore, async (transaction) => {
            const causeDoc = await transaction.get(causeRef);
            if (!causeDoc.exists()) {
                throw "Cause does not exist!";
            }

            const newCurrentAmount = causeDoc.data().currentAmount + amount;
            const newBackersCount = (causeDoc.data().backersCount || 0) + 1;
            
            transaction.update(causeRef, { 
                currentAmount: newCurrentAmount,
                backersCount: newBackersCount,
            });

            if (selectedPayment === 'wallet' && wallet) {
                const walletRef = doc(firestore, 'wallets', wallet.memberId);
                const newBalance = wallet.balance - amount;
                transaction.update(walletRef, { balance: newBalance });
            }
        });

        toast({
            title: 'Contribution Successful!',
            description: `You've contributed ${formatCurrency(amount)} to "${selectedCause.title}".`,
        });

        setSelectedCause(null);
        setContributionAmount("");

    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Contribution Failed', description: 'An error occurred. Please try again.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const getDaysLeft = (createdAt: any) => {
      if (!createdAt?.toDate) return 30; // default
      const endDate = new Date(createdAt.toDate().getTime() + 60 * 24 * 60 * 60 * 1000); // Assume 60 days campaign
      const daysLeft = Math.round((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, daysLeft);
  }

  return (
    <>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Community Causes</h1>
            <p className="text-muted-foreground">
              Support fundraising campaigns from our global community members.
            </p>
          </div>
          <Button asChild>
            <Link href="/community/causes/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create a Cause
            </Link>
          </Button>
        </header>

         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                    <Heart className="h-8 w-8 text-accent" />
                    <div>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRaised)}</p>
                        <p className="text-sm text-muted-foreground">Total Raised</p>
                    </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <Target className="h-8 w-8 text-primary" />
                        <div>
                            <p className="text-2xl font-bold text-foreground">{causes?.length || 0}</p>
                            <p className="text-sm text-muted-foreground">Active Causes</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-primary" />
                        <div>
                            <p className="text-2xl font-bold text-foreground">{totalBackers}</p>
                            <p className="text-sm text-muted-foreground">Total Backers</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-accent" />
                        <div>
                            <p className="text-2xl font-bold text-foreground">12</p>
                            <p className="text-sm text-muted-foreground">Causes Funded</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>


        {isLoading && (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && <p className="text-destructive">Failed to load causes.</p>}

        {!isLoading && causes?.length === 0 && (
           <div className="text-center py-20 border-2 border-dashed rounded-lg">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Active Causes</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                  There are no approved fundraising causes at the moment.
              </p>
              <Button className="mt-6" asChild>
                  <Link href="/community/causes/new">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Be the first to create one!
                  </Link>
              </Button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
            {causes?.map(cause => {
                const creator = allUsers?.find(u => u.id === cause.creatorMemberId);
                const creatorImage = creator?.imageId ? getImage(creator.imageId) : null;
                const creatorLocation = creator?.locationCountry || 'Global';
                
                return (
                    <Card key={cause.id} className="hover:shadow-card transition-all duration-300">
                    <CardHeader>
                    <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 rounded-lg">
                           <AvatarImage src={creatorImage?.imageUrl} />
                           <AvatarFallback>{cause.creatorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                        <CardTitle className="text-lg">{cause.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            <span>by {cause.creatorName}</span>
                             <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {creatorLocation}</span>
                        </CardDescription>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{cause.description}</p>
                    
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-foreground">{formatCurrency(cause.currentAmount)}</span>
                        <span className="text-muted-foreground">of {formatCurrency(cause.goalAmount)}</span>
                        </div>
                        <Progress value={(cause.currentAmount / cause.goalAmount) * 100} />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" /> {cause.backersCount || 0} backers
                        </span>
                        <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> {getDaysLeft(cause.createdAt)} days left
                        </span>
                    </div>

                    <Button 
                        variant="accent" 
                        className="w-full"
                        onClick={() => setSelectedCause(cause)}
                    >
                        <Heart className="h-4 w-4 mr-2" /> Contribute
                    </Button>
                    </CardContent>
                </Card>
                )
            })}
        </div>
      </div>
      
       <Dialog open={!!selectedCause} onOpenChange={(open) => !open && setSelectedCause(null)}>
        <DialogContent>
            {selectedCause && (
                <>
                    <DialogHeader>
                        <DialogTitle>Support {selectedCause.title}</DialogTitle>
                        <DialogDescription>Choose your contribution amount and payment method</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                            Contribution Amount
                            </label>
                            <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                                type="number"
                                placeholder="Enter amount"
                                value={contributionAmount}
                                onChange={(e) => setContributionAmount(e.target.value)}
                                className="pl-7"
                            />
                            </div>
                            <div className="flex gap-2 mt-2">
                            {[25, 50, 100, 250].map((amount) => (
                                <Button
                                key={amount}
                                variant="outline"
                                size="sm"
                                onClick={() => setContributionAmount(amount.toString())}
                                className={cn(
                                    contributionAmount === amount.toString() && "border-accent text-accent"
                                )}
                                >
                                ${amount}
                                </Button>
                            ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">
                            Payment Method
                            </label>
                            <div className="space-y-2">
                            {PAYMENT_METHODS.map((method) => (
                                <button
                                key={method.id}
                                onClick={() => setSelectedPayment(method.id)}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-lg border transition-colors",
                                    selectedPayment === method.id
                                    ? "border-accent bg-accent/10"
                                    : "border-border hover:bg-muted"
                                )}
                                >
                                <div className="flex items-center gap-3">
                                    <method.icon className={cn(
                                    "h-5 w-5",
                                    selectedPayment === method.id ? "text-accent" : "text-muted-foreground"
                                    )} />
                                    <span className="font-medium text-foreground">{method.label}</span>
                                </div>
                                {method.id === 'wallet' && (
                                    <span className="text-sm text-muted-foreground">
                                    Balance: {walletLoading ? <Skeleton className="h-4 w-16 inline-block"/> : formatCurrency(wallet?.balance || 0)}
                                    </span>
                                )}
                                </button>
                            ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => setSelectedCause(null)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="accent" 
                                className="flex-1"
                                onClick={handleContribute}
                                disabled={!contributionAmount || isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
                                Contribute <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}