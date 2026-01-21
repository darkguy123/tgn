
'use client';

import { useMemo } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, runTransaction, updateDoc, arrayUnion } from 'firebase/firestore';
import type { FriendRequest, TGNMember } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import Link from 'next/link';

function RequestItem({ request }: { request: FriendRequest & { id: string } }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: currentUser } = useUser();

  const senderRef = useMemoFirebase(() => doc(firestore, 'users', request.senderId), [firestore, request.senderId]);
  const { data: sender, isLoading: isSenderLoading } = useDoc<TGNMember>(senderRef);

  const handleAccept = async () => {
    if (!currentUser) return;
    const requestRef = doc(firestore, 'friend_requests', request.id);
    const currentUserRef = doc(firestore, 'users', currentUser.uid);
    const senderRef = doc(firestore, 'users', request.senderId);

    try {
      await runTransaction(firestore, async (transaction) => {
        const reqDoc = await transaction.get(requestRef);
        if (!reqDoc.exists() || reqDoc.data().status !== 'pending') {
          throw new Error("This request is no longer valid.");
        }
        transaction.update(requestRef, { status: 'accepted' });
        transaction.update(currentUserRef, { connections: arrayUnion(request.senderId) });
        transaction.update(senderRef, { connections: arrayUnion(currentUser.uid) });
      });
      toast({ title: "Connection accepted!" });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Failed to accept request.' });
    }
  };

  const handleDecline = async () => {
    const requestRef = doc(firestore, 'friend_requests', request.id);
    try {
      await updateDoc(requestRef, { status: 'declined' });
      toast({ title: 'Request declined.' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to decline request.' });
    }
  };

  if (isSenderLoading) {
    return <DropdownMenuItem className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> <span>Loading...</span></DropdownMenuItem>;
  }

  if (!sender) return null;

  return (
    <DropdownMenuItem className="flex justify-between items-center p-2" onSelect={(e) => e.preventDefault()}>
      <Link href={`/member/${sender.tgnMemberId || sender.id}`} className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={sender.avatarUrl} />
          <AvatarFallback>{sender.name ? sender.name.charAt(0) : sender.email.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <p className="font-semibold">{sender.name || sender.email.split('@')[0]}</p>
          <p className="text-xs text-muted-foreground">Wants to connect</p>
        </div>
      </Link>
      <div className="flex gap-1">
        <Button size="icon" className="h-8 w-8 bg-green-500 hover:bg-green-600" onClick={handleAccept}><UserPlus className="h-4 w-4" /></Button>
        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={handleDecline}><X className="h-4 w-4" /></Button>
      </div>
    </DropdownMenuItem>
  );
}

export function NotificationsMenu() {
  const { user } = useUser();
  const firestore = useFirestore();

  const requestsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, 'friend_requests'), where('recipientId', '==', user.uid), where('status', '==', 'pending')) : null,
    [user, firestore]
  );
  
  const { data: requests, isLoading } = useCollection<FriendRequest>(requestsQuery);

  if (isLoading) {
    return <div className="p-2"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>;
  }
  
  return (
    <>
      <DropdownMenuLabel>Connection Requests</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {requests && requests.length > 0 ? (
        requests.map(req => <RequestItem key={req.id} request={req} />)
      ) : (
        <p className="p-4 text-sm text-center text-muted-foreground">No pending requests.</p>
      )}
    </>
  );
}
