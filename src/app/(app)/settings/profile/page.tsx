'use client';
import { useRouter } from 'next/navigation';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { Skeleton } from '@/components/ui/skeleton';
import type { TGNMember } from '@/lib/types';


export default function ProfileSettingsPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { profile, isLoading } = useMemberProfile();
  const { toast } = useToast();

  const handleSave = async (data: Partial<TGNMember>) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      router.push(`/profile/${user.uid}`);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
      });
    }
  };

  if (isLoading || !profile) {
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

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Update your personal information and preferences.</p>
        </div>
      </div>
      <ProfileForm onSave={handleSave} initialData={profile} />
    </div>
  );
}

    