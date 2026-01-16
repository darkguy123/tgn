'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import placeholderImages from '@/lib/placeholder-images.json';
import { ClipboardCopy, DollarSign, Users, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { AffiliateReferral } from '@/lib/types';


const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};

const commissionLevels = [
    { level: 1, rate: '5%' },
    { level: 2, rate: '3%' },
    { level: 3, rate: '2%' },
    { level: 4, rate: '1.5%' },
    { level: 5, rate: '1.5%' },
    { level: 6, rate: '1%' },
    { level: 7, rate: '1%' },
];


const ReferralsPage = () => {
  const { profile, isLoading: isProfileLoading } = useMemberProfile();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const referralsQuery = useMemoFirebase(
    () => profile ? query(collection(firestore, 'affiliate_referrals'), where('referrerMemberId', '==', profile.id)) : null,
    [firestore, profile]
  );
  
  const { data: downline, isLoading: isDownlineLoading } = useCollection<AffiliateReferral>(referralsQuery);


  const referralLink = profile ? `https://tgn.com/join?ref=${profile.tgnMemberId}` : '';

  const copyToClipboard = () => {
    if(!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h1>
        <p className="text-muted-foreground">Track your referrals, earnings, and impact.</p>
      </header>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">$1,250.00</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{isDownlineLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : downline?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Directly referred members</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">$185.50</div>
                <p className="text-xs text-muted-foreground">Awaiting clearance</p>
            </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>Share this link to invite new members and earn commissions.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex w-full items-center space-x-2">
                <Input type="text" value={referralLink} readOnly className="bg-muted" />
                <Button onClick={copyToClipboard} size="icon" disabled={isProfileLoading}>
                    <ClipboardCopy className="h-4 w-4" />
                </Button>
            </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Downline Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
              <CardTitle>Your Downline (Level 1)</CardTitle>
              <CardDescription>Members you have directly referred.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Referred Member ID</TableHead>
                        <TableHead className="text-right">Commission Rate</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isDownlineLoading && (
                        <TableRow>
                            <TableCell colSpan={2} className="h-24 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                            </TableCell>
                        </TableRow>
                    )}
                    {!isDownlineLoading && downline?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={2} className="h-24 text-center">
                                No referrals yet. Share your link to get started!
                            </TableCell>
                        </TableRow>
                    )}
                    {downline?.map(referral => (
                         <TableRow key={referral.id}>
                            <TableCell>
                                <p className="font-mono text-sm">{referral.referredMemberId}</p>
                            </TableCell>
                            <TableCell className="text-right font-medium">{referral.commissionPercentage}%</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Commission Structure */}
        <Card>
            <CardHeader>
                <CardTitle>Commission Structure</CardTitle>
                <CardDescription>Our 7-level referral model rewards you for growing the network.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {commissionLevels.map(level => (
                    <div key={level.level} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Level {level.level}</span>
                        <span className="font-medium text-primary">{level.rate}</span>
                    </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold">Total Payout</span>
                    <span className="font-bold text-primary">15%</span>
                </div>
            </CardContent>
            <CardFooter>
                 <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-sm text-blue-800 dark:text-blue-300">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>Commissions apply to paid courses, event tickets, and book sales.</p>
                </div>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default ReferralsPage;
