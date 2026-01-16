'use client';
import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import placeholderImages from '@/lib/placeholder-images.json';
import { Calendar, Clock, MapPin, Ticket, Video } from 'lucide-react';
import { format } from 'date-fns';

const getImage = (imageId?: string) => {
  if (!imageId) {
    return placeholderImages.placeholderImages.find(p => p.id === 'program-global-business');
  }
  return placeholderImages.placeholderImages.find(p => p.id === imageId);
};

export default function EventsPage() {
  const firestore = useFirestore();
  const eventsQuery = useMemoFirebase(
    () => query(collection(firestore, 'events'), where('deactivatedAt', '==', null)),
    [firestore]
  );
  const { data: events, isLoading, error } = useCollection<Event>(eventsQuery);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Events &amp; Congresses</h1>
        <p className="text-muted-foreground">
          Join our global community at exclusive events, both online and in-person.
        </p>
      </header>

      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-destructive">Failed to load events.</p>
        </div>
      )}
      
      {!isLoading && events?.length === 0 && (
         <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Upcoming Events</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Check back soon for our next global event.
            </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map(event => {
          const image = getImage(event.imageUrl);
          const startDate = event.startDate?.toDate ? event.startDate.toDate() : new Date();
          
          return (
            <Card key={event.id} className="flex flex-col overflow-hidden">
                <CardHeader className="p-0">
                    {image && (
                         <Image
                            src={image.imageUrl}
                            alt={event.name}
                            width={600}
                            height={400}
                            className="aspect-video w-full object-cover"
                            data-ai-hint={image.imageHint}
                        />
                    )}
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col">
                    <CardTitle className="text-lg mb-2">{event.name}</CardTitle>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{format(startDate, "MMMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{format(startDate, "p")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{event.description}</p>
                </CardContent>
                 <CardContent className="p-4 pt-0">
                    {event.price && event.price > 0 ? (
                        <Button className="w-full">
                            <Ticket className="mr-2 h-4 w-4"/>
                            Get Ticket - ${event.price}
                        </Button>
                    ) : (
                         <Button className="w-full">
                            <Ticket className="mr-2 h-4 w-4"/>
                            RSVP - Free
                        </Button>
                    )}
                    {event.googleMeetUrl && (
                        <Button asChild variant="outline" className="w-full mt-2">
                            <a href={event.googleMeetUrl} target="_blank" rel="noopener noreferrer">
                                <Video className="mr-2 h-4 w-4" />
                                Join Virtual Session
                            </a>
                        </Button>
                    )}
                </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
