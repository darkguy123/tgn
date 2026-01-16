'use client';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft, Phone, Video, MoreVertical, Paperclip, Smile, Send,
  File, Video as VideoIcon, Image as ImageIcon, Loader2
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import placeholderImages from '@/lib/placeholder-images.json';
import { cn } from '@/lib/utils';
import type { TGNMember, ChatMessage, Chat } from '@/lib/types';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection, query, orderBy, addDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

// Helper to get image from placeholder data
const getImage = (imageId?: string) => {
  if (!imageId) return null;
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};

// Helper to generate a consistent chat ID
const createChatId = (uid1: string, uid2: string) => [uid1, uid2].sort().join('_');

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const otherMemberId = params.memberId as string;
  
  const [newMessage, setNewMessage] = useState('');
  
  // Create a stable chat ID
  const chatId = useMemo(() => {
    if (!currentUser?.uid || !otherMemberId) return null;
    return createChatId(currentUser.uid, otherMemberId);
  }, [currentUser?.uid, otherMemberId]);

  // Firestore references
  const otherMemberRef = useMemoFirebase(() => doc(firestore, 'users', otherMemberId), [firestore, otherMemberId]);
  const chatDocRef = useMemoFirebase(() => chatId ? doc(firestore, 'chats', chatId) : null, [firestore, chatId]);
  const messagesColRef = useMemoFirebase(() => chatDocRef ? collection(chatDocRef, 'messages') : null, [chatDocRef]);
  const messagesQuery = useMemoFirebase(() => messagesColRef ? query(messagesColRef, orderBy('createdAt', 'asc')) : null, [messagesColRef]);

  // Data fetching hooks
  const { data: otherMember, isLoading: isOtherUserLoading } = useDoc<TGNMember>(otherMemberRef);
  const { data: messages, isLoading: areMessagesLoading } = useCollection<ChatMessage>(messagesQuery);
  const { data: chatData } = useDoc<Chat>(chatDocRef);
  
  // Refs and state for UI behavior
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Typing indicator logic
  useEffect(() => {
    if (!chatDocRef || !currentUser) return;
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    const isTyping = newMessage.length > 0;
    
    // Set typing status immediately
    updateDoc(chatDocRef, { [`typing.${currentUser.uid}`]: isTyping });

    // If user stops typing, set status to false after a delay
    if (!isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
            updateDoc(chatDocRef, { [`typing.${currentUser.uid}`]: false });
        }, 2000);
    }
    
    return () => {
        if(typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    }
  }, [newMessage, chatDocRef, currentUser]);
  
  const otherUserIsTyping = chatData?.typing?.[otherMemberId] === true;
  const otherMemberName = otherMember?.name || otherMember?.email?.split('@')[0] || 'User';
  const otherMemberImage = getImage(otherMember?.imageId);
  const isLoading = isOtherUserLoading || areMessagesLoading;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser || !chatDocRef || !messagesColRef) return;

    const messageData = {
      senderId: currentUser.uid,
      content: newMessage,
      type: 'text' as const,
      createdAt: serverTimestamp(),
    };
    
    setNewMessage('');
    
    // Create chat document if it doesn't exist
    if (!chatData) {
        await setDoc(chatDocRef, {
            participantIds: [currentUser.uid, otherMemberId],
        });
    }

    // Add new message and update the last message on the chat doc
    await addDoc(messagesColRef, messageData);
    await updateDoc(chatDocRef, {
      lastMessage: {
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: serverTimestamp(),
      }
    });
  };

  if (isOtherUserLoading) {
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
            </CardHeader>
        </div>
    )
  }
  
  if (!otherMember) {
      notFound();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-card border rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherMemberImage?.imageUrl} />
            <AvatarFallback>{otherMemberName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold truncate">{otherMemberName}</p>
            <p className="text-xs text-green-500 h-4">
              {otherUserIsTyping ? <span className="italic animate-pulse">typing...</span> : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon"><Phone /></Button>
          <Button variant="ghost" size="icon"><Video /></Button>
          <Button variant="ghost" size="icon"><MoreVertical /></Button>
        </div>
      </CardHeader>

      <CardContent ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/30">
        {isLoading && <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>}
        {!isLoading && messages?.map(msg => (
          <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === currentUser?.uid ? "justify-end" : "justify-start")}>
            <div className={cn(
              "p-3 rounded-lg max-w-sm md:max-w-md",
              msg.senderId === currentUser?.uid
                ? "bg-primary text-primary-foreground rounded-br-none"
                : "bg-background text-foreground rounded-bl-none border"
            )}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs opacity-70 mt-1 text-right">
                {msg.createdAt ? format(msg.createdAt.toDate(), 'p') : '...'}
              </p>
            </div>
          </div>
        ))}
      </CardContent>

      <div className="p-2 md:p-4 border-t bg-background shrink-0">
        <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" type="button"><Paperclip /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="grid gap-1">
                <Button variant="ghost" className="w-full justify-start"><ImageIcon className="mr-2"/> Photo</Button>
                <Button variant="ghost" className="w-full justify-start"><VideoIcon className="mr-2"/> Video</Button>
                <Button variant="ghost" className="w-full justify-start"><File className="mr-2"/> Document</Button>
              </div>
            </PopoverContent>
          </Popover>
          <Input
            autoComplete='off'
            placeholder="Type your message..."
            className="flex-1 rounded-full h-11 px-4"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" size="icon" className="rounded-full flex-shrink-0 h-11 w-11">
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}
