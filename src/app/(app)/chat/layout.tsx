'use client';
import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, Timestamp } from 'firebase/firestore';
import type { Chat, TGNMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function ChatListItem({ chat, isActive }: { chat: Chat, isActive: boolean }) {
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
      className={cn(
        "block p-3 hover:bg-muted rounded-lg transition-colors",
        isActive && "bg-muted"
      )}
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

function ChatList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const pathname = usePathname();

    const chatsQuery = useMemoFirebase(
        () =>
        user
            ? query(
                collection(firestore, 'chats'),
                where('members', 'array-contains', user.uid)
            )
            : null,
        [user, firestore]
    );

    const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

    const sortedChats = useMemo(() => {
        if (!chats) return [];
        return [...chats].sort((a, b) => {
            const timeA = a.lastMessage?.timestamp?.toDate()?.getTime() || 0;
            const timeB = b.lastMessage?.timestamp?.toDate()?.getTime() || 0;
            return timeB - timeA;
        });
    }, [chats]);
    
    return (
        <Card className="h-full flex flex-col rounded-none md:rounded-lg border-0 md:border">
            <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Your private conversations.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
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
                {!isLoading && sortedChats?.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <MessageSquarePlus className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-medium">No Conversations</h3>
                        <p className="mt-1 text-sm">Connect with members to start chatting.</p>
                    </div>
                )}
                {!isLoading && sortedChats && sortedChats.length > 0 && (
                    <div className="divide-y">
                        {sortedChats.filter(chat => chat.lastMessage).map(chat => (
                            <ChatListItem key={chat.id} chat={chat} isActive={pathname.includes(chat.members.find(id => id !== user?.uid) || '')} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isRootChat = pathname === '/chat';
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-120px)] border rounded-lg overflow-hidden">
            <aside className={cn(
                'md:col-span-4 lg:col-span-3 border-r h-full',
                isRootChat ? 'block' : 'hidden md:block'
            )}>
                <ChatList />
            </aside>
            <main className={cn(
                'md:col-span-8 lg:col-span-9 h-full',
                isRootChat ? 'hidden md:flex' : 'block'
            )}>
                {children}
            </main>
        </div>
    );
}
