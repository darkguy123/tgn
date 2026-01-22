'use client';
import { useRouter } from 'next/navigation';
import { SectorForm } from '@/components/admin/SectorForm';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { Sector } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewSectorPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSave = async (data: Omit<Sector, 'id'>) => {
    if (!firestore) return;
    const sectorsCollection = collection(firestore, 'sectors');
    const dataToSave = {
      ...data,
      createdAt: serverTimestamp(),
    };

    addDoc(sectorsCollection, dataToSave)
      .then(() => {
        toast({
          title: 'Sector Created',
          description: `${data.name} has been successfully created.`,
        });
        router.push('/admin/sectors');
      })
      .catch((error) => {
        console.error('Failed to create sector:', error);
        const permissionError = new FirestorePermissionError({
          path: sectorsCollection.path,
          operation: 'create',
          requestResourceData: dataToSave
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create the sector. Please try again.',
        });
      });
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Sector</h1>
          <p className="text-muted-foreground">Fill out the details for the new sector.</p>
        </div>
      </div>
      <SectorForm onSave={handleSave} />
    </div>
  );
}
