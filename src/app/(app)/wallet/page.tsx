'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWallet } from '@/hooks/useWallet';
import { transactions, userWallet as mockWallet, savedCards } from '@/lib/data';
import { ArrowDownLeft, ArrowUpRight, DollarSign, Download, Upload, CreditCard, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

const WalletPage = () => {
    const { wallet, isLoading, error } = useWallet();
    const { toast } = useToast();

    const displayWallet = wallet || mockWallet; // Use fetched wallet or mock as fallback

    const formatCurrency = (amount: number, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
        }).format(amount);
    };

    const handleTopUp = () => {
        toast({
            title: 'Payment Successful',
            description: 'Your wallet has been topped up.',
        });
    }
    
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-48 w-full" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                           {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return <p className="text-destructive">Error loading wallet information. Please try again later.</p>
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
                <p className="text-muted-foreground">Manage your funds and view your transaction history.</p>
            </header>
            
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gradient-to-br from-primary to-blue-800 text-primary-foreground">
                    <CardHeader>
                        <CardTitle className="text-primary-foreground/80">Main Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{formatCurrency(displayWallet.balance, displayWallet.currency)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="text-green-500" />
                            USDT Balance
                        </CardTitle>
                    </CardHeader>
                     <CardContent>
                        <p className="text-4xl font-bold">{displayWallet.usdtBalance.toFixed(2)} <span className="text-lg text-muted-foreground">USDT</span></p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="lg" className="flex-1">
                            <Upload className="mr-2 h-4 w-4"/>
                            Top Up Wallet
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Top Up Your Wallet</DialogTitle>
                            <DialogDescription>
                                Add funds to your TGN wallet. Payments are processed securely.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (USD)</Label>
                                <Input id="amount" type="number" placeholder="e.g., 50.00" defaultValue="50.00" />
                            </div>
                            <div className="space-y-2">
                                <Label>Select Payment Method</Label>
                                <RadioGroup defaultValue="card1" className="space-y-2">
                                    {savedCards.map(card => (
                                         <Label key={card.id} htmlFor={card.id} className="flex items-center gap-3 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                            <RadioGroupItem value={card.id} id={card.id} />
                                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                                            <div className="flex-1">
                                                <p className="font-medium">{card.brand} ending in {card.last4}</p>
                                                <p className="text-xs text-muted-foreground">Expires {card.expiryMonth}/{card.expiryYear}</p>
                                            </div>
                                            {card.isDefault && <Badge variant="secondary">Default</Badge>}
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="w-full">Add New Card</Button>
                             <Button type="submit" className="w-full" onClick={handleTopUp}>
                                Pay {formatCurrency(50)}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Button size="lg" variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4"/>
                    Withdraw
                </Button>
            </div>
            
            <Separator />
            
            <Card>
                <CardHeader>
                    <CardTitle>Saved Cards</CardTitle>
                    <CardDescription>Manage your payment methods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {savedCards.map(card => (
                        <div key={card.id} className="flex items-center p-3 border rounded-lg">
                             <CreditCard className="h-5 w-5 text-muted-foreground mr-3" />
                            <div className="flex-1">
                                <p className="font-medium">{card.brand} **** {card.last4}</p>
                                <p className="text-xs text-muted-foreground">Expires {card.expiryMonth}/{card.expiryYear}</p>
                            </div>
                            {card.isDefault && <Badge variant="outline">Default</Badge>}
                        </div>
                    ))}
                     <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
                        <Plus className="h-4 w-4" />
                        Add a new card
                    </Button>
                </CardContent>
            </Card>


            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
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
                            {transactions.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center",
                                                (tx.type === 'deposit' || tx.type === 'commission') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
                                        {formatCurrency(tx.amount, tx.currency)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">View All Transactions</Button>
                </CardFooter>
            </Card>

        </div>
    );
};

export default WalletPage;
