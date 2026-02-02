'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Megaphone, BarChart2, DollarSign, Eye, Pointer } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import type { AdCampaign } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function AdsManagerPage() {
  const firestore = useFirestore();
  const { profile, isLoading: profileLoading } = useMemberProfile();

  const adsQuery = useMemoFirebase(
    () =>
      profile
        ? query(collection(firestore, 'ads'), where('creatorMemberId', '==', profile.id))
        : null,
    [firestore, profile]
  );

  const { data: campaigns, isLoading: campaignsLoading } = useCollection<AdCampaign>(adsQuery);

  const isLoading = profileLoading || campaignsLoading;
  
  const stats = useMemo(() => {
    if (!campaigns) return { totalSpent: 0, totalReach: 0, totalClicks: 0 };
    return {
        totalSpent: campaigns.reduce((acc, c) => acc + (c.amountSpent || 0), 0),
        totalReach: 12450, // Mock data
        totalClicks: 832, // Mock data
    }
  }, [campaigns]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ad Manager</h1>
          <p className="text-muted-foreground">
            Create and manage your ad campaigns on the TGN platform.
          </p>
        </div>
        <Button asChild>
          <Link href="/ads/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Amount Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total amount spent on all campaigns.</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reach</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalReach.toLocaleString()}</div>
                 <p className="text-xs text-muted-foreground">Total unique members reached.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                <Pointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total clicks on your ads.</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Your Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Amount Spent</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && Array.from({length: 3}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        </TableRow>
                    ))}
                    {!isLoading && campaigns?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-48 text-center">
                                <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-medium">No Campaigns Yet</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Get started by creating your first ad campaign.
                                </p>
                                <Button className="mt-6" asChild>
                                    <Link href="/ads/new">Create Campaign</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    )}
                    {campaigns?.map(campaign => (
                         <TableRow key={campaign.id}>
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    campaign.status === 'active' ? 'default' :
                                    campaign.status === 'rejected' ? 'destructive' :
                                    'secondary'
                                } className={cn(campaign.status === 'active' && 'bg-green-600')}>
                                    {campaign.status}
                                </Badge>
                                {campaign.status === 'rejected' && campaign.rejectionReason && (
                                  <p className="text-xs text-destructive mt-1 max-w-xs">{campaign.rejectionReason}</p>
                                )}
                            </TableCell>
                            <TableCell>${campaign.budget.toFixed(2)}</TableCell>
                            <TableCell>${(campaign.amountSpent || 0).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
