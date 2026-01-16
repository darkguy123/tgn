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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Program } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminProgramsPage() {
  const firestore = useFirestore();
  const programsRef = collection(firestore, 'programs');
  const {
    data: programs,
    isLoading,
    error,
  } = useCollection<Program>(programsRef);

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
        <CardHeader>
          <CardTitle>All Programs</CardTitle>
          <CardDescription>
            A list of all programs in the network.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                Array.from({ length: 5 }).map((_, i) => (
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
              {error && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-destructive">
                    Failed to load programs.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && programs?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No programs found.
                  </TableCell>
                </TableRow>
              )}
              {programs?.map(program => (
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
                  <TableCell>
                    {program.price ? `$${program.price}` : 'Free'}
                  </TableCell>
                  <TableCell>{program.enrolled || 0}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                           <Link href={`/admin/programs/${program.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Deactivate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
