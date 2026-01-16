'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { members } from '@/lib/data';
import placeholderImages from '@/lib/placeholder-images.json';
import {
  Image as ImageIcon,
  Calendar,
  Newspaper,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  Users,
} from 'lucide-react';
import Link from 'next/link';

// Static data for now
const posts = [
  {
    id: 'post1',
    author: members.find(m => m.name === 'Dr. Amara Obi'),
    timestamp: '8h',
    content:
      "Excited to kick off our new Executive Leadership cohort next month! We'll be diving deep into global strategy and digital transformation. We have a few spots left for driven leaders ready to make an impact. #Leadership #TGNMentorship",
    likes: 128,
    comments: 17,
  },
  {
    id: 'post2',
    author: members.find(m => m.name === 'Maria Santos'),
    timestamp: '2d',
    content:
      'Just completed my "Personal Branding Basics" program and feeling so inspired! A huge thank you to my mentor Michael Okonkwo for the incredible guidance. Ready to put these new skills to work. Feeling grateful for this community! 🙏',
    likes: 74,
    comments: 9,
  },
  {
    id: 'post3',
    author: members.find(m => m.name === 'James Chen'),
    timestamp: '4d',
    content: 'Interesting read on the future of FinTech in emerging markets. The potential for decentralized finance to increase financial inclusion is massive. Anyone else following this space? Would love to connect and share insights.',
    likes: 52,
    comments: 21,
  },
];

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find(p => p.id === imageId);
};

export default function CommunityPage() {
  const currentUser = members.find(m => m.name === 'Chloe Kim'); // Placeholder for logged-in user

  if (!currentUser) {
    return null; // Or a loading state
  }
  
  const currentUserImage = getImage(currentUser.imageId);


  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Left Sidebar (Profile) */}
      <aside className="md:col-span-1 space-y-6">
        <Card className="overflow-hidden text-center">
          <div className="h-16 bg-primary" />
          <Avatar className="h-20 w-20 mx-auto -mt-10 border-4 border-card">
            {currentUserImage && <AvatarImage src={currentUserImage.imageUrl} />}
            <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardContent className="pt-4">
            <Link href={`/profile/${currentUser?.id}`}>
              <h3 className="text-lg font-semibold hover:underline">{currentUser?.name}</h3>
            </Link>
            <p className="text-sm text-muted-foreground">{currentUser?.role}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2 hover:text-foreground cursor-pointer">
                <Users className="h-4 w-4" /> #TGNMentorship
              </li>
              <li className="flex items-center gap-2 hover:text-foreground cursor-pointer">
                <Users className="h-4 w-4" /> #Leadership
              </li>
              <li className="flex items-center gap-2 hover:text-foreground cursor-pointer">
                <Users className="h-4 w-4" /> #FinTech
              </li>
            </ul>
          </CardContent>
        </Card>
      </aside>

      {/* Main Feed */}
      <main className="md:col-span-3 space-y-6">
        {/* Create Post */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar>
                 {currentUserImage && <AvatarImage src={currentUserImage.imageUrl} />}
                <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="w-full">
                <Input placeholder="Start a post" className="h-12 text-base" />
              </div>
            </div>
            <div className="mt-4 flex justify-around">
              <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground">
                <ImageIcon className="text-blue-500" /> Media
              </Button>
              <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="text-orange-500" /> Event
              </Button>
              <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground">
                <Newspaper className="text-red-500" /> Write article
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {posts.map((post) => {
          if (!post.author) return null;
          const authorImage = getImage(post.author.imageId);
          return (
            <Card key={post.id}>
              <CardContent className="p-4">
                {/* Post Header */}
                <div className="flex items-start gap-3 mb-4">
                  <Avatar>
                    {authorImage && <AvatarImage src={authorImage.imageUrl} />}
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/profile/${post.author.id}`}>
                        <h4 className="font-semibold hover:underline">{post.author.name}</h4>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {post.author.role} • {post.timestamp}
                    </p>
                  </div>
                </div>

                {/* Post Body */}
                <p className="whitespace-pre-wrap text-sm mb-4">{post.content}</p>

                {/* Post Stats */}
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{post.likes} Likes</span>
                    <span>{post.comments} Comments</span>
                </div>

                <hr className="mb-2"/>

                {/* Post Actions */}
                <div className="flex justify-around">
                    <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                        <ThumbsUp className="h-5 w-5" /> Like
                    </Button>
                     <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="h-5 w-5" /> Comment
                    </Button>
                     <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                        <Share2 className="h-5 w-5" /> Share
                    </Button>
                     <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                        <Send className="h-5 w-5" /> Send
                    </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </main>
    </div>
  );
}
