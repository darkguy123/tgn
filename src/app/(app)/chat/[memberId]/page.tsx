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
import { cn } from '@/lib/utils';
import type { TGNMember, ChatMessage, Chat } from '@/lib/types';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, collection, query, orderBy, addDoc, setDoc, updateDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

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
  const otherMemberRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', otherMemberId) : null, [firestore, otherMemberId]);
  const chatDocRef = useMemoFirebase(() => (firestore && chatId) ? doc(firestore, 'chats', chatId) : null, [firestore, chatId]);

  // Data fetching hooks
  const { data: otherMember, isLoading: isOtherUserLoading, error: otherMemberError } = useDoc<TGNMember>(otherMemberRef);
  const { data: chatData, isLoading: isChatLoading } = useDoc<Chat>(chatDocRef);
  
  const messagesQuery = useMemoFirebase(() => {
    // Only query for messages if the chat document is known to exist.
    if (chatData && chatDocRef) {
        return query(collection(chatDocRef, 'messages'), orderBy('createdAt', 'asc'));
    }
    return null;
  }, [chatDocRef, chatData]);

  const { data: messages, isLoading: areMessagesLoading } = useCollection<ChatMessage>(messagesQuery);
  
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
    if (!chatDocRef || !currentUser || isChatLoading) return;
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    const isTyping = newMessage.length > 0;
    
    const typingUpdate = { [`typing.${currentUser.uid}`]: isTyping };

    // Update typing status. If the chat document doesn't exist, this will fail gracefully.
    // The chat doc will be created on the first message.
    if(chatData) {
        updateDoc(chatDocRef, typingUpdate).catch((e) => {
            console.warn("Could not update typing indicator:", e.message);
        });
    }

    // If user stops typing, set status to false after a delay
    if (!isTyping && chatData) {
        typingTimeoutRef.current = setTimeout(() => {
            updateDoc(chatDocRef, { [`typing.${currentUser.uid}`]: false }).catch((e) => {
                 console.warn("Could not update typing indicator:", e.message);
            });
        }, 2000);
    }
    
    return () => {
        if(typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    }
  }, [newMessage, chatDocRef, currentUser, chatData, isChatLoading]);
  
  const otherUserIsTyping = chatData?.typing?.[otherMemberId] === true;
  const otherMemberName = otherMember?.name || otherMember?.email?.split('@')[0] || 'User';
  const isLoading = isOtherUserLoading || isChatLoading;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser || !chatDocRef || !firestore) return;
  
    const content = newMessage;
    setNewMessage('');
  
    try {
      await runTransaction(firestore, async (transaction) => {
        const chatDoc = await transaction.get(chatDocRef);
        const messagesColRef = collection(chatDocRef, 'messages');
        const newMessageRef = doc(messagesColRef);
  
        const messageData = {
          senderId: currentUser.uid,
          content: content,
          type: 'text' as const,
          createdAt: serverTimestamp(),
        };
  
        // If chat doesn't exist, create it within the transaction
        if (!chatDoc.exists()) {
          const newChatData = {
            members: [currentUser.uid, otherMemberId],
            typing: {},
          };
          transaction.set(chatDocRef, newChatData);
        }
  
        // Set the new message
        transaction.set(newMessageRef, messageData);
  
        // Update the lastMessage on the chat doc
        transaction.update(chatDocRef, {
          lastMessage: {
            text: content,
            senderId: currentUser.uid,
            timestamp: serverTimestamp(),
          },
        });
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      const permissionError = new FirestorePermissionError({
        path: chatDocRef.path,
        operation: 'write',
        requestResourceData: { message: content },
      });
      errorEmitter.emit('permission-error', permissionError);
    }
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
  
  if (otherMemberError || !otherMember) {
      notFound();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-card border rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => router.push('/chat')}>
            <ArrowLeft />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherMember?.avatarUrl} />
            <AvatarFallback>{otherMemberName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold truncate">{otherMemberName}</p>
            <p className="text-xs text-green-500 h-4">
              {otherUserIsTyping ? <span className="italic animate-pulse">typing...</span> : (chatData ? 'Online' : '')}
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
        {(isLoading || areMessagesLoading) && !messages && <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div>}
        {messages?.map(msg => (
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
         {chatData && messages?.length === 0 && !areMessagesLoading && (
            <div className="text-center text-muted-foreground pt-10">
                <p>This is the beginning of your conversation with {otherMemberName}.</p>
            </div>
        )}
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
