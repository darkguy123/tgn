'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { members, stories as storiesData, conversations } from '@/lib/data';
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
  PlusCircle,
  UploadCloud,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  MessageSquarePlus,
  Ellipsis,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { Separator } from '@/components/ui/separator';
import type { Story, ChatConversation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  {
    name: 'Football FC',
    initial: 'FF',
    color: 'bg-red-500',
    notifications: 120,
  },
  { name: 'Badminton Club', initial: 'BC', color: 'bg-blue-500' },
  { name: 'UI/UX Community', initial: 'UI', color: 'bg-purple-500' },
  { name: 'Web Designer', initial: 'WD', color: 'bg-green-500' },
];

const reels = [
  { author: 'Sarah Chen', imageId: 'product-2', views: '1.2M' },
  { author: 'David Okonkwo', imageId: 'product-4', views: '890K' },
  {
    author: 'Elena Rodriguez',
    imageId: 'program-global-business',
    views: '540K',
  },
  {
    author: 'James Chen',
    imageId: 'program-business-strategy',
    views: '320K',
  },
];

const posts = [
  {
    id: 'post1',
    author: members.find(m => m.name === 'Sarah Chen'),
    timestamp: '12 April at 09:28 PM',
    content:
      'One of the perks of working in an international company is sharing knowledge with your colleagues.',
    images: ['community-post-office-1', 'community-post-office-2'],
    likes: 120000,
    comments: 25,
    shares: 231,
    saves: 12,
  },
  {
    id: 'post2',
    author: members.find(m => m.name === 'Maria Santos'),
    timestamp: '11 April at 08:15 PM',
    content: 'A great way to generate all the motivation you need to get fit.',
    images: [],
    likes: 12,
    comments: 7,
    shares: 0,
    saves: 0,
  },
];

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find(p => p.id === imageId);
};

// --- Story Creation Dialog ---
function CreateStoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new story</DialogTitle>
          <DialogDescription>
            Share a photo or a short video (max 30 seconds). Stories disappear
            after 24 hours.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="story-file">Upload Media</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="story-file"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Image or Video (MAX. 30s)
                  </p>
                </div>
                <Input
                  id="story-file"
                  type="file"
                  className="hidden"
                  accept="image/*,video/mp4,video/quicktime"
                />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input id="caption" placeholder="Add a caption..." />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Post Story</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Story Viewer ---
