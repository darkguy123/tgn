'use client';

import { useParams, useRouter, notFound } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { members, conversations } from '@/lib/data';
import placeholderImages from '@/lib/placeholder-images.json';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { cn } from '@/lib/utils';
import type { Member, ChatMessage } from '@/lib/types';

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.memberId as string;
  const { profile: currentUserProfile } = useMemberProfile();
  
  const [newMessage, setNewMessage] = useState('');

  const otherMember = members.find((m) => m.id === memberId);
  const currentUser = members.find(m => m.tgnId === currentUserProfile?.tgnMemberId);

  // Find a conversation that includes both the current user and the other member
  const conversation = conversations.find(c => 
    c.participants.some(p => p.id === currentUser?.id) &&
    c.participants.some(p => p.id === otherMember?.id)
  );

  // If no conversation found, create a mock one for display
  const chatMessages: ChatMessage[] = conversation ? conversation.messages : [
    { id: 'mock1', senderId: otherMember?.id ?? '', text: `Hey! Thanks for connecting. Let me know if you have any questions.`, timestamp: '10:30 AM' }
  ];


  if (!otherMember || !currentUser) {
    // Can show a loading state here
    return null;
  }
  
  if (!otherMember) {
      notFound();
  }

  const otherMemberImage = getImage(otherMember.imageId);
  const currentUserImage = getImage(currentUser?.imageId ?? '');


  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    console.log('Sending message:', newMessage);
    // Here you would add logic to actually send the message
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
            <AvatarFallback>{otherMember.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{otherMember.name}</p>
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
        {chatMessages.map((msg, index) => {
          const isCurrentUser = msg.senderId === currentUser?.id || msg.senderId === currentUser?.tgnId;
          const sender = isCurrentUser ? currentUser : otherMember;
          const senderImage = isCurrentUser ? currentUserImage : otherMemberImage;
          
          // To group messages from the same sender
          const nextMsg = chatMessages[index + 1];
          const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

          return (
            <div
              key={msg.id}
              className={cn(
                'flex items-end gap-3',
                isCurrentUser ? 'flex-row-reverse' : 'flex-row',
                !isLastInGroup && 'mb-2'
              )}
            >
              <Avatar className={cn('h-8 w-8', !isLastInGroup && 'invisible')}>
                <AvatarImage src={senderImage?.imageUrl} />
                <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'max-w-xs lg:max-w-md p-3 rounded-2xl',
                  isCurrentUser
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
