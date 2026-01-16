'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { transactions, userWallet as mockWallet, savedCards, chartData } from '@/lib/data';
import { 
    ArrowDownLeft, ArrowUpRight, DollarSign, Upload, CreditCard, Plus, MoreHorizontal, 
    Send, TrendingUp, TrendingDown, ClipboardCopy, Loader2, PartyPopper, Gift, Heart, User, Building, Landmark, ShieldCheck
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import placeholderImages from '@/lib/placeholder-images.json';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TGNMember, Transaction, SavedCard } from '@/lib/types';


const WalletPage = () => {
    const { wallet, isLoading: isWalletLoading } = useWallet();
    const { profile, isLoading: isProfileLoading } = useMemberProfile();
    const { toast } = useToast();
    const firestore = useFirestore();

    const usersRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: allMembers, isLoading: membersLoading } = useCollection<TGNMember>(usersRef);

    // Send Money Dialog State
    const [isSendOpen, setSendOpen] = useState(false);
    const [sendStep, setSendStep] = useState(1);
    const [recipientId, setRecipientId] = useState('');
    const [debouncedRecipientId, setDebouncedRecipientId] = useState('');
    const [recipient, setRecipient] = useState<TGNMember & { name: string } | null | 'loading' | 'not_found'>(null);
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');

    // Withdraw Dialog State
    const [isWithdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    const displayWallet = wallet || mockWallet;
    const isLoading = isWalletLoading || isProfileLoading || membersLoading;

    // Debounce for recipient search
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedRecipientId(recipientId), 500);
        return () => clearTimeout(handler);
    }, [recipientId]);

    const getNameFromEmail = (email: string) => {
        return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    useEffect(() => {
        if (debouncedRecipientId.trim() === '') {
            setRecipient(null);
            return;
        }
        setRecipient('loading');
        setTimeout(() => {
            const foundMember = allMembers?.find(m => m.tgnMemberId.toLowerCase() === debouncedRecipientId.toLowerCase());
            if (foundMember) {
                setRecipient({ ...foundMember, name: getNameFromEmail(foundMember.email) });
            } else {
                setRecipient('not_found');
            }
        }, 500);
    }, [debouncedRecipientId, allMembers]);

    const formatCurrency = (amount: number, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "Account number copied to clipboard." });
    };
    
    const resetSendFlow = () => {
        setSendOpen(false);
        setTimeout(() => {
            setSendStep(1);
            setRecipientId('');
            setRecipient(null);
            setAmount('');
            setPin('');
        }, 300);
    };

    const handleConfirmSend = () => {
        // Simulate PIN check and transaction
        if (pin.length < 4) {
            toast({ variant: 'destructive', title: 'Invalid PIN', description: 'Transaction PIN must be 4 digits.' });
            return;
        }
        if (recipient && typeof recipient !== 'string') {
            toast({ title: 'Transfer Successful!', description: `You have sent ${formatCurrency(parseFloat(amount))} to ${recipient.name}.` });
            setSendStep(3); // Move to success step
        }
    };
    
    const handleWithdrawRequest = () => {
        const amountNum = parseFloat(withdrawAmount);
        if (!amountNum || amountNum <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to withdraw.' });
            return;
        }
        if (amountNum > displayWallet.balance) {
            toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Your withdrawal amount exceeds your available balance.' });
            return;
        }
        if (!bankName.trim() || !accountNumber.trim()) {
            toast({ variant: 'destructive', title: 'Missing Details', description: 'Please provide both bank name and account number.' });
            return;
        }

        // Simulate request
        toast({
            title: 'Withdrawal Request Submitted',
            description: `${formatCurrency(amountNum)} will be processed to your bank account. Status is pending.`
        });

        // Reset form and close dialog
        setWithdrawOpen(false);
        setTimeout(() => {
            setWithdrawAmount('');
            setBankName('');
            setAccountNumber('');
        }, 300)
    };


    const getImage = (imageId?: string) => {
      if (!imageId) return null;
      return placeholderImages.placeholderImages.find((p) => p.id === imageId);
    };
    
    if (isLoading) {
        return (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-8 w-1/3" />
                    <div className="grid md:grid-cols-2 gap-6">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        )
    }

    return (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                 <header>
                    <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                    <p className="text-muted-foreground">Good morning, {profile?.email.split('@')[0]}!</p>
                </header>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$21,500.00</div>
                            <p className="text-xs text-muted-foreground text-green-500">+12% from last month</p>
                        </CardContent>
                    </Card>
                     <Card>
                         <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Spending</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$5,392.00</div>
                            <p className="text-xs text-muted-foreground text-red-500">+8% from last month</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Statistic</CardTitle>
                        <Tabs defaultValue="weekly" className="w-[300px]">
                            <TabsList>
                                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                <TabsTrigger value="last-year">Last Year</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                                <Tooltip
                                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                                    content={({ active, payload, label }) =>
                                    active && payload && payload.length ? (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-1 gap-1">
                                                <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                    {label}
                                                </span>
                                                <span className="font-bold text-foreground">
                                                    {formatCurrency(payload[0].value as number)}
                                                </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null
                                    }
                                />
                                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{r: 4, fill: 'hsl(var(--primary))'}} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Recent History</CardTitle>
                        <CardDescription>A log of your recent wallet activity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.slice(0, 4).map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center",
                                                    (tx.type === 'deposit' || tx.type === 'commission') ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                                                )}>
                                                    {(tx.type === 'deposit' || tx.type === 'commission') ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                                                </div>
                                                <span className="capitalize font-medium">{tx.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium text-foreground">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                tx.status === 'completed' ? 'default' :
                                                tx.status === 'pending' ? 'secondary' :
                                                'destructive'
                                            } className={cn(
                                                tx.status === 'completed' && 'bg-green-500/80',
                                            )}>
                                                {tx.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={cn(
                                            "text-right font-semibold",
                                            tx.amount > 0 ? 'text-green-600' : 'text-foreground'
                                        )}>
                                            {tx.amount > 0 ? `+${formatCurrency(tx.amount, tx.currency)}` : formatCurrency(tx.amount, tx.currency)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>

            <div className="lg:col-span-1 space-y-6">
                 {profile && (
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Your Account Number</CardTitle>
                            <CardDescription className="text-xs">Use this ID to receive funds from other TGN members.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex w-full items-center space-x-2">
                                <Input type="text" value={profile.tgnMemberId} readOnly className="bg-muted font-mono" />
                                <Button onClick={() => copyToClipboard(profile.tgnMemberId)} size="icon" variant="outline">
                                    <ClipboardCopy className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{formatCurrency(displayWallet.balance, displayWallet.currency)}</p>
                        <p className="text-xs text-green-500 flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3" /> 12.81% this month</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Dialog open={isSendOpen} onOpenChange={open => !open && resetSendFlow()}>
                            <DialogTrigger asChild>
                                <Button className="flex-1" onClick={() => setSendOpen(true)}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                {sendStep === 1 && (
                                    <>
                                    <DialogHeader>
                                        <DialogTitle>Send Money</DialogTitle>
                                        <DialogDescription>Enter recipient details and amount.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="recipientId">Recipient Member ID</Label>
                                            <Input id="recipientId" placeholder="TGN-..." value={recipientId} onChange={e => setRecipientId(e.target.value)} />
                                        </div>
                                        {recipient === 'loading' && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Searching...</div>}
                                        {recipient === 'not_found' && <p className="text-sm text-destructive">Member not found.</p>}
                                        {recipient && typeof recipient !== 'string' && (
                                            <div className="p-3 rounded-md border bg-muted/50 flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={getImage(recipient.imageId)?.imageUrl} />
                                                    <AvatarFallback>{recipient.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{recipient.name}</p>
                                                    <p className="text-xs text-muted-foreground">{recipient.tgnMemberId}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <Label htmlFor="amount">Amount (USD)</Label>
                                            <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={resetSendFlow}>Cancel</Button>
                                        <Button type="button" onClick={() => setSendStep(2)} disabled={!recipient || typeof recipient === 'string' || !amount}>Continue</Button>
                                    </DialogFooter>
                                    </>
                                )}
                                {sendStep === 2 && recipient && typeof recipient !== 'string' && (
                                    <>
                                    <DialogHeader>
                                        <DialogTitle>Confirm Transaction</DialogTitle>
                                        <DialogDescription>Please review the details below.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <p className="text-sm text-muted-foreground">You are sending</p>
                                        <p className="text-3xl font-bold text-center">{formatCurrency(parseFloat(amount))}</p>
                                        <p className="text-sm text-muted-foreground text-center">to</p>
                                        <div className="p-3 rounded-md border flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={getImage(recipient.imageId)?.imageUrl} />
                                                <AvatarFallback>{recipient.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{recipient.name}</p>
                                                <p className="text-xs text-muted-foreground">{recipient.tgnMemberId}</p>
                                            </div>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="pin">Transaction PIN</Label>
                                            <Input id="pin" type="password" maxLength={4} placeholder="****" value={pin} onChange={e => setPin(e.target.value)} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setSendStep(1)}>Back</Button>
                                        <Button type="button" onClick={handleConfirmSend} disabled={pin.length !== 4}>Send Now</Button>
                                    </DialogFooter>
                                    </>
                                )}
                                 {sendStep === 3 && recipient && typeof recipient !== 'string' && (
                                    <>
                                    <DialogHeader>
                                        <DialogTitle className="flex flex-col items-center gap-2 text-center">
                                            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                                                <PartyPopper className="h-8 w-8 text-green-600" />
                                            </div>
                                            Transfer Successful
                                        </DialogTitle>
                                        <DialogDescription className="text-center">
                                            You have successfully sent {formatCurrency(parseFloat(amount))} to {recipient.name}.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button type="button" className="w-full" onClick={resetSendFlow}>Done</Button>
                                    </DialogFooter>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                        <Button variant="outline" className="flex-1">
                            <Upload className="mr-2 h-4 w-4"/>
                            Receive
                        </Button>
                    </CardFooter>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle className="text-sm font-medium">Your Card</CardTitle>
                        <Button variant="ghost" size="sm">
                            <Plus className="mr-1 h-4 w-4" />
                            Add Card
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Carousel>
                            <CarouselContent>
                                {savedCards.map(card => (
                                    <CarouselItem key={card.id}>
                                         <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-blue-800 text-primary-foreground relative aspect-[16/9] flex flex-col justify-between">
                                            <div>
                                                <p className="text-sm opacity-80">Card Balance</p>
                                                <p className="text-2xl font-bold">{formatCurrency(displayWallet.balance)}</p>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <p className="font-mono tracking-widest text-lg">**** **** **** {card.last4}</p>
                                                <p className="font-mono">{card.expiryMonth}/{card.expiryYear}</p>
                                            </div>
                                            <div className="absolute top-4 right-4 h-8 w-12 bg-white/20 rounded-md flex items-center justify-center">
                                                <p className="font-bold text-xs">{card.brand.toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2" />
                            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2" />
                        </Carousel>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Gifting & Donations</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                       <Button variant="outline" className="flex-col h-20">
                            <Gift className="h-6 w-6 mb-1" />
                            <span>Send a Gift</span>
                        </Button>
                        <Button variant="outline" className="flex-col h-20">
                            <Heart className="h-6 w-6 mb-1" />
                           <span>Donate</span>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Withdraw</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {profile?.isVerifiedMentor ? (
                            <div className="grid grid-cols-2 gap-3">
                                <Dialog open={isWithdrawOpen} onOpenChange={setWithdrawOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="flex-col h-20">
                                            <Landmark className="h-6 w-6 mb-1" />
                                            <span>To Bank</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Withdraw to Bank Account</DialogTitle>
                                            <DialogDescription>
                                                Enter the amount and your bank details. Funds will be processed within 2-3 business days.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                                                <Input 
                                                    id="withdraw-amount" 
                                                    type="number" 
                                                    placeholder="0.00" 
                                                    value={withdrawAmount}
                                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Available balance: {formatCurrency(displayWallet.balance)}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bank-name">Bank Name</Label>
                                                <Input 
                                                    id="bank-name" 
                                                    placeholder="e.g., Chase Bank" 
                                                    value={bankName}
                                                    onChange={(e) => setBankName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="account-number">Account Number</Label>
                                                <Input 
                                                    id="account-number" 
                                                    placeholder="Your bank account number"
                                                    value={accountNumber}
                                                    onChange={(e) => setAccountNumber(e.target.value)}
                                                 />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
                                            <Button onClick={handleWithdrawRequest}>Submit Request</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="outline" className="flex-col h-20">
                                    <Building className="h-6 w-6 mb-1" />
                                <span>To Paystack/Stripe</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                                <ShieldCheck className="h-10 w-10 mx-auto text-blue-500 mb-2" />
                                <h4 className="font-semibold text-blue-800 dark:text-blue-300">Verification Required</h4>
                                <p className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1 mb-3">
                                    Complete your KYC verification to enable withdrawals.
                                </p>
                                <Button asChild size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                                    <Link href="/kyc">Start Verification</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
        </>
    );
};

export default WalletPage;
