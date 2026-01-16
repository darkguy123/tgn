'use client';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { Program } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function AdminProgramsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const programsRef = useMemoFirebase(
    () => collection(firestore, 'programs'),
    [firestore]
  );
  const {
    data: programs,
    isLoading,
    error,
  } = useCollection<Program>(programsRef);

  const activePrograms = programs?.filter(p => !p.deactivatedAt) ?? [];
  const deactivatedPrograms = programs?.filter(p => !!p.deactivatedAt) ?? [];

  const handleDeactivate = async (programId: string) => {
    const programDocRef = doc(firestore, 'programs', programId);
    try {
      await updateDoc(programDocRef, { deactivatedAt: serverTimestamp() });
      toast({
        title: 'Program Deactivated',
        description: 'The program has been moved to the trash.',
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not deactivate program.',
      });
    }
  };

  const handleRestore = async (programId: string) => {
    const programDocRef = doc(firestore, 'programs', programId);
    try {
      await updateDoc(programDocRef, { deactivatedAt: null });
      toast({
        title: 'Program Restored',
        description: 'The program has been restored from the trash.',
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not restore program.',
      });
    }
  };

  const handleDeletePermanently = async (programId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this program? This action cannot be undone.'
      )
    ) {
      return;
    }
    const programDocRef = doc(firestore, 'programs', programId);
    try {
      await deleteDoc(programDocRef);
      toast({
        title: 'Program Deleted',
        description: 'The program has been permanently deleted.',
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not permanently delete program.',
      });
    }
  };

  const renderTable = (programList: Program[], isDeactivated = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Format</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Enrolled</TableHead>
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
                <Skeleton className="h-4 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        {!isLoading && programList.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="h-24 text-center text-muted-foreground"
            >
              No programs in this view.
            </TableCell>
          </TableRow>
        )}
        {programList?.map(program => (
          <TableRow key={program.id}>
            <TableCell className="font-medium">{program.title}</TableCell>
            <TableCell>
              <Badge
                variant={
                  program.type === 'Free'
                    ? 'secondary'
                    : program.type === 'Paid'
                      ? 'outline'
                      : 'default'
                }
              >
                {program.type}
              </Badge>
            </TableCell>
            <TableCell>{program.format}</TableCell>
            <TableCell>{program.price ? `$${program.price}` : 'Free'}</TableCell>
            <TableCell>{program.enrolled || 0}</TableCell>
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
                        <Link href={`/admin/programs/${program.id}/edit`}>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeactivate(program.id)}>
                        <Archive className="mr-2 h-4 w-4" /> Deactivate
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => handleRestore(program.id)}>
                        <Undo className="mr-2 h-4 w-4" /> Restore
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeletePermanently(program.id)}
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
            Program Management
          </h1>
          <p className="text-muted-foreground">
            Create, edit, and manage all learning programs.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/programs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Program
          </Link>
        </Button>
      </div>

      <Card>
        <Tabs defaultValue="active">
          <CardHeader>
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="deactivated">
                Trash ({deactivatedPrograms.length})
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="text-center text-destructive">
                Failed to load programs.
              </p>
            )}
            <TabsContent value="active">{renderTable(activePrograms)}</TabsContent>
            <TabsContent value="deactivated">
              {renderTable(deactivatedPrograms, true)}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
