'use client';
import { useRouter } from 'next/navigation';
import { EventForm } from '@/components/admin/EventForm';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewEventPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSave = async (data: Omit<Event, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(firestore, 'events'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Event Created',
        description: `${data.name} has been successfully created.`,
      });
      router.push('/admin/events');
    } catch (error) {
      console.error('Failed to create event:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create the event. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Event</h1>
          <p className="text-muted-foreground">Fill out the details for the new event.</p>
        </div>
      </div>
      <EventForm onSave={handleSave} />
    </div>
  );
}
