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
import {
  MoreHorizontal,
  PlusCircle,
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
  deleteDoc,
} from 'firebase/firestore';
import type { Sector } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminSectorsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const sectorsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'sectors') : null),
    [firestore]
  );
  const {
    data: sectors,
    isLoading,
    error,
  } = useCollection<Sector>(sectorsRef);

  const handleDeletePermanently = (sectorId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this sector? This action cannot be undone.') || !firestore) {
      return;
    }
    const sectorDocRef = doc(firestore, 'sectors', sectorId);
    
    deleteDoc(sectorDocRef)
      .then(() => {
        toast({ title: 'Sector Deleted', description: 'The sector has been permanently deleted.' });
      })
      .catch((e) => {
        console.error(e);
        const permissionError = new FirestorePermissionError({ path: sectorDocRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not permanently delete sector.' });
      });
  };

  const renderTable = (sectorList: Sector[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-64" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        {!isLoading && sectorList.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={3}
              className="h-24 text-center text-muted-foreground"
            >
              No sectors found.
            </TableCell>
          </TableRow>
        )}
        {sectorList?.map(sector => (
          <TableRow key={sector.id}>
            <TableCell className="font-medium">{sector.name}</TableCell>
            <TableCell>{sector.description}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/sectors/${sector.id}/edit`}>
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDeletePermanently(sector.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                  </DropdownMenuItem>
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
            Sector Management
          </h1>
          <p className="text-muted-foreground">
            Create, edit, and manage all mentorship sectors.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/sectors/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Sector
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent>
          {error && (
            <p className="text-center text-destructive p-4">
              Failed to load sectors.
            </p>
          )}
          {sectors && renderTable(sectors)}
        </CardContent>
      </Card>
    </div>
  );
}
