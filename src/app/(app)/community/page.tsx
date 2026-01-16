'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  LayoutGrid,
  Users,
  Calendar,
  Image as ImageIcon,
  ShoppingBag,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { Separator } from '@/components/ui/separator';
import type { Post, Comment as CommentType } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, updateDoc, doc, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const communityNavItems = [
  { label: 'Feed', icon: LayoutGrid, path: '/community' },
  { label: 'Directory', icon: Users, path: '/directory' },
  { label: 'Events', icon: Calendar, path: '/community/events' },
  { label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
];

const postSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty.').max(500, 'Post content is too long.'),
});

type PostFormData = z.infer<typeof postSchema>;

function CreatePostDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { profile } = useMemberProfile();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const handlePostSubmit = (data: PostFormData) => {
    if (!profile || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to post.' });
      return;
    }
    
    const postsCollection = collection(firestore, 'posts');
    const dataToSave = {
      content: data.content,
      authorId: profile.id,
      authorName: profile.name || profile.email.split('@')[0],
      authorAvatarUrl: profile.avatarUrl,
      authorRole: profile.role,
      likes: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
    };

    addDoc(postsCollection, dataToSave)
      .then(() => {
        toast({ title: 'Success', description: 'Your post has been published.' });
        reset();
        onOpenChange(false);
      })
      .catch((error) => {
        console.error("Error creating post: ", error);
        const permissionError = new FirestorePermissionError({
            path: postsCollection.path,
            operation: 'create',
            requestResourceData: dataToSave
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to publish your post.' });
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
          <DialogDescription>Share your thoughts with the community.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handlePostSubmit)}>
          <div className="py-4 space-y-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={profile?.avatarUrl} />
                <AvatarFallback>{profile?.email.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="What's on your mind?"
                  className="min-h-[120px] resize-none"
                  {...register('content')}
                />
                {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
              </div>
            </div>
            <div className="flex gap-2 text-muted-foreground">
                <Button variant="ghost" size="icon" type="button"><ImageIcon /></Button>
                <Button variant="ghost" size="icon" type="button"><Calendar /></Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PostComments({ post }: { post: Post }) {
  const { profile } = useMemberProfile();
  const firestore = useFirestore();
  const { toast } = useToast();

  const commentsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'posts', post.id, 'comments'), orderBy('createdAt', 'asc')) : null,
    [firestore, post.id]
  );
  const { data: comments, isLoading: commentsLoading } = useCollection<CommentType>(commentsQuery);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ content: string }>();

  const handleCommentSubmit = (data: { content: string }) => {
    if (!profile || !firestore || !data.content.trim()) return;

    const postRef = doc(firestore, 'posts', post.id);
    const commentsColRef = collection(postRef, 'comments');
    const dataToSave = {
        content: data.content,
        authorId: profile.id,
        authorName: profile.name || profile.email.split('@')[0],
        authorAvatarUrl: profile.avatarUrl,
        createdAt: serverTimestamp(),
    };
    
    addDoc(commentsColRef, dataToSave)
      .then(() => {
        // Optimistically update comments count, but a transaction would be better
        updateDoc(postRef, { commentsCount: increment(1) });
        reset();
      })
      .catch((e) => {
        console.error("Error submitting comment: ", e);
        const permissionError = new FirestorePermissionError({
            path: commentsColRef.path,
            operation: 'create',
            requestResourceData: dataToSave
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not post your comment.'})
      });
  };

  return (
    <div className="pt-4 mt-4 border-t">
      <form onSubmit={handleSubmit(handleCommentSubmit)} className="flex items-start gap-3 mb-6">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.avatarUrl} />
          <AvatarFallback>{profile?.email.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
            <Textarea 
                placeholder="Write a comment..." 
                className="bg-muted border-none min-h-[40px]"
                {...register('content', { required: true })}
            />
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
        </div>
      </form>

      <div className="space-y-4">
        {commentsLoading && <p className="text-sm text-muted-foreground">Loading comments...</p>}
        {comments?.map(comment => (
           <div key={comment.id} className="flex items-start gap-3">
             <Avatar className="h-8 w-8">
                <AvatarImage src={comment.authorAvatarUrl} />
                <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
             </Avatar>
             <div className="bg-muted p-3 rounded-lg flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{comment.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                        {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                    </p>
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
             </div>
           </div>
        ))}
        {!commentsLoading && comments?.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-4">Be the first to comment.</p>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const firestore = useFirestore();

  const handleLike = () => {
    if (!firestore) return;
    const postRef = doc(firestore, 'posts', post.id);
    // Non-blocking update for likes
    updateDoc(postRef, { likes: increment(1) })
      .catch((error) => {
        console.error("Error liking post: ", error);
        const permissionError = new FirestorePermissionError({
            path: postRef.path,
            operation: 'update',
            requestResourceData: { likes: increment(1) }
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={post.authorAvatarUrl} />
              <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/profile/${post.authorId}`}>
                <h4 className="font-semibold hover:underline">{post.authorName}</h4>
              </Link>
              <p className="text-xs text-muted-foreground">
                {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'just now'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className={`grid gap-2 grid-cols-${post.imageUrls.length > 1 ? 2 : 1} mb-4`}>
            {post.imageUrls.map(imageUrl => (
                <Image
                  key={imageUrl}
                  src={imageUrl}
                  alt="Post image"
                  width={400}
                  height={300}
                  className="rounded-lg object-cover w-full aspect-[4/3]"
                />
              ))}
          </div>
        )}
        <Collapsible>
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                    {post.likes > 0 && (
                        <>
                        <ThumbsUp className="h-4 w-4 text-blue-500" />
                        <span>{Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(post.likes || 0)}</span>
                        </>
                    )}
                </div>
                 <CollapsibleTrigger asChild>
                    <button className="hover:underline">{(post.commentsCount || 0)} Comments</button>
                 </CollapsibleTrigger>
            </div>
            <Separator className="mb-2" />
            <div className="flex justify-around">
                 <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground" onClick={handleLike}>
                    <ThumbsUp className="h-5 w-5" /> Like
                </Button>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="h-5 w-5" /> Comment
                    </Button>
                </CollapsibleTrigger>
                <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                    <Share2 className="h-5 w-5" /> Share
                </Button>
                <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                    <Bookmark className="h-5 w-5" /> Save
                </Button>
            </div>
            <CollapsibleContent>
                <PostComments post={post} />
            </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}


export default function CommunityPage() {
  const { profile } = useMemberProfile();
  const [isCreatePostOpen, setCreatePostOpen] = useState(false);
  const firestore = useFirestore();

  const postsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'posts'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  
  const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);

  const renderPosts = (postList: Post[] | null) => {
    if (postsLoading) {
      return Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5 mb-4" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      ));
    }

    if (!postList || postList.length === 0) {
      return (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <p>No posts to show right now.</p>
            <p>Be the first one to share something!</p>
          </CardContent>
        </Card>
      );
    }

    return postList.map(post => <PostCard key={post.id} post={post} />);
  };

  const mentorsOnlyPosts = posts?.filter(post => post.authorRole.includes('mentor'));

  return (
    <>
      <CreatePostDialog open={isCreatePostOpen} onOpenChange={setCreatePostOpen} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 space-y-6 hidden lg:block">
          <Card>
            <CardContent className="p-4 text-center">
              {profile && (
                <>
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarImage src={profile.avatarUrl} />
                    <AvatarFallback>{profile.name ? profile.name.charAt(0) : profile.email.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold">{profile.name || profile.email.split('@')[0]}</h3>
                  <p className="text-sm text-muted-foreground">@{profile.tgnMemberId}</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2">
              <nav className="flex flex-col gap-1">
                {communityNavItems.map(item => (
                  <Button
                    key={item.label}
                    variant={item.label === 'Feed' ? 'secondary' : 'ghost'}
                    className="justify-start gap-3"
                    asChild
                  >
                    <Link href={item.path}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Feed */}
        <main className="lg:col-span-9 space-y-6">
          <Card>
             <CardContent className="p-4 flex items-center gap-3 border-b">
                <Avatar>
                    <AvatarImage src={profile?.avatarUrl} />
                    <AvatarFallback>{profile?.email.charAt(0)}</AvatarFallback>
                </Avatar>
                <button
                  className="w-full text-left h-12 px-4 rounded-full bg-muted border border-input hover:bg-muted/80 transition-colors text-muted-foreground text-sm"
                  onClick={() => setCreatePostOpen(true)}
                >
                    Start a post
                </button>
            </CardContent>
            <div className="p-2 flex justify-around">
                <Button variant="ghost" className="text-muted-foreground font-medium flex-1">
                    <ImageIcon className="mr-2" />
                    Media
                </Button>
                <Button variant="ghost" className="text-muted-foreground font-medium flex-1">
                    <Calendar className="mr-2" />
                    Event
                </Button>
                <Button variant="ghost" className="text-muted-foreground font-medium flex-1">
                    <ImageIcon className="mr-2" />
                    Write article
                </Button>
            </div>
          </Card>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/80">
              <TabsTrigger value="all">All Members</TabsTrigger>
              <TabsTrigger value="mentors">Mentors Only</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6 space-y-6">
              {renderPosts(posts)}
            </TabsContent>
            <TabsContent value="mentors" className="mt-6 space-y-6">
              {renderPosts(mentorsOnlyPosts || null)}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