function StoryViewer({
  stories,
  initialStoryIndex,
  onClose,
}: {
  stories: Story[];
  initialStoryIndex: number | null;
  onClose: () => void;
}) {
  const [currentStoryIdx, setCurrentStoryIdx] = useState(initialStoryIndex);
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStoryIdx === null) return;
    const story = stories[currentStoryIdx];
    if (!story || !story.items) return;

    const item = story.items[currentItemIdx];
    if (!item) return;

    setProgress(0);
    const timer = setTimeout(() => {
      handleNextItem();
    }, item.duration * 1000);

    const interval = setInterval(() => {
      setProgress(p => Math.min(100, p + 100 / (item.duration * 10)));
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [currentStoryIdx, currentItemIdx, stories]);

  const handleNextStory = () => {
    if (currentStoryIdx === null) return;
    if (currentStoryIdx < stories.length - 1) {
      setCurrentStoryIdx(currentStoryIdx + 1);
      setCurrentItemIdx(0);
    } else {
      onClose();
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIdx === null) return;
    if (currentStoryIdx > 0) {
      setCurrentStoryIdx(currentStoryIdx - 1);
      setCurrentItemIdx(0);
    }
  };

  const handleNextItem = () => {
    if (currentStoryIdx === null) return;
    const story = stories[currentStoryIdx];
    if (story && story.items && currentItemIdx < story.items.length - 1) {
      setCurrentItemIdx(currentItemIdx + 1);
    } else {
      handleNextStory();
    }
  };

  if (currentStoryIdx === null) return null;

  const story = stories[currentStoryIdx];
  if (!story || !story.items) return null;
  const item = story.items[currentItemIdx];
  const authorImage = getImage(story.author.imageId);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-0 md:p-4 animate-in fade-in-0">
      <div className="relative w-full h-full md:max-w-sm md:h-[95vh] bg-card rounded-none md:rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="relative flex-1 w-full h-full bg-black">
          {item.type === 'image' && (
            <Image
              key={item.id}
              src={getImage(item.mediaId)?.imageUrl ?? ''}
              alt="Story"
              fill
              className="object-contain animate-scale-in"
            />
          )}
        </div>
        <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-1 mb-2">
            {story.items.map((_, index) => (
              <div
                className="flex-1 h-1 bg-white/30 rounded-full"
                key={index}
              >
                <div
                  className="h-1 bg-white rounded-full transition-all duration-100 linear"
                  style={{
                    width: `${
                      index < currentItemIdx
                        ? 100
                        : index === currentItemIdx
                        ? progress
                        : 0
                    }%`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 text-white">
            <Avatar className="h-9 w-9">
              {authorImage && <AvatarImage src={authorImage.imageUrl} />}
              <AvatarFallback>{story.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold">{story.author.name}</p>
          </div>
        </div>
        <div
          className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
          onClick={handlePrevStory}
        />
        <div
          className="absolute inset-y-0 right-0 w-2/3 z-20 cursor-pointer"
          onClick={handleNextItem}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X />
      </Button>
      {currentStoryIdx > 0 && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full h-10 w-10 hidden lg:flex"
          onClick={handlePrevStory}
        >
          <ChevronLeft />
        </Button>
      )}
      {currentStoryIdx < stories.length - 1 && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full h-10 w-10 hidden lg:flex"
          onClick={handleNextStory}
        >
          <ChevronRight />
        </Button>
      )}
    </div>
  );
}

// --- Main Community Page ---
export default function CommunityPage() {
  const { profile, isLoading } = useMemberProfile();
  const [isCreateStoryOpen, setCreateStoryOpen] = useState(false);
  const [storyViewerState, setStoryViewerState] = useState<{
    open: boolean;
    index: number | null;
  }>({ open: false, index: null });

  const handleOpenStoryViewer = (index: number) => {
    setStoryViewerState({ open: true, index });
  };

  const handleCloseStoryViewer = () => {
    setStoryViewerState({ open: false, index: null });
  };

  return (
    <>
      <CreateStoryDialog
        open={isCreateStoryOpen}
        onOpenChange={setCreateStoryOpen}
      />
      {storyViewerState.open && (
        <StoryViewer
          stories={storiesData}
          initialStoryIndex={storyViewerState.index}
          onClose={handleCloseStoryViewer}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar */}
        <aside className="lg:col-span-3 space-y-6 hidden lg:block">
          <Card>
            <CardContent className="p-4 text-center">
              {profile && (
                <>
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarImage
                      src={
                        getImage(
                          members.find(m => m.tgnId === profile.tgnMemberId)
                            ?.imageId ?? 'user-1'
                        )?.imageUrl
                      }
                    />
                    <AvatarFallback>{profile.email.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold">
                    {profile.email.split('@')[0]}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    @{profile.tgnMemberId}
                  </p>
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
              <CardTitle className="text-sm font-semibold">
                Pages You Like
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pagesYouLike.map(page => (
                <div key={page.name} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={`${page.color} text-white text-xs font-bold`}
                    >
                      {page.initial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium flex-1">
                    {page.name}
                  </span>
                  {page.notifications && (
                    <Badge variant="destructive">{page.notifications}</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>

        {/* Main Feed */}
        <main className="lg:col-span-6 space-y-6">
          <div className="flex space-x-4 p-4 bg-card rounded-lg overflow-x-auto">
            <div className="flex flex-col items-center space-y-1 flex-shrink-0 w-20 text-center">
              <button
                onClick={() => setCreateStoryOpen(true)}
                className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-primary"
              >
                <PlusCircle className="h-8 w-8 text-primary" />
              </button>
              <p className="text-xs font-medium truncate w-full">
                Create Story
              </p>
            </div>
            {storiesData.map((story, index) => {
              const img = getImage(story.author.imageId);
              return (
                <div
                  key={story.id}
                  className="flex flex-col items-center space-y-1 flex-shrink-0 w-20 text-center cursor-pointer"
                  onClick={() => handleOpenStoryViewer(index)}
                >
                  <div className="p-0.5 border-2 border-primary rounded-full">
                    <Avatar className="h-16 w-16">
                      {img && <AvatarImage src={img.imageUrl} />}
                      <AvatarFallback>
                        {story.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground truncate w-full">
                    {story.author.name}
                  </p>
                </div>
              );
            })}
          </div>

          <Card>
             <CardContent className="p-4 flex items-center gap-3 border-b">
                <Avatar>
                    <AvatarImage src={getImage(members.find(m => m.tgnId === profile?.tgnMemberId)?.imageId ?? 'user-1')?.imageUrl} />
                    <AvatarFallback>{profile?.email.charAt(0)}</AvatarFallback>
                </Avatar>
                <button className="w-full text-left h-12 px-4 rounded-full bg-muted border border-input hover:bg-muted/80 transition-colors text-muted-foreground text-sm">
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
              {posts.map(post => {
                if (!post.author) return null;
                const authorImage = getImage(post.author.imageId);
                return (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            {authorImage && (
                              <AvatarImage src={authorImage.imageUrl} />
                            )}
                            <AvatarFallback>
                              {post.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link href={`/profile/${post.author.id}`}>
                              <h4 className="font-semibold hover:underline">
                                {post.author.name}
                              </h4>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {post.timestamp}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>

                      <p className="text-sm mb-4">{post.content}</p>

                      {post.images && post.images.length > 0 && (
                        <div
                          className={`grid gap-2 grid-cols-${
                            post.images.length > 1 ? 2 : 1
                          } mb-4`}
                        >
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
                          <span>{post.comments} Comments</span>
                          <span>
                            {Intl.NumberFormat('en-US', {
                              notation: 'compact',
                              maximumFractionDigits: 1,
                            }).format(post.likes)}{' '}
                            Likes
                          </span>
                          <span>{post.shares} Share</span>
                        </div>
                        <span>{post.saves} Saved</span>
                      </div>

                      <Separator className="mb-2" />

                      <div className="flex justify-around">
                        <Button
                          variant="ghost"
                          className="flex-1 flex items-center gap-2 text-muted-foreground"
                        >
                          <MessageSquare className="h-5 w-5" /> Comment
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 flex items-center gap-2 text-muted-foreground"
                        >
                          <ThumbsUp className="h-5 w-5" /> Like
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 flex items-center gap-2 text-muted-foreground"
                        >
                          <Share2 className="h-5 w-5" /> Share
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 flex items-center gap-2 text-muted-foreground"
                        >
                          <Bookmark className="h-5 w-5" /> Save
                        </Button>
                      </div>
                      <Separator className="mt-2" />
                      <div className="mt-4 flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              getImage(
                                members.find(m => m.tgnId === profile?.tgnMemberId)
                                  ?.imageId ?? 'user-1'
                              )?.imageUrl
                            }
                          />
                          <AvatarFallback>
                            {profile?.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Input
                          placeholder="Write your comment..."
                          className="h-10 rounded-full bg-muted border-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
            <TabsContent value="mentors" className="mt-6 space-y-6">
              {posts
                .filter(post => post.author?.role.includes('Mentor'))
                .map(post => {
                if (!post.author) return null;
                const authorImage = getImage(post.author.imageId);
                return (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            {authorImage && (
                              <AvatarImage src={authorImage.imageUrl} />
                            )}
                            <AvatarFallback>
                              {post.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link href={`/profile/${post.author.id}`}>
                              <h4 className="font-semibold hover:underline">
                                {post.author.name}
                              </h4>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {post.timestamp}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>

                      <p className="text-sm mb-4">{post.content}</p>

                      {post.images && post.images.length > 0 && (
                        <div
                          className={`grid gap-2 grid-cols-${
                            post.images.length > 1 ? 2 : 1
                          } mb-4`}
                        >
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
                          <span>{post.comments} Comments</span>
                          <span>
                            {Intl.NumberFormat('en-US', {
                              notation: 'compact',
                              maximumFractionDigits: 1,
                            }).format(post.likes)}{' '}
                            Likes
                          </span>
                          <span>{post.shares} Share</span>
                        </div>
                        <span>{post.saves} Saved</span>
                      </div>

                      <Separator className="mb-2" />

                      <div className="flex justify-around">
                        <Button
                          variant="ghost"
                          className="flex-1 flex items-center gap-2 text-muted-foreground"
                        >
                          <MessageSquare className="h-5 w-5" /> Comment
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 flex items-center gap-2 text-muted-foreground"
                        >
                          <ThumbsUp className="h-5 w-5" /> Like
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 flex items-center gap-2 text-muted-foreground"
                        >
                          <Share2 className="h-5 w-5" /> Share
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 flex items-center gap-2 text-muted-foreground"
                        >
                          <Bookmark className="h-5 w-5" /> Save
                        </Button>
                      </div>
                      <Separator className="mt-2" />
                      <div className="mt-4 flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              getImage(
                                members.find(m => m.tgnId === profile?.tgnMemberId)
                                  ?.imageId ?? 'user-1'
                              )?.imageUrl
                            }
                          />
                          <AvatarFallback>
                            {profile?.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Input
                          placeholder="Write your comment..."
                          className="h-10 rounded-full bg-muted border-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {posts.filter(p => p.author?.role.includes('Mentor')).length === 0 && (
                <Card>
                  <CardContent className="p-10 text-center text-muted-foreground">
                    <p>This feed is exclusively for mentors.</p>
                    <p>No posts from mentors to show right now.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

        </main>

        {/* Right Sidebar */}
        <aside className="lg:col-span-3 space-y-6 hidden lg:block">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
              <CardTitle className="text-base font-semibold">Messaging</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MessageSquarePlus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <div className="p-2">
              <div className="relative">
                <Input placeholder="Search messages" className="pl-8 h-9" />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <CardContent className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
              {conversations.map(conv => {
                const otherParticipant = conv.participants.find(p => p.tgnId !== profile?.tgnMemberId);
                if (!otherParticipant) return null;
                const participantImage = getImage(otherParticipant.imageId);
                const lastMessage = conv.messages[conv.messages.length - 1];

                return (
                  <Link
                    key={conv.id}
                    href={`/chat/${otherParticipant.id}`}
                    className="w-full text-left p-2 rounded-lg hover:bg-muted flex items-start gap-3"
                  >
                    <Avatar className="h-10 w-10 border-2 border-background">
                      {participantImage && <AvatarImage src={participantImage.imageUrl} />}
                      <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm truncate">{otherParticipant.name}</p>
                        <p className="text-xs text-muted-foreground">{lastMessage.timestamp}</p>
                      </div>
                      <div className="flex items-start justify-between">
                        <p className="text-xs text-muted-foreground truncate pr-2">{lastMessage.text}</p>
                        {conv.unreadCount && conv.unreadCount > 0 && (
                          <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">{conv.unreadCount}</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Reels and Short Videos
              </CardTitle>
              <Button variant="ghost" size="sm">
                See All
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {reels.map(reel => {
                const img = getImage(reel.imageId);
                return (
                  <div
                    key={reel.author}
                    className="relative aspect-[9/16] rounded-lg overflow-hidden group"
                  >
                    {img && (
                      <Image
                        src={img.imageUrl}
                        alt={`Reel by ${reel.author}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        data-ai-hint={img.imageHint}
                      />
                    )}
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
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium">10 Events Invites</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium">Prada's Invitation Birthday</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Suggested Pages
              </CardTitle>
              <Button variant="ghost" size="sm">
                See All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={getImage('suggested-page-logo')?.imageUrl} />
                  <AvatarFallback>S</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">Sebo Studio</p>
                  <p className="text-xs text-muted-foreground">
                    Design Studio
                  </p>
                </div>
              </div>
              <Image
                src={getImage('suggested-page-banner')?.imageUrl ?? ''}
                alt="Suggested page banner"
                width={300}
                height={150}
                className="rounded-lg object-cover w-full aspect-video mt-3"
                data-ai-hint="team photo"
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
