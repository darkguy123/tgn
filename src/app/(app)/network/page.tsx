'use client';
import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, Mail, UserX, UserCheck, Clock, Loader2, Users } from 'lucide-react';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useUser, useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, doc, runTransaction, arrayUnion, arrayRemove, deleteDoc, updateDoc, documentId } from 'firebase/firestore';
import type { TGNMember, FriendRequest } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Component for a single connection item
function ConnectionItem({ member, onRemove }: { member: TGNMember, onRemove: (memberId: string) => void }) {
  const router = useRouter();
  const name = member.name || member.email.split('@')[0];
  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg">
      <Link href={`/member/${member.tgnMemberId || member.id}`} className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={member.avatarUrl} alt={name} />
          <AvatarFallback>{name ? name.charAt(0) : 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{member.role.replace('-', ' ')}</p>
        </div>
      </Link>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => router.push(`/chat/${member.id}`)}><Mail className="mr-2 h-4 w-4" /> Message</Button>
        <Button size="sm" variant="destructive" onClick={() => onRemove(member.id)}><UserX className="mr-2 h-4 w-4" /> Remove</Button>
      </div>
    </div>
  );
}

// Component for a single request item
function RequestItem({ request, type, onAction }: { request: FriendRequest & { userProfile: TGNMember }, type: 'received' | 'sent', onAction: (requestId: string, action: 'accept' | 'decline' | 'cancel') => void }) {
  const { userProfile } = request;
  const name = userProfile.name || userProfile.email.split('@')[0];
  return (
    <div className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg">
       <Link href={`/member/${userProfile.tgnMemberId || userProfile.id}`} className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={userProfile.avatarUrl} alt={name} />
          <AvatarFallback>{name ? name.charAt(0) : 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{userProfile.role.replace('-', ' ')}</p>
        </div>
      </Link>
      <div className="flex gap-2">
        {type === 'received' && (
          <>
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onAction(request.id, 'accept')}><UserCheck className="mr-2 h-4 w-4" /> Accept</Button>
            <Button size="sm" variant="ghost" onClick={() => onAction(request.id, 'decline')}><UserX className="mr-2 h-4 w-4" /> Decline</Button>
          </>
        )}
        {type === 'sent' && (
          <Button size="sm" variant="outline" onClick={() => onAction(request.id, 'cancel')}><Clock className="mr-2 h-4 w-4" /> Cancel Request</Button>
        )}
      </div>
    </div>
  );
}


