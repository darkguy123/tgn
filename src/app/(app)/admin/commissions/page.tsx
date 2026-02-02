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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Commission, TGNMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

export default function AdminCommissionsPage() {
  const firestore = useFirestore();
  
  const commissionsRef = useMemoFirebase(() => (firestore ? collection(firestore, 'commissions') : null), [firestore]);
  const { data: commissions, isLoading: commissionsLoading } = useCollection<Commission>(commissionsRef);

  const usersRef = useMemoFirebase(() => (firestore ? collection(firestore, 'users') : null), [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<TGNMember>(usersRef);

  const usersMap = useMemo(() => {
    if (!users) return new Map<string, TGNMember>();
    return users.reduce((acc, user) => {
      acc.set(user.id, user);
      return acc;
    }, new Map<string, TGNMember>());
  }, [users]);
  
  const isLoading = commissionsLoading || usersLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commission History</h1>
          <p className="text-muted-foreground">
            A complete log of all affiliate commissions paid out.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referrer</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Sale Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length: 5}).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                  <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                  <TableCell><Skeleton className="h-5 w-16"/></TableCell>
                  <TableCell><Skeleton className="h-5 w-16"/></TableCell>
                  <TableCell><Skeleton className="h-5 w-8"/></TableCell>
                  <TableCell><Skeleton className="h-5 w-20"/></TableCell>
                </TableRow>
              ))}

              {!isLoading && commissions?.map(commission => {
                const referrer = usersMap.get(commission.referrerId);
                const buyer = usersMap.get(commission.buyerId);
                return (
                  <TableRow key={commission.id}>
                    <TableCell>{referrer?.name || commission.referrerId}</TableCell>
                    <TableCell>{buyer?.name || commission.buyerId}</TableCell>
                    <TableCell>${commission.saleAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-green-600 font-medium">${commission.commissionAmount.toFixed(2)}</TableCell>
                    <TableCell>{commission.level}</TableCell>
                    <TableCell>{commission.createdAt?.toDate ? formatDistanceToNow(commission.createdAt.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
                  </TableRow>
                )
              })}

              {!isLoading && (!commissions || commissions.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No commissions have been generated yet.
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
