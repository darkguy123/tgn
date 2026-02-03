'use client';
import { useState } from 'react';
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError, useUser } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { Cause } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMemberProfile } from '@/hooks/useMemberProfile';

export default function AdminFundraisePage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { profile } = useMemberProfile();
  const fundraisersRef = useMemoFirebase(() => (firestore && user && profile ? collection(firestore, 'causes') : null), [firestore, user, profile]);
  const { data: fundraisers, isLoading, error } = useCollection<Cause>(fundraisersRef);
  const { toast } = useToast();

  const [rejectionCause, setRejectionCause] = useState<Cause | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleUpdateStatus = (fundraiserId: string, status: 'approved' | 'rejected', reason?: string) => {
    if (!firestore) return;
    const fundraiserDocRef = doc(firestore, 'causes', fundraiserId);
    
    const updateData: { status: 'approved' | 'rejected', rejectionReason?: string } = { status };
    if (status === 'rejected' && reason) {
      updateData.rejectionReason = reason;
    }

    updateDoc(fundraiserDocRef, updateData)
      .then(() => {
        toast({
          title: 'Fundraiser Updated',
          description: `The fundraiser has been ${status}.`,
        });
      })
      .catch((serverError) => {
        console.error("Failed to update fundraiser status: ", serverError);
        const permissionError = new FirestorePermissionError({
          path: fundraiserDocRef.path,
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
  
  const handleConfirmRejection = () => {
    if (rejectionCause) {
        handleUpdateStatus(rejectionCause.id, 'rejected', rejectionReason);
        setRejectionCause(null);
        setRejectionReason('');
    }
  };

  const renderTable = (filteredFundraisers: Cause[]) => (
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
        {filteredFundraisers.map(fundraiser => (
          <TableRow key={fundraiser.id}>
            <TableCell>{fundraiser.creatorName}</TableCell>
            <TableCell className="font-medium">{fundraiser.title}</TableCell>
            <TableCell>${fundraiser.goalAmount.toLocaleString()}</TableCell>
            <TableCell>
              <Badge
                variant={
                  fundraiser.status === 'approved'
                    ? 'default'
                    : fundraiser.status === 'rejected'
                    ? 'destructive'
                    : 'secondary'
                }
                className={cn(fundraiser.status === 'approved' && 'bg-green-600')}
              >
                {fundraiser.status}
              </Badge>
            </TableCell>
            <TableCell>
              {fundraiser.createdAt?.toDate ? formatDistanceToNow(fundraiser.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
            </TableCell>
            <TableCell className="text-right">
              {fundraiser.status === 'pending' && (
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleUpdateStatus(fundraiser.id, 'approved')}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRejectionCause(fundraiser)}>
                      <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TableCell>
          </TableRow>
        ))}
        {filteredFundraisers.length === 0 && (
            <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                    No fundraisers in this category.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const pendingFundraisers = fundraisers?.filter(c => c.status === 'pending') ?? [];
  const approvedFundraisers = fundraisers?.filter(c => c.status === 'approved') ?? [];
  const rejectedFundraisers = fundraisers?.filter(c => c.status === 'rejected') ?? [];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fundraiser Management</h1>
            <p className="text-muted-foreground">
              Review, approve, and manage all member-submitted fundraisers.
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="pending">
              <div className="px-6 pt-4">
                  <TabsList>
                  <TabsTrigger value="pending">
                      <Clock className="mr-2 h-4 w-4" /> Pending ({pendingFundraisers.length})
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                      <CheckCircle className="mr-2 h-4 w-4" /> Approved ({approvedFundraisers.length})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                      <XCircle className="mr-2 h-4 w-4" /> Rejected ({rejectedFundraisers.length})
                  </TabsTrigger>
                  </TabsList>
              </div>
              
              {isLoading && <div className="p-6">
                  {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12 w-full mt-2" />)}
              </div>}

              {error && <p className="p-6 text-destructive">Failed to load fundraisers.</p>}

              {!isLoading && fundraisers && (
                  <>
                      <TabsContent value="pending" className="m-0">
                          {renderTable(pendingFundraisers)}
                      </TabsContent>
                      <TabsContent value="approved" className="m-0">
                          {renderTable(approvedFundraisers)}
                      </TabsContent>
                      <TabsContent value="rejected" className="m-0">
                          {renderTable(rejectedFundraisers)}
                      </TabsContent>
                  </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>

       <Dialog open={!!rejectionCause} onOpenChange={(isOpen) => !isOpen && setRejectionCause(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Fundraiser: {rejectionCause?.title}</DialogTitle>
            <DialogDescription>
                Please provide a reason for rejecting this fundraiser.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="rejectionReason" className="sr-only">Rejection Reason</Label>
            <Textarea
              id="rejectionReason"
              placeholder="e.g., Fundraiser does not align with community guidelines."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionCause(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmRejection}>Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}