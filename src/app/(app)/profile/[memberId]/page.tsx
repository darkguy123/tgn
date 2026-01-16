'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Mail,
  MoreHorizontal,
  Send,
  Gift,
  CheckCircle2,
  Award,
  Star,
  Briefcase,
  ThumbsUp,
  MessageSquare,
  UserPlus,
  Clock,
  UserCheck,
  Loader2,
  Trash2,
  Check
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDoc, useFirestore, useMemoFirebase, useCollection, useUser } from '@/firebase';
import { collection, doc, query, where, orderBy, addDoc, serverTimestamp, runTransaction, arrayUnion, arrayRemove, deleteDoc, updateDoc } from 'firebase/firestore';
import type { TGNMember, MentorCertification, Post, FriendRequest } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useToast } from '@/hooks/use-toast';

// Simplified post card for profile page
function ProfilePostCard({ post }: { post: Post }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={post.authorAvatarUrl} />
                      <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold">{post.authorName}</h4>
                                <p className="text-xs text-muted-foreground">
                                    {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                                </p>
                            </div>
                             <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>
                        </div>
                        <p className="text-sm mt-2 whitespace-pre-wrap">{post.content}</p>
                        <div className="flex items-center gap-4 text-muted-foreground text-sm mt-4">
                            <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4"/> {post.likes}
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4"/> {post.commentsCount}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useUser();
  const { profile: currentUserProfile } = useMemberProfile();
  const memberId = params.memberId as string;
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data Fetching
  const memberRef = useMemoFirebase(() => doc(firestore, 'users', memberId), [firestore, memberId]);
  const certRef = useMemoFirebase(() => doc(firestore, 'mentor_certifications', memberId), [firestore, memberId]);
  const postsQuery = useMemoFirebase(() => query(collection(firestore, 'posts'), where('authorId', '==', memberId), orderBy('createdAt', 'desc')), [firestore, memberId]);
  
  const { data: member, isLoading: isMemberLoading, error: memberError } = useDoc<TGNMember>(memberRef);
  const { data: certification, isLoading: isCertLoading } = useDoc<MentorCertification>(certRef);
  const { data: posts, isLoading: arePostsLoading } = useCollection<Post>(postsQuery);

  // Connection Status Logic
  const sentRequestQuery = useMemoFirebase(() => (currentUser?.uid && memberId) ? query(collection(firestore, 'friend_requests'), where('senderId', '==', currentUser.uid), where('recipientId', '==', memberId)) : null, [firestore, currentUser, memberId]);
  const { data: sentRequests, isLoading: sentLoading } = useCollection<FriendRequest>(sentRequestQuery);
  const receivedRequestQuery = useMemoFirebase(() => (currentUser?.uid && memberId) ? query(collection(firestore, 'friend_requests'), where('senderId', '==', memberId), where('recipientId', '==', currentUser.uid)) : null, [firestore, currentUser, memberId]);
  const { data: receivedRequests, isLoading: receivedLoading } = useCollection<FriendRequest>(receivedRequestQuery);

  const { connectionStatus, friendRequestId } = useMemo(() => {
    if (currentUserProfile?.connections?.includes(memberId)) return { connectionStatus: 'connected' };
    const sentPending = sentRequests?.find(r => r.status === 'pending');
    if (sentPending) return { connectionStatus: 'pending', friendRequestId: sentPending.id };
    const receivedPending = receivedRequests?.find(r => r.status === 'pending');
    if (receivedPending) return { connectionStatus: 'accept', friendRequestId: receivedPending.id };
    return { connectionStatus: 'none' };
  }, [currentUserProfile?.connections, sentRequests, receivedRequests, memberId]);

  const isLoading = isMemberLoading || isCertLoading || arePostsLoading || sentLoading || receivedLoading;

  // Actions
  const handleConnect = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'friend_requests'), {
        senderId: currentUser.uid,
        recipientId: memberId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast({ title: "Connection request sent!" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send request." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!friendRequestId || !currentUser || !member) return;
    setIsSubmitting(true);
    const requestRef = doc(firestore, 'friend_requests', friendRequestId);
    const currentUserRef = doc(firestore, 'users', currentUser.uid);
    try {
        await runTransaction(firestore, async (transaction) => {
            const reqDoc = await transaction.get(requestRef);
            if (!reqDoc.exists() || reqDoc.data().status !== 'pending') {
              throw new Error("This request is no longer valid.");
            }
            transaction.update(requestRef, { status: 'accepted' });
            transaction.update(currentUserRef, { connections: arrayUnion(member.id) });
        });
        toast({ title: "Connection accepted!" });
    } catch (e: any) {
        toast({ variant: 'destructive', title: "Error", description: e.message || "Failed to accept request." });
    } finally {
        setIsSubmitting(false);
    }
  };
  
   const handleDeclineRequest = async () => {
    if (!friendRequestId) return;
    setIsSubmitting(true);
    const requestRef = doc(firestore, 'friend_requests', friendRequestId);
    try {
      await updateDoc(requestRef, { status: 'declined' });
      toast({ title: "Connection request declined." });
    } catch (e) {
      toast({ variant: 'destructive', title: "Error", description: "Failed to decline request." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6 pt-20 relative">
                    <Skeleton className="absolute -top-16 left-6 h-32 w-32 rounded-full border-4 border-card" />
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                </div>
            </Card>
            <Skeleton className="h-64 w-full" />
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (memberError || !member) {
    return notFound();
  }
  
  const name = member.name || member.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const renderActionButtons = () => {
    if (currentUser?.uid === memberId) {
        return <Button onClick={() => router.push('/settings/profile')}>Edit Profile</Button>;
    }
    
    switch (connectionStatus) {
        case 'connected':
            return (
                <>
                    <Button asChild><Link href={`/chat/${member.id}`}><Mail className="mr-2 h-4 w-4" /> Message</Link></Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><MoreHorizontal /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Remove Connection</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </>
            );
        case 'pending':
            return <Button variant="outline" disabled><Clock className="mr-2 h-4 w-4" /> Pending</Button>;
        case 'accept':
            return (
                <>
                    <Button onClick={handleAcceptRequest} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
                        Accept
                    </Button>
                    <Button variant="outline" onClick={handleDeclineRequest} disabled={isSubmitting}>Decline</Button>
                </>
            );
        default:
            return <Button onClick={handleConnect} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserPlus className="mr-2 h-4 w-4" />}
                Connect
            </Button>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <main className="lg:col-span-2 space-y-6">
        <Card className="overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1557683316-9ca2a4f4e427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxhYnN0cmFjdCUyMGJsdWV8ZW58MHx8fHwxNzE3Nzc4MDUwfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Profile banner" width={1200} height={300} className="h-48 w-full object-cover" data-ai-hint="abstract blue"
            />
          <div className="relative">
            <div className="p-6 pt-20 flex flex-col md:flex-row justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{name}</h1>
                  <p className="text-muted-foreground capitalize">{member.role.replace('-', ' ')}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{member.locationCountry}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0 shrink-0">
                    {renderActionButtons()}
                </div>
            </div>
             <Avatar className="absolute -top-16 left-6 h-32 w-32 rounded-full border-4 border-card">
              <AvatarImage src={member.avatarUrl} alt={name} />
              <AvatarFallback className="text-4xl">{name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </Card>

        <Card>
            <CardHeader><CardTitle>About</CardTitle></CardHeader>
            <CardContent><p className="text-foreground/90">{member.purpose || 'No bio provided.'}</p></CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Activity</h2>
          {arePostsLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : posts && posts.length > 0 ? (
            posts.map(post => <ProfilePostCard key={post.id} post={post} />)
          ) : (
            <Card><CardContent className="p-6 text-center text-muted-foreground">{name} hasn't posted anything yet.</CardContent></Card>
          )}
        </div>
      </main>

      <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
        {certification && (
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" />Achievements</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">{certification.isCertified ? <CheckCircle2 /> : <Award />}</div>
                        <div>
                            <p className="font-semibold">{certification.isCertified ? 'TGN Certified Mentor' : 'Not Yet Certified'}</p>
                            <p className="text-xs text-muted-foreground">{certification.isCertified ? `Earned ${certification.certificationDate ? new Date(certification.certificationDate).toLocaleDateString() : ''}`: 'Keep making progress!'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-accent/10 text-accent"><Star /></div>
                        <div>
                            <p className="font-semibold">Mentee Badge Level</p>
                            <p className="text-xs text-muted-foreground">Current level: {certification.menteeBadgeLevel}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}
        {member.sectorPreferences && member.sectorPreferences.length > 0 && (
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" />Sectors</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {member.sectorPreferences.map(sector => (
                        <Badge key={sector} variant="secondary">{sector}</Badge>
                    ))}
                </CardContent>
            </Card>
        )}
      </aside>
    </div>
  );
}
