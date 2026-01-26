'use client';
import { useRouter } from 'next/navigation';
import { ProgramForm } from '@/components/admin/ProgramForm';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { Program } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewProgramPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSave = async (data: Omit<Program, 'id' | 'createdAt'>) => {
    if (!firestore) return;
    const programsCollection = collection(firestore, 'programs');
    const dataToSave = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    
    addDoc(programsCollection, dataToSave)
      .then(() => {
        toast({
          title: 'Program Created',
          description: `${data.title} has been successfully created.`,
        });
        router.push('/admin/programs');
      })
      .catch((error) => {
        console.error('Failed to create program with code:', error.code, 'and message:', error.message, 'Full error:', error);
        const permissionError = new FirestorePermissionError({
          path: programsCollection.path,
          operation: 'create',
          requestResourceData: dataToSave
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Error creating program',
          description: error.message || 'Please try again.',
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
          <h1 className="text-2xl font-bold tracking-tight">Create New Program</h1>
          <p className="text-muted-foreground">Fill out the details for the new learning program.</p>
        </div>
      </div>
      <ProgramForm onSave={handleSave} />
    </div>
  );
}
