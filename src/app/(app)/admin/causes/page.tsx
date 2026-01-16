'use client';
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
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { Cause } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function AdminCausesPage() {
  const firestore = useFirestore();
  const causesRef = useMemoFirebase(() => collection(firestore, 'causes'), [firestore]);
  const { data: causes, isLoading, error } = useCollection<Cause>(causesRef);
  const { toast } = useToast();

  const handleUpdateStatus = (causeId: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    const causeDocRef = doc(firestore, 'causes', causeId);
    
    updateDoc(causeDocRef, { status })
      .then(() => {
        toast({
          title: 'Cause Updated',
          description: `The cause has been ${status}.`,
        });
      })
      .catch((serverError) => {
        console.error("Failed to update cause status: ", serverError);
        const permissionError = new FirestorePermissionError({
          path: causeDocRef.path,
          operation: 'update',
          requestResourceData: { status }
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'You do not have permission to perform this action.',
        });
      });
  };

  const renderTable = (filteredCauses: Cause[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Creator</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Goal</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredCauses.map(cause => (
          <TableRow key={cause.id}>
            <TableCell>{cause.creatorName}</TableCell>
            <TableCell className="font-medium">{cause.title}</TableCell>
            <TableCell>${cause.goalAmount.toLocaleString()}</TableCell>
            <TableCell>
              <Badge
                variant={
                  cause.status === 'approved'
                    ? 'default'
                    : cause.status === 'rejected'
                    ? 'destructive'
                    : 'secondary'
                }
                className={cn(cause.status === 'approved' && 'bg-green-600')}
              >
                {cause.status}
              </Badge>
            </TableCell>
            <TableCell>
              {cause.createdAt?.toDate ? formatDistanceToNow(cause.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
            </TableCell>
            <TableCell className="text-right">
              {cause.status === 'pending' && (
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleUpdateStatus(cause.id, 'approved')}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateStatus(cause.id, 'rejected')}>
                      <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TableCell>
          </TableRow>
        ))}
        {filteredCauses.length === 0 && (
            <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                    No causes in this category.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const pendingCauses = causes?.filter(c => c.status === 'pending') ?? [];
  const approvedCauses = causes?.filter(c => c.status === 'approved') ?? [];
  const rejectedCauses = causes?.filter(c => c.status === 'rejected') ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cause Management</h1>
          <p className="text-muted-foreground">
            Review, approve, and manage all member-submitted causes.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="pending">
            <div className="px-6 pt-4">
                <TabsList>
                <TabsTrigger value="pending">
                    <Clock className="mr-2 h-4 w-4" /> Pending ({pendingCauses.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                    <CheckCircle className="mr-2 h-4 w-4" /> Approved ({approvedCauses.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                    <XCircle className="mr-2 h-4 w-4" /> Rejected ({rejectedCauses.length})
                </TabsTrigger>
                </TabsList>
            </div>
            
            {isLoading && <div className="p-6">
                {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12 w-full mt-2" />)}
            </div>}

            {error && <p className="p-6 text-destructive">Failed to load causes.</p>}

            {!isLoading && causes && (
                <>
                    <TabsContent value="pending" className="m-0">
                        {renderTable(pendingCauses)}
                    </TabsContent>
                    <TabsContent value="approved" className="m-0">
                        {renderTable(approvedCauses)}
                    </TabsContent>
                    <TabsContent value="rejected" className="m-0">
                        {renderTable(rejectedCauses)}
                    </TabsContent>
                </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
