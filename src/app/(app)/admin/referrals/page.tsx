'use client';
import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { AffiliateReferral, TGNMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useMemberProfile } from '@/hooks/useMemberProfile';

export default function AdminReferralsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { profile } = useMemberProfile();
  
  const referralsRef = useMemoFirebase(() => (firestore && user && profile ? collection(firestore, 'affiliate_referrals') : null), [firestore, user, profile]);
  const { data: referrals, isLoading: referralsLoading } = useCollection<AffiliateReferral>(referralsRef);

  const usersRef = useMemoFirebase(() => (firestore && user && profile ? collection(firestore, 'users') : null), [firestore, user, profile]);
  const { data: users, isLoading: usersLoading } = useCollection<TGNMember>(usersRef);

  const usersMap = useMemo(() => {
    if (!users) return new Map<string, TGNMember>();
    return users.reduce((acc, user) => {
      acc.set(user.id, user);
      return acc;
    }, new Map<string, TGNMember>());
  }, [users]);
  
  const isLoading = referralsLoading || usersLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Affiliate Referrals</h1>
          <p className="text-muted-foreground">
            A complete log of all referral relationships in the network.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referrer</TableHead>
                <TableHead>Referred Member</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 5}).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                  <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                  <TableCell><Skeleton className="h-5 w-8"/></TableCell>
                  <TableCell><Skeleton className="h-5 w-20"/></TableCell>
                  <TableCell><Skeleton className="h-5 w-20"/></TableCell>
                </TableRow>
              ))}

              {!isLoading && referrals?.map(referral => {
                const referrer = usersMap.get(referral.referrerMemberId);
                const referred = usersMap.get(referral.referredMemberId);
                return (
                  <TableRow key={referral.id}>
                    <TableCell>{referrer?.name || referral.referrerMemberId}</TableCell>
                    <TableCell>{referred?.name || referral.referredMemberId}</TableCell>
                    <TableCell>{referral.level}</TableCell>
                    <TableCell>{referral.commissionPercentage}%</TableCell>
                    <TableCell>{referral.createdAt?.toDate ? formatDistanceToNow(referral.createdAt.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
                  </TableRow>
                )
              })}

              {!isLoading && (!referrals || referrals.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No referrals have been made yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}