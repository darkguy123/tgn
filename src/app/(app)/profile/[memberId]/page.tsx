'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BookOpen,
  Activity,
  FileText,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, query, where, orderBy } from 'firebase/firestore';
import type { TGNMember, MentorCertification, Post } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

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
  const memberId = params.memberId as string;
  const firestore = useFirestore();

  // Fetch Member Profile
  const memberRef = useMemoFirebase(
    () => (memberId ? doc(firestore, 'users', memberId) : null),
    [firestore, memberId]
  );
  const { data: member, isLoading: isMemberLoading, error: memberError } = useDoc<TGNMember>(memberRef);
  
  // Fetch Member Certification
  const certRef = useMemoFirebase(
    () => (memberId ? doc(firestore, 'mentor_certifications', memberId) : null),
    [firestore, memberId]
  );
  const { data: certification, isLoading: isCertLoading } = useDoc<MentorCertification>(certRef);

  // Fetch Member Posts
  const postsQuery = useMemoFirebase(
    () => memberId ? query(collection(firestore, 'posts'), where('authorId', '==', memberId), orderBy('createdAt', 'desc')) : null,
    [firestore, memberId]
  );
  const { data: posts, isLoading: arePostsLoading } = useCollection<Post>(postsQuery);

  const isLoading = isMemberLoading || isCertLoading || arePostsLoading;
  
  if (isMemberLoading) { // Initial skeleton based on member loading
    return (
        <Card className="overflow-hidden">
            <div className="relative">
                <Skeleton className="h-48 w-full" />
                <div className="absolute -bottom-16 left-6">
                    <Skeleton className="h-32 w-32 rounded-full border-4 border-card" />
                </div>
            </div>
            <div className="flex justify-end p-4 pt-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>
             <CardContent className="pt-0 pb-6 px-6 mt-4">
                 <Skeleton className="h-7 w-48" />
                 <Skeleton className="h-4 w-32 mt-2" />
                 <Skeleton className="h-4 w-full mt-4" />
                 <Skeleton className="h-4 w-2/3 mt-2" />
             </CardContent>
        </Card>
    )
  }

  if (memberError || !member) {
    return notFound();
  }
  
  const name = member.name || member.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        {/* Banner and Avatar */}
        <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1557683316-9ca2a4f4e427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxhYnN0cmFjdCUyMGJsdWV8ZW58MHx8fHwxNzE3Nzc4MDUwfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Profile banner"
              width={1200}
              height={300}
              className="h-48 w-full object-cover"
              data-ai-hint="abstract blue"
            />
          <div className="absolute -bottom-16 left-6">
            <Avatar className="h-32 w-32 rounded-full border-4 border-card">
              <AvatarImage src={member.avatarUrl} alt={name} />
              <AvatarFallback className="text-4xl">
                {name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="flex justify-end p-4 pt-4">
          <div className="flex items-center gap-2">
             <Button asChild>
                <Link href={`/wallet?recipient=${member.tgnMemberId}`}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Money
                </Link>
            </Button>
            <Button asChild variant="outline">
               <Link href={`/chat/${member.id}`}>
                <Mail className="mr-2 h-4 w-4" />
                Message
               </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Gift className="mr-2 h-4 w-4" />
                  Send Gift
                </DropdownMenuItem>
                <DropdownMenuItem>Report User</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Profile Info */}
        <CardContent className="pt-0 pb-6 px-6">
          <div className="mt-4">
            <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{name}</h1>
                <Badge variant="secondary" className="capitalize">{member.role.replace('-', ' ')}</Badge>
                {member.isVerifiedMentor && (
                    <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 gap-1.5 pl-2 pr-3">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified
                    </Badge>
                )}
            </div>
            <p className="text-sm text-muted-foreground">@{member.tgnMemberId}</p>
          </div>

          <p className="mt-4 text-foreground/90">{member.purpose || 'No bio provided.'}</p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{member.locationCountry}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              <span>{member.email}</span>
            </div>
          </div>
        </CardContent>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="px-6 border-b-0 rounded-none w-full justify-start bg-transparent">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="posts">Posts ({posts?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="p-6 pt-4">
            <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
            <div className="border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                No recent activity to show.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="p-6 pt-4">
             {isCertLoading && <Skeleton className="h-48 w-full" />}
             {!isCertLoading && certification && (
                 <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-primary" />
                                Certification Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            {certification.isCertified ? (
                                <>
                                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
                                    <p className="font-bold text-lg">TGN Certified Mentor</p>
                                    <p className="text-sm text-muted-foreground">
                                        Certified on {certification.certificationDate ? new Date(certification.certificationDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </>
                            ) : (
                                <>
                                     <p className="text-muted-foreground py-8">Not yet a certified mentor.</p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-primary" />
                                Mentee Badge
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-6xl font-bold text-accent">★ {certification.menteeBadgeLevel}</p>
                            <p className="text-sm text-muted-foreground">Current badge level</p>
                        </CardContent>
                    </Card>
                 </div>
             )}
              {!isCertLoading && !certification && (
                <div className="border rounded-lg p-6 text-center">
                  <p className="text-muted-foreground">No achievement data available.</p>
                </div>
              )}
          </TabsContent>

          <TabsContent value="posts" className="p-6 pt-4 space-y-4">
             {arePostsLoading && <Skeleton className="h-48 w-full" />}
             {!arePostsLoading && posts && posts.length > 0 ? (
                posts.map(post => <ProfilePostCard key={post.id} post={post} />)
             ) : (
                <div className="border rounded-lg p-6 text-center">
                    <p className="text-muted-foreground">
                        {name} hasn't posted anything yet.
                    </p>
                </div>
             )}
          </TabsContent>

        </Tabs>
      </Card>
    </div>
  );
}
