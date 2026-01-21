'use client';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { ArrowLeft } from 'lucide-react';

const fundraiserSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  goalAmount: z.preprocess(
    a => parseFloat(String(a)),
    z.number().min(1, 'Goal amount must be at least $1')
  ),
});

type FundraiserFormData = z.infer<typeof fundraiserSchema>;

export default function NewFundraiserPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { profile } = useMemberProfile();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FundraiserFormData>({
    resolver: zodResolver(fundraiserSchema),
  });

  const onSubmit = (data: FundraiserFormData) => {
    if (!user || !profile || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a fundraiser.',
      });
      return;
    }

    const fundraisersCollection = collection(firestore, 'causes');
    const dataToSave = {
      ...data,
      creatorMemberId: profile.id,
      creatorName: profile.name || profile.email.split('@')[0],
      creatorAvatarUrl: profile.avatarUrl || '',
      currentAmount: 0,
      backersCount: 0,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
    };
    
    addDoc(fundraisersCollection, dataToSave)
      .then(() => {
        toast({
          title: 'Fundraiser Submitted!',
          description: 'Your fundraiser has been submitted for admin approval.',
        });
        router.push('/community/causes');
      })
      .catch((error) => {
        console.error('Failed to create fundraiser:', error);
        const permissionError = new FirestorePermissionError({
          path: fundraisersCollection.path,
          operation: 'create',
          requestResourceData: dataToSave
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create the fundraiser. Please try again.',
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
          <h1 className="text-2xl font-bold tracking-tight">Create a New Fundraiser</h1>
          <p className="text-muted-foreground">
            Share your initiative and start fundraising from the community.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Fundraiser Details</CardTitle>
            <CardDescription>
              Your fundraiser will be reviewed by an admin before it goes live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Fundraiser Title</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Digital Literacy for Kids in Lagos"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                className="min-h-32"
                placeholder="Tell the community about your fundraiser. What is the problem, and how will you solve it?"
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalAmount">Fundraising Goal (USD)</Label>
              <Input
                id="goalAmount"
                type="number"
                step="1"
                {...register('goalAmount')}
                placeholder="e.g., 5000"
              />
              {errors.goalAmount && (
                <p className="text-sm text-destructive">
                  {errors.goalAmount.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/community/causes')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
