'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  Heart,
} from 'lucide-react';
import Link from 'next/link';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import type { Post } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AdPlacement } from '@/components/AdPlacement';
import { FileUpload } from '@/components/ui/file-upload';
import { PostCard } from '@/components/community/PostCard';

const communityNavItems = [
  { label: 'Feed', icon: LayoutGrid, path: '/community' },
  { label: 'Directory', icon: Users, path: '/directory' },
  { label: 'Events', icon: Calendar, path: '/community/events' },
  { label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
  { label: 'Fundraise', icon: Heart, path: '/community/causes' },
];

const postSchema = z.object({
  content: z.string().max(500, 'Post content is too long.').optional(),
});

type PostFormData = z.infer<typeof postSchema>;

function CreatePostDialog({ open, onOpenChange, startWithMedia }: { open: boolean, onOpenChange: (open: boolean) => void, startWithMedia: boolean }) {
  const { profile } = useMemberProfile();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleUploadComplete = useCallback((url: string, type: string) => {
    setMediaUrl(url);
    setMediaType(type);
  }, []);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
    if (open) {
        setShowFileUpload(startWithMedia);
    } else {
      reset();
      setMediaUrl('');
      setMediaType('');
      setShowFileUpload(false);
    }
  }, [open, startWithMedia, reset]);


  const handlePostSubmit = (data: PostFormData) => {
    if (!profile || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to post.' });
      return;
    }

    if (!data.content && !mediaUrl) {
        const errorMessage = startWithMedia ? 'Please upload an image or video.' : 'Please write something or upload a file.';
        toast({ variant: 'destructive', title: 'Empty Post', description: errorMessage });
        return;
    }
    
    const postsCollection = collection(firestore, 'posts');
    const dataToSave = {
      content: data.content || '',
      authorId: profile.id,
      authorTgnMemberId: profile.tgnMemberId,
      authorName: profile.name || profile.email.split('@')[0],
      authorAvatarUrl: profile.avatarUrl || '',
      authorRole: profile.role,
      likes: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
      media: mediaUrl ? [{ url: mediaUrl, type: mediaType }] : [],
    };

    addDoc(postsCollection, dataToSave)
      .then(() => {
        toast({ title: 'Success', description: 'Your post has been published.' });
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
           <DialogTitle>Create a New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, images, or videos with the community.
          </DialogDescription>
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

            {showFileUpload && (
              <div className="space-y-2">
                <Label>Image/Video</Label>
                {profile && (
                  <FileUpload
                    value={mediaUrl}
                    mediaType={mediaType}
                    onUploadComplete={handleUploadComplete}
                    userId={profile.id}
                    storagePath="public"
                    accept={{ 'image/jpeg': [], 'image/png': [], 'image/webp': [], 'video/mp4': [], 'video/quicktime': [] }}
                  />
                )}
              </div>
            )}

            <div className="flex gap-2 text-muted-foreground">
                <Button variant="ghost" size="icon" type="button" onClick={() => setShowFileUpload(p => !p)}>
                    <ImageIcon />
                </Button>
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
  const [isPostDialogOpen, setPostDialogOpen] = useState(false);
  const [startWithMedia, setStartWithMedia] = useState(false);
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
      <CreatePostDialog open={isPostDialogOpen} onOpenChange={setPostDialogOpen} startWithMedia={startWithMedia} />

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

        {/* Main Content Area */}
        <div className="lg:col-span-9 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <main className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-4 flex items-center gap-3 border-b">
                    <Avatar>
                        <AvatarImage src={profile?.avatarUrl} />
                        <AvatarFallback>{profile?.email.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <button
                    className="w-full text-left h-12 px-4 rounded-full bg-muted border border-input hover:bg-muted/80 transition-colors text-muted-foreground text-sm"
                    onClick={() => {
                      setStartWithMedia(false);
                      setPostDialogOpen(true);
                    }}
                    >
                        Start a post
                    </button>
                </CardContent>
                <div className="p-2 flex justify-around">
                    <Button variant="ghost" className="text-muted-foreground font-medium flex-1" onClick={() => {
                        setStartWithMedia(true);
                        setPostDialogOpen(true);
                    }}>
                        <ImageIcon className="mr-2" />
                        Media
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground font-medium flex-1">
                        <Calendar className="mr-2" />
                        Event
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground font-medium flex-1">
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
            {/* Right Ad Sidebar */}
            <aside className="lg:col-span-1 space-y-6 hidden lg:block lg:sticky lg:top-24">
                <AdPlacement size="skyscraper" />
            </aside>
        </div>
      </div>
    </>
  );
}
