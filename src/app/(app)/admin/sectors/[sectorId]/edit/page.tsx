'use client';
import { useRouter, useParams } from 'next/navigation';
import { SectorForm } from '@/components/admin/SectorForm';
import { useFirestore, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Sector } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditSectorPage() {
  const router = useRouter();
  const params = useParams();
  const { sectorId } = params;
  const firestore = useFirestore();
  const { toast } = useToast();

  const sectorRef = useMemoFirebase(
    () => (firestore && sectorId ? doc(firestore, 'sectors', sectorId as string) : null),
    [firestore, sectorId]
  );
  
  const { data: sector, isLoading, error } = useDoc<Sector>(sectorRef);

  const handleSave = async (data: Omit<Sector, 'id'>) => {
    if (!sectorRef) return;
    
    updateDoc(sectorRef, data)
      .then(() => {
        toast({
          title: 'Sector Updated',
          description: `${data.name} has been successfully updated.`,
        });
        router.push('/admin/sectors');
      })
      .catch((serverError) => {
        console.error('Failed to update sector:', serverError);
        const permissionError = new FirestorePermissionError({
          path: sectorRef.path,
          operation: 'update',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update the sector. Please try again.',
        });
      });
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
    return <div className="text-destructive">Error loading sector data.</div>;
  }

  if (!sector) {
    return <div>Sector not found.</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Sector</h1>
          <p className="text-muted-foreground">Editing &quot;{sector.name}&quot;</p>
        </div>
      </div>
      <SectorForm onSave={handleSave} initialData={sector} />
    </div>
  );
}
