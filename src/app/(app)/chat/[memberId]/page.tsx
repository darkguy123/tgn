'use client';

import { useParams, useRouter, notFound } from 'next/navigation';
import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
} from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { cn } from '@/lib/utils';
import type { TGNMember, ChatMessage } from '@/lib/types';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const getImage = (imageId?: string) => {
  if (!imageId) return null;
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};

const getNameFromEmail = (email?: string) => {
    if (!email) return 'User';
    return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Mock messages for display purposes until a real chat system is built
const mockMessages: Omit<ChatMessage, 'id' | 'senderId'>[] = [
    { text: `Hey! Thanks for connecting. Let me know if you have any questions.`, timestamp: '10:30 AM', isCurrentUser: false },
    { text: `Hi there! Great to connect with you too. I was looking at your profile, very impressive background!`, timestamp: '10:32 AM', isCurrentUser: true },
    { text: `Thanks! Happy to help if I can. What are you currently working on?`, timestamp: '10:33 AM', isCurrentUser: false },
];


export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.memberId as string;
  const { profile: currentUserProfile, isLoading: isCurrentUserLoading } = useMemberProfile();
  const firestore = useFirestore();
  
  const [newMessage, setNewMessage] = useState('');

  const otherMemberRef = useMemoFirebase(() => doc(firestore, 'users', memberId), [firestore, memberId]);
  const { data: otherMember, isLoading: isOtherUserLoading } = useDoc<TGNMember>(otherMemberRef);

  if (isCurrentUserLoading || isOtherUserLoading) {
     return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-card border rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
                 <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 space-y-6">
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="h-16 w-1/2 ml-auto" />
            </CardContent>
        </div>
    )
  }
  
  if (!otherMember) {
      notFound();
  }
  
  const otherMemberName = getNameFromEmail(otherMember.email);
  const currentUserName = getNameFromEmail(currentUserProfile?.email);
  
  const otherMemberImage = getImage(otherMember.imageId);
  const currentUserImage = getImage(currentUserProfile?.imageId);


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    console.log('Sending message:', newMessage);
    // Here you would add logic to actually send the message to Firestore
    setNewMessage('');
  };


  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-card border rounded-lg">
      {/* Chat Header */}
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherMemberImage?.imageUrl} />
            <AvatarFallback>{otherMemberName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{otherMemberName}</p>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone />
          </Button>
          <Button variant="ghost" size="icon">
            <Video />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical />
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-4 overflow-y-auto space-y-6">
        {mockMessages.map((msg, index) => {
          const senderName = msg.isCurrentUser ? currentUserName : otherMemberName;
          const senderImage = msg.isCurrentUser ? currentUserImage : otherMemberImage;
          
          return (
            <div
              key={index}
              className={cn(
                'flex items-end gap-3',
                msg.isCurrentUser ? 'flex-row-reverse' : 'flex-row',
              )}
            >
              <Avatar className='h-8 w-8'>
                <AvatarImage src={senderImage?.imageUrl} />
                <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'max-w-xs lg:max-w-md p-3 rounded-2xl',
                  msg.isCurrentUser
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted rounded-bl-none'
                )}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
               <p className="text-xs text-muted-foreground self-end">{msg.timestamp}</p>
            </div>
          );
        })}
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form className="flex items-center gap-3" onSubmit={handleSendMessage}>
          <Button variant="ghost" size="icon">
            <Paperclip />
          </Button>
          <div className="relative flex-1">
            <Input
              placeholder="Type your message..."
              className="rounded-full pr-12"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
            >
              <Smile />
            </Button>
          </div>
          <Button type="submit" size="icon" className="rounded-full flex-shrink-0">
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}
