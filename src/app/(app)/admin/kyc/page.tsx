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
import { CheckCircle, XCircle, Clock, MoreHorizontal, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError, useUser } from '@/firebase';
import { collection, doc, updateDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import type { MentorKYC } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useMemberProfile } from '@/hooks/useMemberProfile';

export default function AdminKycPage() {
  const firestore = useFirestore();
  const { profile } = useMemberProfile();
  
  // Guard the query to wait for profile (admin validation)
  const kycRef = useMemoFirebase(() => (firestore && profile) ? collection(firestore, 'mentor_kyc') : null, [firestore, profile]);
  const { data: kycSubmissions, isLoading, error } = useCollection<MentorKYC>(kycRef);
  const { toast } = useToast();

  const handleUpdateStatus = (kycId: string, memberId: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    const kycDocRef = doc(firestore, 'mentor_kyc', kycId);
    const userDocRef = doc(firestore, 'users', memberId);

    runTransaction(firestore, async (transaction) => {
      transaction.update(kycDocRef, { status, reviewedAt: serverTimestamp() });
      if (status === 'approved') {
        transaction.update(userDocRef, { isVerifiedMentor: true });
      } else {
        // If they were previously approved, we might want to revoke it.
        const userDoc = await transaction.get(userDocRef);
        if (userDoc.exists() && userDoc.data().isVerifiedMentor) {
          transaction.update(userDocRef, { isVerifiedMentor: false });
        }
      }
    }).then(() => {
      toast({
        title: 'KYC Submission Updated',
        description: `The submission has been ${status}.`,
      });
    }).catch((serverError) => {
      console.error("Failed to update KYC status: ", serverError);
      const permissionError = new FirestorePermissionError({
          path: kycDocRef.path,
          operation: 'update',
          requestResourceData: { status }
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the KYC status.',
      });
    });
  };

  const renderTable = (filteredSubmissions: MentorKYC[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member ID</TableHead>
          <TableHead>NIN</TableHead>
          <TableHead>BVN</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredSubmissions.map(kyc => (
          <TableRow key={kyc.id}>
            <TableCell className="font-mono text-xs">{kyc.memberId}</TableCell>
            <TableCell>{kyc.nin}</TableCell>
            <TableCell>{kyc.bvn}</TableCell>
            <TableCell>
              <Badge
                variant={
                  kyc.status === 'approved'
                    ? 'default'
                    : kyc.status === 'rejected'
                    ? 'destructive'
                    : 'secondary'
                }
                className={cn(kyc.status === 'approved' && 'bg-green-600')}
              >
                {kyc.status}
              </Badge>
            </TableCell>
            <TableCell>
              {kyc.submittedAt?.toDate ? formatDistanceToNow(kyc.submittedAt.toDate(), { addSuffix: true }) : 'N/A'}
            </TableCell>
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
                  {kyc.status === 'pending' && (
                    <>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(kyc.id, kyc.memberId, 'approved')}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(kyc.id, kyc.memberId, 'rejected')}>
                        <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                      </DropdownMenuItem>
                    </>
                  )}
                   <DropdownMenuItem asChild>
                        <a href={kyc.certificateUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> View Certificate
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <a href={kyc.degreeUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> View Degree
                        </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Facial Scans</DropdownMenuLabel>
                    {kyc.faceScanFrontUrl && <DropdownMenuItem asChild><a href={kyc.faceScanFrontUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> View Front Face</a></DropdownMenuItem>}
                    {kyc.faceScanLeftUrl && <DropdownMenuItem asChild><a href={kyc.faceScanLeftUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> View Left Face</a></DropdownMenuItem>}
                    {kyc.faceScanRightUrl && <DropdownMenuItem asChild><a href={kyc.faceScanRightUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> View Right Face</a></DropdownMenuItem>}
                    {kyc.faceScanSmileUrl && <DropdownMenuItem asChild><a href={kyc.faceScanSmileUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> View Smile</a></DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
        {filteredSubmissions.length === 0 && (
            <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                    No KYC submissions in this category.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const pendingKyc = kycSubmissions?.filter(c => c.status === 'pending') ?? [];
  const approvedKyc = kycSubmissions?.filter(c => c.status === 'approved') ?? [];
  const rejectedKyc = kycSubmissions?.filter(c => c.status === 'rejected') ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KYC Management</h1>
          <p className="text-muted-foreground">
            Review and verify mentor submissions.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="pending">
            <div className="px-6 pt-4">
                <TabsList>
                <TabsTrigger value="pending">
                    <Clock className="mr-2 h-4 w-4" /> Pending ({pendingKyc.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                    <CheckCircle className="mr-2 h-4 w-4" /> Approved ({approvedKyc.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                    <XCircle className="mr-2 h-4 w-4" /> Rejected ({rejectedKyc.length})
                </TabsTrigger>
                </TabsList>
            </div>
            
            {isLoading && <div className="p-6">
                {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12 w-full mt-2" />)}
            </div>}

            {error && <p className="p-6 text-destructive">Failed to load KYC submissions.</p>}

            {!isLoading && kycSubmissions && (
                <>
                    <TabsContent value="pending" className="m-0">
                        {renderTable(pendingKyc)}
                    </TabsContent>
                    <TabsContent value="approved" className="m-0">
                        {renderTable(approvedKyc)}
                    </TabsContent>
                    <TabsContent value="rejected" className="m-0">
                        {renderTable(rejectedKyc)}
                    </TabsContent>
                </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}