'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { 
    ArrowDownLeft, ArrowUpRight, DollarSign, Plus, CreditCard, MoreHorizontal, 
    Send, TrendingUp, TrendingDown, ClipboardCopy, Loader2, PartyPopper, Gift, Heart, User, Building, Landmark, ShieldCheck, ArrowLeft
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import placeholderImages from '@/lib/placeholder-images.json';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, runTransaction, doc, serverTimestamp, addDoc, setDoc } from 'firebase/firestore';
import type { TGNMember, Transaction } from '@/lib/types';
import { ToastAction } from '@/components/ui/toast';


const WalletPage = () => {
    const { user } = useUser();
    const { wallet, isLoading: isWalletLoading } = useWallet();
    const { profile, isLoading: isProfileLoading } = useMemberProfile();
    const { toast } = useToast();
    const firestore = useFirestore();
    const searchParams = useSearchParams();
    const router = useRouter();

    const usersRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
    const { data: allMembers, isLoading: membersLoading } = useCollection<TGNMember>(usersRef);
    
    const transactionsQuery = useMemoFirebase(
        () => user ? query(collection(firestore, 'users', user.uid, 'transactions'), orderBy('createdAt', 'desc')) : null,
        [user, firestore]
    );

    const { data: transactions, isLoading: isTransactionsLoading } = useCollection<Transaction>(transactionsQuery);

    // Send Money Dialog State
    const [isSendOpen, setSendOpen] = useState(false);
    const [sendStep, setSendStep] = useState(1);
    const [recipientId, setRecipientId] = useState('');
    const [debouncedRecipientId, setDebouncedRecipientId] = useState('');
    const [recipient, setRecipient] = useState<TGNMember & { name: string } | null | 'loading' | 'not_found'>(null);
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add Funds Dialog State
    const [isAddFundsOpen, setAddFundsOpen] = useState(false);
    const [addFundsAmount, setAddFundsAmount] = useState('');

    // Withdraw Dialog State
    const [isWithdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    const isLoading = isWalletLoading || isProfileLoading || membersLoading || isTransactionsLoading;

    // Pre-fill recipient from URL
    useEffect(() => {
        const recipientFromUrl = searchParams.get('recipient');
        if(recipientFromUrl) {
            setRecipientId(recipientFromUrl);
            setSendOpen(true);
        }
    }, [searchParams]);

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
                setRecipient({ ...foundMember, name: foundMember.name || getNameFromEmail(foundMember.email) });
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

    const handleConfirmSend = async () => {
        if (pin.length < 4) {
            toast({ variant: 'destructive', title: 'Invalid PIN', description: 'Transaction PIN must be 4 digits.' });
            return;
        }
        if (!user || !recipient || typeof recipient === 'string' || !profile) {
            toast({ variant: 'destructive', title: 'Error', description: 'Recipient not found.' });
            return;
        }
        
        setIsSubmitting(true);

        const transferAmount = parseFloat(amount);

        try {
            const senderWalletRef = doc(firestore, 'wallets', user.uid);
            const recipientWalletRef = doc(firestore, 'wallets', recipient.id);

            await runTransaction(firestore, async (transaction) => {
                const senderWalletDoc = await transaction.get(senderWalletRef);
                if (!senderWalletDoc.exists() || senderWalletDoc.data().balance < transferAmount) {
                    throw new Error("Insufficient funds.");
                }

                const recipientWalletDoc = await transaction.get(recipientWalletRef);

                // Update sender's wallet
                const newSenderBalance = senderWalletDoc.data().balance - transferAmount;
                transaction.update(senderWalletRef, { balance: newSenderBalance });

                // Update or create recipient's wallet
                if (recipientWalletDoc.exists()) {
                    const newRecipientBalance = recipientWalletDoc.data().balance + transferAmount;
                    transaction.update(recipientWalletRef, { balance: newRecipientBalance });
                } else {
                    transaction.set(recipientWalletRef, {
                        memberId: recipient.id,
                        currency: 'USD',
                        balance: transferAmount,
                    });
                }
            });

            // Create transaction logs after the atomic update
            const senderTransactionsRef = collection(firestore, 'users', user.uid, 'transactions');
            await addDoc(senderTransactionsRef, {
                type: 'purchase',
                status: 'completed',
                amount: -transferAmount,
                currency: 'USD',
                description: `Sent to ${recipient.name}`,
                createdAt: serverTimestamp(),
            });

            const recipientTransactionsRef = collection(firestore, 'users', recipient.id, 'transactions');
            await addDoc(recipientTransactionsRef, {
                type: 'deposit',
                status: 'completed',
                amount: transferAmount,
                currency: 'USD',
                description: `Received from ${profile.name || 'a member'}`,
                createdAt: serverTimestamp(),
            });
            
            setSendStep(3);
        } catch (e: any) {
            console.error("Transfer failed", e);
            toast({ variant: 'destructive', title: 'Transfer Failed', description: e.message || 'An error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleAddFunds = async () => {
        const depositAmount = parseFloat(addFundsAmount);
        if (!user || !depositAmount || depositAmount <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Amount' });
            return;
        }

        setIsSubmitting(true);
        const walletRef = doc(firestore, 'wallets', user.uid);
        
        try {
            await runTransaction(firestore, async (transaction) => {
                const walletDoc = await transaction.get(walletRef);
                const currentBalance = walletDoc.exists() ? walletDoc.data().balance : 0;
                const newBalance = currentBalance + depositAmount;

                transaction.set(walletRef, { 
                    balance: newBalance,
                    memberId: user.uid,
                    currency: 'USD'
                }, { merge: true });
            });

            const transactionsRef = collection(firestore, 'users', user.uid, 'transactions');
            await addDoc(transactionsRef, {
                type: 'deposit',
                status: 'completed',
                amount: depositAmount,
                currency: 'USD',
                description: 'Funds added from card',
                createdAt: serverTimestamp(),
            });

            toast({ title: "Funds Added", description: `${formatCurrency(depositAmount)} has been added to your wallet.` });
            setAddFundsOpen(false);
            setAddFundsAmount('');

        } catch (e: any) {
            console.error("Failed to add funds:", e);
            toast({ variant: 'destructive', title: 'Failed to Add Funds', description: 'An error occurred. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWithdrawRequest = async () => {
        setIsSubmitting(true);
        const amountNum = parseFloat(withdrawAmount);
        if (!wallet || !amountNum || amountNum <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to withdraw.' });
            setIsSubmitting(false);
            return;
        }
        if (amountNum > wallet.balance) {
            toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Your withdrawal amount exceeds your available balance.' });
            setIsSubmitting(false);
            return;
        }
        if (!bankName.trim() || !accountNumber.trim()) {
            toast({ variant: 'destructive', title: 'Missing Details', description: 'Please provide both bank name and account number.' });
            setIsSubmitting(false);
            return;
        }

        try {
            if (!user) throw new Error("User not found");
            const transactionsRef = collection(firestore, 'users', user.uid, 'transactions');
            await addDoc(transactionsRef, {
                type: 'withdrawal',
                status: 'pending',
                amount: -amountNum,
                currency: 'USD',
                description: `Withdrawal to ${bankName}`,
                createdAt: serverTimestamp(),
                memberId: user.uid,
                bankDetails: { bankName, accountNumber }
            });

            toast({
                title: 'Withdrawal Request Submitted',
                description: `${formatCurrency(amountNum)} will be processed to your bank account.`
            });

            setWithdrawOpen(false);
            setTimeout(() => {
                setWithdrawAmount('');
                setBankName('');
                setAccountNumber('');
            }, 300);
        } catch(e: any) {
             toast({ variant: 'destructive', title: 'Request Failed', description: e.message || 'An error occurred.' });
        } finally {
             setIsSubmitting(false);
        }
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
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        )
    }

    return (
        <>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                 <header>
                    <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
                    <p className="text-muted-foreground">Manage your funds and view your transaction history.</p>
                </header>
                
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
                                {isTransactionsLoading && (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                                )}
                                {!isTransactionsLoading && transactions?.length === 0 && (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No transactions yet.</TableCell></TableRow>
                                )}
                                {transactions?.map(tx => (
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
                                            <p className="text-xs text-muted-foreground">{tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString() : ''}</p>
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
                                            (tx.type === 'deposit' || tx.type === 'commission') ? 'text-green-600' : 'text-foreground'
                                        )}>
                                            {(tx.type === 'deposit' || tx.type === 'commission') ? `+${formatCurrency(tx.amount, tx.currency)}` : formatCurrency(tx.amount, tx.currency)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

            </div>

            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
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
                        <p className="text-4xl font-bold">{formatCurrency(wallet?.balance || 0, wallet?.currency || 'USD')}</p>
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
                                                    <AvatarImage src={getImage(recipient.avatarUrl)?.imageUrl} />
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
                                        <Button type="button" onClick={() => {
                                            if (!profile?.hasTransactionPin) {
                                                toast({
                                                    variant: 'destructive',
                                                    title: "Set a PIN First",
                                                    description: "You need to set a transaction PIN in your settings before you can send money.",
                                                    action: <ToastAction altText="Go to Settings" onClick={() => router.push('/settings/profile?tab=security')}>Go to Settings</ToastAction>,
                                                });
                                                return;
                                            }
                                            setSendStep(2)
                                        }} disabled={!recipient || typeof recipient === 'string' || !amount}>Continue</Button>
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
                                                <AvatarImage src={getImage(recipient.avatarUrl)?.imageUrl} />
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
                                        <Button type="button" onClick={handleConfirmSend} disabled={pin.length !== 4 || isSubmitting}>
                                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                            Send Now
                                        </Button>
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
                        <Dialog open={isAddFundsOpen} onOpenChange={setAddFundsOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1" onClick={() => setAddFundsOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4"/>
                                    Add Funds
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Funds to Wallet</DialogTitle>
                                    <DialogDescription>Simulate adding funds from a credit/debit card.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="add-funds-amount">Amount (USD)</Label>
                                        <Input 
                                            id="add-funds-amount"
                                            type="number"
                                            placeholder="0.00"
                                            value={addFundsAmount}
                                            onChange={(e) => setAddFundsAmount(e.target.value)}
                                        />
                                    </div>
                                    <div className="p-4 border rounded-lg flex justify-between items-center bg-muted/50">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <CreditCard className="h-5 w-5" />
                                            <span>Payment Method</span>
                                        </div>
                                        <span className="font-semibold">Card ending in 4242</span>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setAddFundsOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddFunds} disabled={isSubmitting || !addFundsAmount}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                        Add {addFundsAmount ? formatCurrency(parseFloat(addFundsAmount)) : ''}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
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
                                                    Available balance: {formatCurrency(wallet?.balance || 0)}
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
                                            <Button onClick={handleWithdrawRequest} disabled={isSubmitting}>
                                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                                Submit Request
                                            </Button>
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
