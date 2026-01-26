'use client';
import { MessageSquare } from 'lucide-react';

export default function ChatPlaceholderPage() {
  return (
    <div className="hidden h-full flex-col items-center justify-center bg-muted/30 md:flex">
      <MessageSquare className="h-20 w-20 text-muted-foreground/50" />
      <h2 className="mt-4 text-xl font-semibold text-muted-foreground">Select a chat</h2>
      <p className="text-muted-foreground">Choose a conversation from the left to start messaging.</p>
    </div>
  );
}