export default function NetworkPage() {
    const { user: currentUser } = useUser();
    const { profile: currentUserProfile, isLoading: isProfileLoading } = useMemberProfile();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- DATA QUERIES ---
    
    // 1. Get IDs of current connections
    const connectionIds = useMemo(() => currentUserProfile?.connections || [], [currentUserProfile]);
    
    // 2. Fetch profiles for current connections
    const connectionsQuery = useMemoFirebase(() =>
        connectionIds.length > 0
            ? query(collection(firestore, 'users'), where(documentId(), 'in', connectionIds))
            : null,
        [connectionIds, firestore]
    );
    const { data: connections, isLoading: connectionsLoading } = useCollection<TGNMember>(connectionsQuery);

    const filteredConnections = useMemo(() => {
        if (!connections) return [];
        return connections.filter(member => {
            const name = member.name || member.email.split('@')[0];
            const role = member.role || '';
            return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   role.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [connections, searchQuery]);

    // 3. Fetch incoming friend requests
    const receivedRequestsQuery = useMemoFirebase(() =>
        currentUser ? query(collection(firestore, 'friend_requests'), where('recipientId', '==', currentUser.uid), where('status', '==', 'pending')) : null,
        [currentUser, firestore]
    );
    const { data: receivedRequests, isLoading: receivedLoading } = useCollection<FriendRequest>(receivedRequestsQuery);

    // 4. Fetch outgoing friend requests
    const sentRequestsQuery = useMemoFirebase(() =>
        currentUser ? query(collection(firestore, 'friend_requests'), where('senderId', '==', currentUser.uid), where('status', '==', 'pending')) : null,
        [currentUser, firestore]
    );
    const { data: sentRequests, isLoading: sentLoading } = useCollection<FriendRequest>(sentRequestsQuery);

    // 5. Get user IDs from all requests to fetch their profiles
    const requestUserIds = useMemo(() => {
        const ids = new Set<string>();
        receivedRequests?.forEach(req => ids.add(req.senderId));
        sentRequests?.forEach(req => ids.add(req.recipientId));
        return Array.from(ids);
    }, [receivedRequests, sentRequests]);

    // 6. Fetch profiles for users in requests
    const requestUsersQuery = useMemoFirebase(() =>
        requestUserIds.length > 0 ? query(collection(firestore, 'users'), where(documentId(), 'in', requestUserIds)) : null,
        [requestUserIds, firestore]
    );
    const { data: requestUsers, isLoading: requestUsersLoading } = useCollection<TGNMember>(requestUsersQuery);

    const requestUsersMap = useMemo(() => {
        const map = new Map<string, TGNMember>();
        requestUsers?.forEach(u => map.set(u.id, u));
        return map;
    }, [requestUsers]);

    const isLoading = isProfileLoading || connectionsLoading || receivedLoading || sentLoading || requestUsersLoading;

    // --- ACTIONS ---

    const handleAction = async (requestId: string, action: 'accept' | 'decline' | 'cancel') => {
        if (!currentUser) return;
        setIsSubmitting(requestId);
        const requestRef = doc(firestore, 'friend_requests', requestId);
    
        try {
            if (action === 'accept') {
                await runTransaction(firestore, async (transaction) => {
                    const reqDoc = await transaction.get(requestRef);
                    if (!reqDoc.exists() || reqDoc.data().status !== 'pending') throw new Error("Request no longer valid.");
                    
                    const senderId = reqDoc.data().senderId;
                    const recipientRef = doc(firestore, 'users', currentUser.uid);
                    const senderRef = doc(firestore, 'users', senderId);

                    transaction.update(requestRef, { status: 'accepted' });
                    transaction.update(recipientRef, { connections: arrayUnion(senderId) });
                    transaction.update(senderRef, { connections: arrayUnion(currentUser.uid) });
                });
                toast({ title: "Connection accepted!" });

            } else if (action === 'decline') {
                await updateDoc(requestRef, { status: 'declined' });
                toast({ title: "Request declined" });
            } else if (action === 'cancel') {
                await deleteDoc(requestRef);
                toast({ title: "Request cancelled" });
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: "Error", description: e.message || `Failed to ${action} request.` });
        } finally {
            setIsSubmitting(null);
        }
    };
    
    const handleRemove = async (memberIdToRemove: string) => {
        if (!currentUser || !window.confirm("Are you sure you want to remove this connection?")) return;
        setIsSubmitting(memberIdToRemove);

        const currentUserRef = doc(firestore, 'users', currentUser.uid);
        const memberToRemoveRef = doc(firestore, 'users', memberIdToRemove);

        try {
            await runTransaction(firestore, async (transaction) => {
                transaction.update(currentUserRef, { connections: arrayRemove(memberIdToRemove) });
                transaction.update(memberToRemoveRef, { connections: arrayRemove(currentUser.uid) });
            });
            toast({ title: "Connection removed." });
        } catch (e) {
            toast({ variant: 'destructive', title: "Error", description: "Failed to remove connection." });
        } finally {
            setIsSubmitting(null);
        }
    };
    

    const renderEmptyState = (title: string, description: string) => (
        <div className="text-center py-16 text-muted-foreground">
            <Users className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-medium">{title}</h3>
            <p className="mt-1 text-sm">{description}</p>
        </div>
    );
    
    const renderSkeleton = () => (
        <div className="space-y-3 p-3">
            {Array.from({ length: 3 }).map((_, i) => (
                 <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
             <header>
                <h1 className="text-3xl font-bold tracking-tight">My Network</h1>
                <p className="text-muted-foreground">Manage your connections and pending requests.</p>
            </header>

            <Card>
                <Tabs defaultValue="connections">
                    <CardHeader className="flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <TabsList>
                            <TabsTrigger value="connections">Connections ({connections?.length || 0})</TabsTrigger>
                            <TabsTrigger value="received">Received ({receivedRequests?.length || 0})</TabsTrigger>
                            <TabsTrigger value="sent">Sent ({sentRequests?.length || 0})</TabsTrigger>
                        </TabsList>
                        <div className="w-full md:w-auto flex gap-2">
                             <div className="relative flex-1 md:flex-initial">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search connections..." 
                                    className="pl-10" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button onClick={() => router.push('/directory')}>Find Members</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <TabsContent value="connections">
                            {isLoading ? renderSkeleton() : filteredConnections && filteredConnections.length > 0
                                ? <div className="space-y-2">{filteredConnections.map(c => <ConnectionItem key={c.id} member={c} onRemove={handleRemove}/>)}</div>
                                : renderEmptyState(
                                    searchQuery ? "No Connections Found" : "No Connections Yet", 
                                    searchQuery ? "No connections match your search." : "Use the directory to find and connect with members."
                                )
                            }
                        </TabsContent>
                        <TabsContent value="received">
                             {isLoading ? renderSkeleton() : receivedRequests && receivedRequests.length > 0
                                ? <div className="space-y-2">{receivedRequests.map(req => {
                                    const sender = requestUsersMap.get(req.senderId);
                                    return sender ? <RequestItem key={req.id} request={{...req, userProfile: sender}} type="received" onAction={handleAction}/> : null;
                                  })}</div>
                                : renderEmptyState("No Pending Requests", "You have no new connection requests.")
                            }
                        </TabsContent>
                        <TabsContent value="sent">
                            {isLoading ? renderSkeleton() : sentRequests && sentRequests.length > 0
                                ? <div className="space-y-2">{sentRequests.map(req => {
                                    const recipient = requestUsersMap.get(req.recipientId);
                                    return recipient ? <RequestItem key={req.id} request={{...req, userProfile: recipient}} type="sent" onAction={handleAction}/> : null;
                                  })}</div>
                                : renderEmptyState("No Sent Requests", "Your sent connection requests will appear here.")
                            }
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>

        </div>
    );
}
