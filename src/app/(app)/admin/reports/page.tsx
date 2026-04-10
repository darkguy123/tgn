'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { Report } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminReportsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const reportsQuery = firestore ? query(collection(firestore, 'reports'), orderBy('createdAt', 'desc')) : null;
  const { data: reports, isLoading } = useCollection<Report>(reportsQuery);

  const handleDeletePost = async (postId: string, reportId: string) => {
    if (!firestore) return;
    if (!window.confirm('Are you sure you want to delete this reported post? This action cannot be undone.')) return;

    try {
      // Delete the post
      await deleteDoc(doc(firestore, 'posts', postId));
      // Delete the report
      await deleteDoc(doc(firestore, 'reports', reportId));
      
      toast({ title: 'Post Deleted', description: 'The reported post has been successfully removed.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete post: ' + e.message });
    }
  };

  const handleDismissReport = async (reportId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'reports', reportId));
      toast({ title: 'Report Dismissed', description: 'The report has been removed.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to dismiss report.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Reports</h1>
          <p className="text-muted-foreground">Manage posts reported by community members.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reported Posts</CardTitle>
          <CardDescription>Review reports and take action on community posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}
            
            {!isLoading && reports?.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                No reports found. The community is behaving well!
              </div>
            )}

            {!isLoading && reports && reports.map((report) => (
              <div key={report.id} className="flex flex-col md:flex-row justify-between gap-4 p-4 border rounded-lg bg-card">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Post ID:</span>
                    <span className="text-xs font-mono text-muted-foreground">{report.postId}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Reason: </span>
                    {report.reason}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Reported {report.createdAt?.toDate ? formatDistanceToNow(report.createdAt.toDate(), { addSuffix: true }) : 'recently'} 
                    by user {report.reportedBy}
                  </div>
                </div>
                <div className="flex flex-row md:flex-col gap-2 shrink-0">
                  <Button variant="destructive" size="sm" onClick={() => handleDeletePost(report.postId, report.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDismissReport(report.id)}>
                    Dismiss Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
