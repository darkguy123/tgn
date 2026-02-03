'use client';
import { useMemo } from 'react';
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
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError, useUser } from '@/firebase';
import { collectionGroup, doc, updateDoc, query, where, runTransaction, collection } from 'firebase/firestore';
import type { Transaction, TGNMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemberProfile } from '@/hooks/useMemberProfile';


export default function AdminWithdrawalsPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { profile } = useMemberProfile();
  const { toast } = useToast();

  const withdrawalsQuery = useMemoFirebase(() => 
    (firestore && currentUser && profile) 
      ? query(collectionGroup(firestore, 'transactions'), where('type', '==', 'withdrawal'), where('status', '==', 'pending')) 
      : null,
    [firestore, currentUser, profile]
  );
  const { data: withdrawals, isLoading: withdrawalsLoading } = useCollection<Transaction>(withdrawalsQuery);

  const usersQuery = useMemoFirebase(() => (firestore && currentUser && profile ? collection(firestore, 'users') : null), [firestore, currentUser, profile]);
  const { data: users, isLoading: usersLoading } = useCollection<TGNMember>(usersQuery);

  const usersMap = useMemo(() => {
    if (!users) return new Map<string, TGNMember>();
    return users.reduce((acc, user) => {
      acc.set(user.id, user);
      return acc;
    }, new Map<string, TGNMember>());
  }, [users]);
  
  const isLoading = withdrawalsLoading || usersLoading;

  const handleUpdateStatus = (transaction: Transaction, status: 'completed' | 'failed') => {
    if (!firestore || !transaction.memberId) return;

    const transactionDocRef = doc(firestore, 'users', transaction.memberId, 'transactions', transaction.id);
    const walletDocRef = doc(firestore, 'wallets', transaction.memberId);

    const updateData = { status };

    if (status === 'completed') {
      runTransaction(firestore, async (tx) => {
        const walletDoc = await tx.get(walletDocRef);
        if (!walletDoc.exists()) {
          throw new Error("Wallet not found for user.");
        }
        // Amount is negative, so we add it to reduce the balance.
        const newBalance = walletDoc.data().balance + transaction.amount;
        if (newBalance < 0) {
          throw new Error("Withdrawal amount exceeds available balance. Transaction cannot be completed.");
        }
        tx.update(walletDocRef, { balance: newBalance });
        tx.update(transactionDocRef, updateData);
      }).then(() => {
        toast({
          title: 'Withdrawal Approved',
          description: `The withdrawal has been marked as completed.`,
        });
      }).catch((e: any) => {
        console.error("Approval failed:", e);
        toast({ variant: 'destructive', title: 'Approval Failed', description: e.message || 'An error occurred.' });
      });
    } else { // 'failed'
       updateDoc(transactionDocRef, updateData).then(() => {
        toast({
          variant: 'destructive',
          title: 'Withdrawal Rejected',
          description: `The withdrawal has been marked as failed.`,
        });
       }).catch((serverError) => {
        console.error("Failed to reject withdrawal: ", serverError);
        const permissionError = new FirestorePermissionError({
          path: transactionDocRef.path,
          operation: 'update',
          requestResourceData: { status: 'failed' }
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'You do not have permission to perform this action.',
        });
       });
    }
  };

  const renderTable = (withdrawalsList: Transaction[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Bank Details</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && Array.from({length: 3}).map((_, i) => (
            <TableRow key={i}>
                {Array.from({length: 5}).map((_, j) => <TableCell key={j}><Skeleton className="h-6 w-full"/></TableCell>)}
            </TableRow>
        ))}
        {!isLoading && withdrawalsList.map(tx => {
          const user = usersMap.get(tx.memberId || '');
          return (
            <TableRow key={tx.id}>
              <TableCell>
                {user ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{user.name || user.email.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground font-mono">{user.tgnMemberId}</p>
                    </div>
                  </div>
                ) : (
                  <span className="font-mono text-xs">{tx.memberId}</span>
                )}
              </TableCell>
              <TableCell className="font-medium text-lg">${(tx.amount * -1).toFixed(2)}</TableCell>
              <TableCell>
                <p className="font-semibold">{tx.bankDetails?.bankName}</p>
                <p className="text-xs text-muted-foreground">{tx.bankDetails?.accountNumber}</p>
              </TableCell>
              <TableCell>{tx.createdAt?.toDate ? formatDistanceToNow(tx.createdAt.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(tx, 'completed')}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(tx, 'failed')}>
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {!isLoading && withdrawalsList.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
              No pending withdrawal requests.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Withdrawal Requests</h1>
          <p className="text-muted-foreground">
            Approve or reject member withdrawal requests.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Pending Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {renderTable(withdrawals || [])}
        </CardContent>
      </Card>
    </div>
  );
}