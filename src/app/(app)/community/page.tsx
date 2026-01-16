'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { members } from '@/lib/data';
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
  Send,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { Separator } from '@/components/ui/separator';

const communityNavItems = [
  { label: 'Feed', icon: LayoutGrid, path: '/community' },
  { label: 'Friends', icon: Users, path: '#' },
  { label: 'Event', icon: Calendar, path: '#' },
  { label: 'Watch Videos', icon: PlayCircle, path: '#' },
  { label: 'Photos', icon: ImageIcon, path: '#' },
  { label: 'Files', icon: FileText, path: '#' },
  { label: 'Marketplace', icon: '/marketplace', path: '/marketplace' },
];

const pagesYouLike = [
    { name: 'Football FC', initial: 'FF', color: 'bg-red-500', notifications: 120 },
    { name: 'Badminton Club', initial: 'BC', color: 'bg-blue-500' },
    { name: 'UI/UX Community', initial: 'UI', color: 'bg-purple-500' },
    { name: 'Web Designer', initial: 'WD', color: 'bg-green-500' },
]

const stories = [
    { name: "Pan Feng Shui", imageId: "user-8" },
    { name: "Minnie Armstrong", imageId: "user-3" },
    { name: "Russell Hicks", imageId: "user-6" },
    { name: "Lettie Christensen", imageId: "user-7" },
]

const posts = [
  {
    id: 'post1',
    author: members.find(m => m.name === 'Sarah Chen'),
    timestamp: '12 April at 09:28 PM',
    content:
      "One of the perks of working in an international company is sharing knowledge with your colleagues.",
    images: ["community-post-office-1", "community-post-office-2"],
    likes: 120000,
    comments: 25,
    shares: 231,
    saves: 12,
  },
  {
    id: 'post2',
    author: members.find(m => m.name === 'Maria Santos'),
    timestamp: '11 April at 08:15 PM',
    content:
      'A great way to generate all the motivation you need to get fit.',
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

export default function CommunityPage() {
  const { profile, isLoading } = useMemberProfile();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Sidebar */}
      <aside className="lg:col-span-3 space-y-6 hidden lg:block">
        <Card>
            <CardContent className="p-4 text-center">
                {profile && (
                    <>
                        <Avatar className="h-16 w-16 mx-auto mb-2">
                             <AvatarImage src={getImage(members.find(m => m.tgnId === profile.tgnMemberId)?.imageId ?? 'user-1')?.imageUrl} />
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
                        <Button key={item.label} variant={item.label === 'Feed' ? 'secondary' : 'ghost'} className="justify-start gap-3" asChild>
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
                        <AvatarFallback className={`${page.color} text-white text-xs font-bold`}>{page.initial}</AvatarFallback>
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
            <CardContent className="p-4 flex items-center gap-3">
                 <Avatar className="h-10 w-10">
                    <AvatarImage src={getImage(members.find(m => m.tgnId === profile?.tgnMemberId)?.imageId ?? 'user-1')?.imageUrl} />
                    <AvatarFallback>{profile?.email.charAt(0)}</AvatarFallback>
                </Avatar>
                <Input placeholder="What's on your mind?" className="h-12 rounded-full bg-muted border-none focus-visible:ring-primary" />
                 <Button size="icon" variant="ghost">
                    <ImageIcon className="text-muted-foreground" />
                </Button>
            </CardContent>
        </Card>

        {posts.map((post) => {
          if (!post.author) return null;
          const authorImage = getImage(post.author.imageId);
          return (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-start gap-3">
                    <Avatar>
                        {authorImage && <AvatarImage src={authorImage.imageUrl} />}
                        <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <Link href={`/profile/${post.author.id}`}>
                            <h4 className="font-semibold hover:underline">{post.author.name}</h4>
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
                     <div className={`grid gap-2 grid-cols-${post.images.length > 1 ? 2 : 1} mb-4`}>
                        {post.images.map(imgId => {
                            const img = getImage(imgId);
                            return img ? <Image key={imgId} src={img.imageUrl} alt="Post image" width={400} height={300} className="rounded-lg object-cover w-full aspect-[4/3]" data-ai-hint={img.imageHint} /> : null;
                        })}
                    </div>
                )}
                
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <div className="flex gap-4">
                        <span>{post.comments} Comments</span>
                        <span>{Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(post.likes)} Likes</span>
                         <span>{post.shares} Share</span>
                    </div>
                    <span>{post.saves} Saved</span>
                </div>

                <Separator className="mb-2"/>

                <div className="flex justify-around">
                    <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="h-5 w-5" /> Comment
                    </Button>
                    <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                        <ThumbsUp className="h-5 w-5" /> Like
                    </Button>
                     <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                        <Share2 className="h-5 w-5" /> Share
                    </Button>
                     <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                        <Bookmark className="h-5 w-5" /> Save
                    </Button>
                </div>
                 <Separator className="mt-2"/>
                 <div className="mt-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={getImage(members.find(m => m.tgnId === profile?.tgnMemberId)?.imageId ?? 'user-1')?.imageUrl} />
                       <AvatarFallback>{profile?.email.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Input placeholder="Write your comment..." className="h-10 rounded-full bg-muted border-none" />
                 </div>
              </CardContent>
            </Card>
          );
        })}
      </main>

       {/* Right Sidebar */}
      <aside className="lg:col-span-3 space-y-6 hidden lg:block">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Stories</CardTitle>
                 <Button variant="ghost" size="sm">See All</Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <button className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-primary">
                        <PlusCircle className="h-6 w-6 text-primary" />
                    </button>
                    <div>
                        <p className="font-medium text-sm">Create Your Story</p>
                        <p className="text-xs text-muted-foreground">Click button beside to create yours.</p>
                    </div>
                </div>
                 {stories.map(story => {
                     const storyAuthor = members.find(m => m.name.includes(story.name.split(' ')[0]));
                     const img = getImage(story.imageId);
                     return (
                        <div key={story.name} className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-primary">
                                <AvatarImage src={img?.imageUrl} />
                                <AvatarFallback>{story.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <div>
                                <p className="font-medium text-sm">{story.name}</p>
                                <p className="text-xs text-muted-foreground">12 April at 09:28 PM</p>
                            </div>
                        </div>
                     )
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
                        <Calendar className="h-5 w-5 text-primary"/>
                    </div>
                    <p className="text-sm font-medium">10 Events Invites</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-muted rounded-lg">
                        <Calendar className="h-5 w-5 text-primary"/>
                    </div>
                    <p className="text-sm font-medium">Prada's Invitation Birthday</p>
                </div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Suggested Pages</CardTitle>
                <Button variant="ghost" size="sm">See All</Button>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center gap-3">
                     <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarImage src={getImage('suggested-page-logo')?.imageUrl} />
                        <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                     <div>
                        <p className="font-semibold text-sm">Sebo Studio</p>
                        <p className="text-xs text-muted-foreground">Design Studio</p>
                    </div>
                 </div>
                 <Image src={getImage('suggested-page-banner')?.imageUrl ?? ''} alt="Suggested page banner" width={300} height={150} className="rounded-lg object-cover w-full aspect-video mt-3" data-ai-hint="team photo" />
            </CardContent>
        </Card>
      </aside>
    </div>
  );
}
