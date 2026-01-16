'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, Timestamp } from 'firebase/firestore';
import type { Chat, TGNMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';

function ChatListItem({ chat }: { chat: Chat }) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();

  const otherParticipantId = useMemo(() => {
    return chat.members.find(id => id !== currentUser?.uid);
  }, [chat.members, currentUser]);

  const otherUserRef = useMemoFirebase(
    () => (otherParticipantId ? doc(firestore, 'users', otherParticipantId) : null),
    [firestore, otherParticipantId]
  );
  const { data: otherUser, isLoading } = useDoc<TGNMember>(otherUserRef);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 p-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return null;
  }
  
  const otherUserName = otherUser.name || otherUser.email.split('@')[0];

  return (
    <Link
      href={`/chat/${otherUser.id}`}
      className="block p-3 hover:bg-muted rounded-lg transition-colors"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={otherUser.avatarUrl} alt={otherUserName} />
          <AvatarFallback>{otherUserName ? otherUserName.charAt(0) : 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <p className="font-semibold truncate">{otherUserName}</p>
            {chat.lastMessage?.timestamp && (
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(chat.lastMessage.timestamp.toDate(), { addSuffix: true })}
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {chat.lastMessage?.text || 'No messages yet.'}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function ChatListPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const chatsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, 'chats'),
            where('members', 'array-contains', user.uid),
            where('lastMessage.timestamp', '>', Timestamp.fromMillis(0)),
            orderBy('lastMessage.timestamp', 'desc')
          )
        : null,
    [user, firestore]
  );

  const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

  return (
    <div className="space-y-6">
       <header>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Your private conversations with other TGN members.
        </p>
      </header>
      <Card>
        <CardContent className="p-0">
          {isLoading && (
             <div className="p-3 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-2">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                ))}
             </div>
          )}
          {!isLoading && chats?.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
                <MessageSquarePlus className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-medium">No Conversations</h3>
                <p className="mt-1 text-sm">Connect with members in the directory to start chatting.</p>
            </div>
          )}
          {!isLoading && chats && chats.length > 0 && (
            <div className="divide-y">
                {chats.map(chat => (
                    <ChatListItem key={chat.id} chat={chat} />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
