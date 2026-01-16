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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import placeholderImages from '@/lib/placeholder-images.json';
import {
  LayoutGrid,
  Users,
  Calendar,
  PlayCircle,
  Image as ImageIcon,
  FileText,
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
import type { Post } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

const communityNavItems = [
  { label: 'Feed', icon: LayoutGrid, path: '/community' },
  { label: 'Friends', icon: Users, path: '#' },
  { label: 'Event', icon: Calendar, path: '#' },
  { label: 'Watch Videos', icon: PlayCircle, path: '#' },
  { label: 'Photos', icon: ImageIcon, path: '#' },
  { label: 'Files', icon: FileText, path: '#' },
  { label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
];

const pagesYouLike = [
  { name: 'Football FC', initial: 'FF', color: 'bg-red-500', notifications: 120 },
  { name: 'Badminton Club', initial: 'BC', color: 'bg-blue-500' },
  { name: 'UI/UX Community', initial: 'UI', color: 'bg-purple-500' },
  { name: 'Web Designer', initial: 'WD', color: 'bg-green-500' },
];

const reels = [
  { author: 'Sarah Chen', imageId: 'product-2', views: '1.2M' },
  { author: 'David Okonkwo', imageId: 'product-4', views: '890K' },
  { author: 'Elena Rodriguez', imageId: 'program-global-business', views: '540K' },
  { author: 'James Chen', imageId: 'program-business-strategy', views: '320K' },
];

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find(p => p.id === imageId);
};

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

  const handlePostSubmit = async (data: PostFormData) => {
    if (!profile || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to post.' });
      return;
    }
    
    try {
      await addDoc(collection(firestore, 'posts'), {
        content: data.content,
        authorId: profile.id,
        authorName: profile.email.split('@')[0], // a better name would be stored in the profile
        authorImageId: profile.imageId || 'default-male-avatar',
        authorRole: profile.role,
        likes: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });

      toast({ title: 'Success', description: 'Your post has been published.' });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating post: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to publish your post.' });
    }
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
                <AvatarImage src={getImage(profile?.imageId || 'user-1')?.imageUrl} />
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


export default function CommunityPage() {
  const { profile } = useMemberProfile();
  const [isCreatePostOpen, setCreatePostOpen] = useState(false);
  const firestore = useFirestore();

  const postsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'posts'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  
  const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);

  const handleLike = async (post: Post) => {
    if (!firestore) return;
    const postRef = doc(firestore, 'posts', post.id);
    try {
      await updateDoc(postRef, {
        likes: (post.likes || 0) + 1,
      });
    } catch (error) {
      console.error("Error liking post: ", error)
    }
  }
  
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

    return postList.map(post => {
      const authorImage = getImage(post.authorImageId);
      return (
        <Card key={post.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-start gap-3">
                <Avatar>
                  {authorImage && <AvatarImage src={authorImage.imageUrl} />}
                  <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`#`}>
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
            {post.images && post.images.length > 0 && (
              <div className={`grid gap-2 grid-cols-${post.images.length > 1 ? 2 : 1} mb-4`}>
                {post.images.map(imgId => {
                  const img = getImage(imgId);
                  return img ? (
                    <Image
                      key={imgId}
                      src={img.imageUrl}
                      alt="Post image"
                      width={400}
                      height={300}
                      className="rounded-lg object-cover w-full aspect-[4/3]"
                      data-ai-hint={img.imageHint}
                    />
                  ) : null;
                })}
              </div>
            )}
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <div className="flex gap-4">
                <span>{post.commentsCount || 0} Comments</span>
                <span>
                  {Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(post.likes || 0)} Likes
                </span>
              </div>
            </div>
            <Separator className="mb-2" />
            <div className="flex justify-around">
              <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-5 w-5" /> Comment
              </Button>
              <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground" onClick={() => handleLike(post)}>
                <ThumbsUp className="h-5 w-5" /> Like
              </Button>
              <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                <Share2 className="h-5 w-5" /> Share
              </Button>
              <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                <Bookmark className="h-5 w-5" /> Save
              </Button>
            </div>
            <Separator className="mt-2" />
            <div className="mt-4 flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={getImage(profile?.imageId ?? 'user-1')?.imageUrl} />
                <AvatarFallback>{profile?.email.charAt(0)}</AvatarFallback>
              </Avatar>
              <Input placeholder="Write your comment..." className="h-10 rounded-full bg-muted border-none" />
            </div>
          </CardContent>
        </Card>
      );
    });
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
                    <AvatarImage src={getImage(profile.imageId || 'default-male-avatar')?.imageUrl} />
                    <AvatarFallback>{profile.email.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold">{profile.email.split('@')[0]}</h3>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Pages You Like</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pagesYouLike.map(page => (
                <div key={page.name} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`${page.color} text-white text-xs font-bold`}>
                      {page.initial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium flex-1">{page.name}</span>
                  {page.notifications && <Badge variant="destructive">{page.notifications}</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Main Feed */}
        <main className="lg:col-span-6 space-y-6">
          <Card>
             <CardContent className="p-4 flex items-center gap-3 border-b">
                <Avatar>
                    <AvatarImage src={getImage(profile?.imageId ?? 'user-1')?.imageUrl} />
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
                    <FileText className="mr-2" />
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

        {/* Right Sidebar */}
        <aside className="lg:col-span-3 space-y-6 hidden lg:block">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Reels and Short Videos</CardTitle>
              <Button variant="ghost" size="sm">See All</Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {reels.map(reel => {
                const img = getImage(reel.imageId);
                return (
                  <div key={reel.author} className="relative aspect-[9/16] rounded-lg overflow-hidden group">
                    {img && <Image src={img.imageUrl} alt={`Reel by ${reel.author}`} fill style={{ objectFit: 'cover' }} data-ai-hint={img.imageHint} />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 text-white">
                      <div className="flex items-center gap-1.5">
                        <PlayCircle className="h-4 w-4" />
                        <span className="text-xs font-bold">{reel.views}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
