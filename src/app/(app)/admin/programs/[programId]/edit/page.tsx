'use client';
import { useRouter, useParams } from 'next/navigation';
import { ProgramForm } from '@/components/admin/ProgramForm';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Program } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const { programId } = params;
  const firestore = useFirestore();
  const { toast } = useToast();

  const programRef = useMemoFirebase(
    () => (programId ? doc(firestore, 'programs', programId as string) : null),
    [firestore, programId]
  );
  
  const { data: program, isLoading, error } = useDoc<Program>(programRef);

  const handleSave = async (data: Omit<Program, 'id' | 'createdAt'>) => {
    if (!programRef) return;
    try {
      await updateDoc(programRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Program Updated',
        description: `${data.title} has been successfully updated.`,
      });
      router.push('/admin/programs');
    } catch (e) {
      console.error('Failed to update program:', e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update the program. Please try again.',
      });
    }
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
    return <div className="text-destructive">Error loading program data.</div>;
  }

  if (!program) {
    return <div>Program not found.</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Program</h1>
          <p className="text-muted-foreground">Editing &quot;{program.title}&quot;</p>
        </div>
      </div>
      <ProgramForm onSave={handleSave} initialData={program} />
    </div>
  );
}
