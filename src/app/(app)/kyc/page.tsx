'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { type MentorKYC } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const kycSchema = z.object({
  nin: z.string().min(10, 'National Identification Number is required'),
  bvn: z.string().min(10, 'Bank Verification Number is required'),
  medicalLicenseNumber: z.string().optional(),
  certificateUrl: z.string().url('Please enter a valid URL for your certificate'),
  degreeUrl: z.string().url('Please enter a valid URL for your degree'),
});

type KycFormData = z.infer<typeof kycSchema>;

export default function KycPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const kycDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'mentor_kyc', user.uid);
  }, [user, firestore]);

  const { data: kycStatus, isLoading: isKycLoading } = useDoc<MentorKYC>(kycDocRef);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<KycFormData>({
    resolver: zodResolver(kycSchema),
  });

  const onSubmit = async (data: KycFormData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    try {
      await setDoc(kycDocRef, {
        ...data,
        memberId: user.uid,
        status: 'pending',
        submittedAt: serverTimestamp(),
      });
      toast({ title: 'KYC Submitted!', description: 'Your information has been sent for admin review.' });
    } catch (error) {
      console.error('Failed to submit KYC:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit KYC. Please try again.' });
    }
  };
  
  if (isKycLoading) {
      return (
          <div className="space-y-6">
              <Skeleton className="h-8 w-1/3" />
              <Card>
                  <CardHeader>
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                  </CardContent>
              </Card>
          </div>
      )
  }

  if (kycStatus) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Your KYC Status</CardTitle>
          </CardHeader>
          <CardContent>
            {kycStatus.status === 'pending' && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 flex items-center gap-3">
                <Clock className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Pending Review</h3>
                  <p className="text-sm">Your submission is awaiting admin review. This usually takes 1-2 business days.</p>
                </div>
              </div>
            )}
            {kycStatus.status === 'approved' && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Approved!</h3>
                  <p className="text-sm">Congratulations, you are now a verified mentor.</p>
                </div>
              </div>
            )}
            {kycStatus.status === 'rejected' && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Submission Rejected</h3>
                  <p className="text-sm">
                    There was an issue with your submission. Reason: {kycStatus.rejectionReason || "No reason provided."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mentor Verification (KYC)</h1>
          <p className="text-muted-foreground">Submit your details to become a verified mentor.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Verification Details</CardTitle>
            <CardDescription>
              This information is confidential and used only for verification.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nin">National Identification Number (NIN)</Label>
              <Input id="nin" {...register('nin')} />
              {errors.nin && <p className="text-sm text-destructive">{errors.nin.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bvn">Bank Verification Number (BVN)</Label>
              <Input id="bvn" {...register('bvn')} />
              {errors.bvn && <p className="text-sm text-destructive">{errors.bvn.message}</p>}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="medicalLicenseNumber">Medical License Number (Optional)</Label>
              <Input id="medicalLicenseNumber" {...register('medicalLicenseNumber')} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="certificateUrl">Professional Certificate URL</Label>
              <Input id="certificateUrl" {...register('certificateUrl')} placeholder="https://linkedin.com/in/me/details/certifications/..." />
              {errors.certificateUrl && <p className="text-sm text-destructive">{errors.certificateUrl.message}</p>}
              <p className="text-xs text-muted-foreground">Please upload your certificate to a service like Google Drive or Dropbox and paste the shareable link here.</p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="degreeUrl">Highest Degree URL</Label>
              <Input id="degreeUrl" {...register('degreeUrl')} placeholder="https://example.com/my-degree.pdf" />
              {errors.degreeUrl && <p className="text-sm text-destructive">{errors.degreeUrl.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

    