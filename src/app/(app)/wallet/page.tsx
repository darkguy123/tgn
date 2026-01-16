'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { transactions, userWallet as mockWallet, savedCards, members, chartData } from '@/lib/data';
import { ArrowDownLeft, ArrowUpRight, DollarSign, Download, Upload, CreditCard, Plus, MoreHorizontal, Send, TrendingUp, TrendingDown, Bell } from 'lucide-react';
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

const WalletPage = () => {
    const { wallet, isLoading, error } = useWallet();
    const { toast } = useToast();

    const displayWallet = wallet || mockWallet;

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

    const getImage = (imageId: string) => {
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

    if (error) {
        return <p className="text-destructive">Error loading wallet information. Please try again later.</p>
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                 <header>
                    <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                    <p className="text-muted-foreground">Good morning, {displayWallet.memberId}!</p>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{formatCurrency(displayWallet.balance, displayWallet.currency)}</p>
                        <p className="text-xs text-green-500 flex items-center gap-1 mt-1"><TrendingUp className="h-3 w-3" /> 12.81% this month</p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button className="flex-1">
                            <Send className="mr-2 h-4 w-4" />
                            Send
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1">
                                    <Upload className="mr-2 h-4 w-4"/>
                                    Receive
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
                                                <Label key={card.id} htmlFor={card.id} className="flex items-center gap-3 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
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
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" className="w-full">Add New Card</Button>
                                    <Button type="submit" className="w-full" onClick={handleTopUp}>
                                        Pay {formatCurrency(50)}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Your Card</CardTitle>
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
                        <CardTitle>Quick Transfer</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                        {members.slice(0, 4).map(member => {
                            const img = getImage(member.imageId);
                            return (
                                <Avatar key={member.id} className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary ring-offset-2 ring-offset-background transition-all">
                                    <AvatarImage src={img?.imageUrl} alt={member.name} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )
                        })}
                        <Button size="icon" variant="outline" className="rounded-full h-10 w-10">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Notifications</CardTitle>
                         <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {transactions.slice(0,3).map(tx => (
                            <div key={tx.id} className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-muted">
                                    {tx.amount > 0 ? <ArrowDownLeft className="h-5 w-5 text-green-500" /> : <ArrowUpRight className="h-5 w-5 text-red-500" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                </div>
                                <p className={cn("text-sm font-bold", tx.amount > 0 ? 'text-green-500' : 'text-foreground')}>{tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default WalletPage;

    