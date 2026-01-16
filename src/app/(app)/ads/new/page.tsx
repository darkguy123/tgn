'use client';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
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
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useWallet } from '@/hooks/useWallet';
import { ArrowLeft, UploadCloud, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const adSchema = z.object({
  name: z.string().min(5, 'Campaign name must be at least 5 characters'),
  headline: z.string().min(5, 'Headline must be at least 5 characters'),
  bodyText: z.string().min(10, 'Body text must be at least 10 characters'),
  imageUrl: z.string().url('Please provide a valid image URL'),
  callToActionText: z.string().min(3, 'CTA text is required'),
  callToActionUrl: z.string().url('Please provide a valid CTA URL'),
  budget: z.preprocess(
    a => parseFloat(String(a)),
    z.number().min(10, 'Budget must be at least $10')
  ),
});

type AdFormData = z.infer<typeof adSchema>;

export default function NewAdPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { profile } = useMemberProfile();
  const { wallet } = useWallet();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
  });

  const imageUrl = watch('imageUrl');

  const onSubmit = async (data: AdFormData) => {
    if (!profile) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    if (!wallet || wallet.balance < data.budget) {
        toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Your wallet balance is too low for this budget.' });
        return;
    }

    try {
      await addDoc(collection(firestore, 'ads'), {
        ...data,
        creatorMemberId: profile.id,
        creatorName: profile.name || profile.email.split('@')[0],
        creatorImageId: profile.imageId || 'default-avatar',
        status: 'pending',
        amountSpent: 0,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Campaign Submitted!',
        description: 'Your ad campaign has been submitted for admin approval.',
      });
      router.push('/ads');
    } catch (error) {
      console.error('Failed to create ad campaign:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create the campaign. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Ad Campaign</h1>
          <p className="text-muted-foreground">
            Promote your product, service, or cause to the TGN community.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Campaign Details</CardTitle>
                        <CardDescription>
                            Your campaign will be reviewed before going live.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Campaign Name</Label>
                            <Input
                                id="name"
                                {...register('name')}
                                placeholder="e.g., Spring 2026 Book Launch"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Ad Creative</CardTitle>
                        <CardDescription>What your audience will see.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-2">
                            <Label htmlFor="headline">Headline</Label>
                            <Input id="headline" {...register('headline')} placeholder="e.g., Unlock Your Potential" />
                            {errors.headline && <p className="text-sm text-destructive">{errors.headline.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bodyText">Body Text</Label>
                            <Textarea id="bodyText" {...register('bodyText')} className="min-h-24" placeholder="Briefly describe what you're offering."/>
                            {errors.bodyText && <p className="text-sm text-destructive">{errors.bodyText.message}</p>}
                        </div>
                        <div className={cn("aspect-video rounded-md border-2 border-dashed flex items-center justify-center overflow-hidden", errors.imageUrl && "border-destructive")}>
                            {imageUrl ? (
                                <Image src={imageUrl} alt="Ad preview" width={400} height={225} className="object-cover w-full h-full" />
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <UploadCloud className="h-10 w-10 mx-auto" />
                                    <p className="mt-2 text-sm">Image preview will appear here.</p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input id="imageUrl" {...register('imageUrl')} placeholder="https://example.com/ad-image.png" />
                            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6 lg:sticky lg:top-24">
                <Card>
                    <CardHeader>
                        <CardTitle>Call to Action (CTA)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="callToActionText">Button Text</Label>
                            <Input id="callToActionText" {...register('callToActionText')} placeholder="e.g., Learn More, Shop Now" />
                            {errors.callToActionText && <p className="text-sm text-destructive">{errors.callToActionText.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="callToActionUrl">Destination URL</Label>
                            <Input id="callToActionUrl" type="url" {...register('callToActionUrl')} placeholder="https://example.com/landing-page" />
                            {errors.callToActionUrl && <p className="text-sm text-destructive">{errors.callToActionUrl.message}</p>}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Budget</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-2">
                            <Label htmlFor="budget">Campaign Budget (USD)</Label>
                            <Input id="budget" type="number" step="1" {...register('budget')} placeholder="e.g., 100" />
                            {errors.budget && <p className="text-sm text-destructive">{errors.budget.message}</p>}
                        </div>
                        {wallet && (
                             <Alert variant="default" className="mt-4">
                                <AlertDescription>
                                    Your wallet balance is <strong>${wallet.balance.toFixed(2)}</strong>. This amount will be reserved from your wallet upon submission.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
                 <div className="flex flex-col gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                    </Button>
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/ads')}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
}

    