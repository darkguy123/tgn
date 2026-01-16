'use client';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  PlusCircle,
  Archive,
  Undo,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AdminEventsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const eventsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'events') : null),
    [firestore]
  );
  const {
    data: events,
    isLoading,
    error,
  } = useCollection<Event>(eventsRef);

  const activeEvents = events?.filter(p => !p.deactivatedAt) ?? [];
  const deactivatedEvents = events?.filter(p => !!p.deactivatedAt) ?? [];

  const handleDeactivate = (eventId: string) => {
    if (!firestore) return;
    const eventDocRef = doc(firestore, 'events', eventId);
    
    updateDoc(eventDocRef, { deactivatedAt: serverTimestamp() })
      .then(() => {
        toast({
          title: 'Event Deactivated',
          description: 'The event has been moved to the trash.',
        });
      })
      .catch((e) => {
        console.error(e);
        const permissionError = new FirestorePermissionError({ path: eventDocRef.path, operation: 'update' });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not deactivate event.' });
      });
  };

  const handleRestore = (eventId: string) => {
    if (!firestore) return;
    const eventDocRef = doc(firestore, 'events', eventId);
    
    updateDoc(eventDocRef, { deactivatedAt: null })
      .then(() => {
        toast({ title: 'Event Restored', description: 'The event has been restored from the trash.' });
      })
      .catch((e) => {
        console.error(e);
        const permissionError = new FirestorePermissionError({ path: eventDocRef.path, operation: 'update' });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not restore event.' });
      });
  };

  const handleDeletePermanently = (eventId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this event? This action cannot be undone.') || !firestore) {
      return;
    }
    const eventDocRef = doc(firestore, 'events', eventId);
    
    deleteDoc(eventDocRef)
      .then(() => {
        toast({ title: 'Event Deleted', description: 'The event has been permanently deleted.' });
      })
      .catch((e) => {
        console.error(e);
        const permissionError = new FirestorePermissionError({ path: eventDocRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not permanently delete event.' });
      });
  };

  const renderTable = (eventList: Event[], isDeactivated = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
               <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        {!isLoading && eventList.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="h-24 text-center text-muted-foreground"
            >
              No events in this view.
            </TableCell>
          </TableRow>
        )}
        {eventList?.map(event => (
          <TableRow key={event.id}>
            <TableCell className="font-medium">{event.name}</TableCell>
            <TableCell>
              <Badge variant="secondary">{event.type}</Badge>
            </TableCell>
            <TableCell>
              {event.startDate?.toDate ? format(event.startDate.toDate(), 'MMM d, yyyy') : 'N/A'}
            </TableCell>
            <TableCell>{event.location}</TableCell>
            <TableCell>{event.price ? `$${event.price}` : 'Free'}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  {!isDeactivated ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/events/${event.id}/edit`}>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeactivate(event.id)}>
                        <Archive className="mr-2 h-4 w-4" /> Deactivate
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => handleRestore(event.id)}>
                        <Undo className="mr-2 h-4 w-4" /> Restore
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeletePermanently(event.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Event Management
          </h1>
          <p className="text-muted-foreground">
            Create, edit, and manage all network events.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <Card>
        <Tabs defaultValue="active">
          <CardHeader>
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="deactivated">
                Trash ({deactivatedEvents.length})
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-center text-destructive">
                Failed to load events.
              </p>
            )}
            <TabsContent value="active">{renderTable(activeEvents)}</TabsContent>
            <TabsContent value="deactivated">
              {renderTable(deactivatedEvents, true)}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
