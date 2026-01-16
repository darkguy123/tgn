'use client';
import { useRouter, useParams } from 'next/navigation';
import { EventForm } from '@/components/admin/EventForm';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { eventId } = params;
  const firestore = useFirestore();
  const { toast } = useToast();

  const eventRef = useMemoFirebase(
    () => (eventId ? doc(firestore, 'events', eventId as string) : null),
    [firestore, eventId]
  );
  
  const { data: event, isLoading, error } = useDoc<Event>(eventRef);

  const handleSave = async (data: Omit<Event, 'id' | 'createdAt'>) => {
    if (!eventRef) return;
    try {
      await updateDoc(eventRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Event Updated',
        description: `${data.name} has been successfully updated.`,
      });
      router.push('/admin/events');
    } catch (e) {
      console.error('Failed to update event:', e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update the event. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <Skeleton className="h-10 w-10" />
                <div className='space-y-2'>
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
            </div>
            <div className="space-y-4 rounded-lg border p-6">
                 <Skeleton className="h-6 w-32" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-6 w-32" />
                 <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
  }

  if (error) {
    return <div className="text-destructive">Error loading event data.</div>;
  }

  if (!event) {
    return <div>Event not found.</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Event</h1>
          <p className="text-muted-foreground">Editing &quot;{event.name}&quot;</p>
        </div>
      </div>
      <EventForm onSave={handleSave} initialData={event} />
    </div>
  );
}
