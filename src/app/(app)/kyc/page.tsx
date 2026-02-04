
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore, useUser, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, ShieldCheck, FileText, GraduationCap } from 'lucide-react';
import { type MentorKYC } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { FacialScan } from '@/components/facial-scan';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const kycSchema = z.object({
  nin: z.string().min(10, 'National Identification Number is required'),
  bvn: z.string().min(10, 'Bank Verification Number is required'),
  medicalLicenseNumber: z.string().optional(),
  
  // Certificate Fields
  certificateType: z.string().min(2, 'Certificate type is required'),
  certificateIssuer: z.string().min(2, 'Issuer is required'),
  certificateId: z.string().min(2, 'Certificate ID is required'),
  
  // Degree Fields
  degreeType: z.string().min(2, 'Degree type is required'),
  degreeInstitution: z.string().min(2, 'Institution is required'),
  degreeId: z.string().min(2, 'Degree ID/Serial is required'),
});

type KycFormData = z.infer<typeof kycSchema>;

export default function KycPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<Record<string, string> | null>(null);

  const kycDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
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

  const onSubmit = (data: KycFormData) => {
    if (!user || !kycDocRef) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    
    if (!scanResults) {
        toast({ variant: 'destructive', title: 'Facial Scan Required', description: 'Please complete the facial scan before submitting.' });
        return;
    }

    const dataToSave = {
      ...data,
      ...scanResults,
      memberId: user.uid,
      status: 'pending' as const,
      submittedAt: serverTimestamp(),
    };

    setDoc(kycDocRef, dataToSave, { merge: true })
      .then(() => {
        toast({ title: 'KYC Submitted!', description: 'Your information has been sent for admin review.' });
      })
      .catch((error) => {
        console.error('Failed to submit KYC:', error);
        const permissionError = new FirestorePermissionError({
          path: kycDocRef.path,
          operation: 'create',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit KYC. Please try again.' });
      });
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

  if (isScanning) {
    return (
        <FacialScan 
            onComplete={(results) => {
                setScanResults(results);
                setIsScanning(false);
                toast({ title: "Scan Complete!", description: "Your facial scans have been captured." });
            }}
            onCancel={() => setIsScanning(false)}
        />
    );
  }

  if (kycStatus) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Verification Status</CardTitle>
                {kycStatus.status === 'approved' && (
                    <Badge className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {kycStatus.status === 'pending' && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 flex items-center gap-3">
                <Clock className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Pending Verification</h3>
                  <p className="text-sm">Your submission is awaiting admin review. This usually takes 1-2 business days.</p>
                </div>
              </div>
            )}
            
            {kycStatus.status === 'approved' && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Verified Mentor</h3>
                  <p className="text-sm">Congratulations, your identity and credentials have been verified.</p>
                </div>
              </div>
            )}

            {kycStatus.status === 'rejected' && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">Submission Rejected</h3>
                  <p className="text-sm">
                    Reason: {kycStatus.rejectionReason || "No reason provided."}
                  </p>
                   <Button variant="link" className="p-0 h-auto text-destructive" onClick={() => {
                       setDoc(kycDocRef, {status: 'pending'}, {merge: true})
                   }}>Resubmit</Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-4">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Professional Certificate
                    </h4>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="font-medium">{kycStatus.certificateType}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Issuer</p>
                        <p className="font-medium">{kycStatus.certificateIssuer}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Certificate ID</p>
                        <p className="font-medium font-mono">{kycStatus.certificateId}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" /> Highest Degree
                    </h4>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Degree</p>
                        <p className="font-medium">{kycStatus.degreeType}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Institution</p>
                        <p className="font-medium">{kycStatus.degreeInstitution}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Degree ID/Serial</p>
                        <p className="font-medium font-mono">{kycStatus.degreeId}</p>
                    </div>
                </div>
            </div>
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
          <p className="text-muted-foreground">Submit your credentials to become a verified TGN Mentor.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Identity Information</CardTitle>
            <CardDescription>
              Your identification details are handled securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nin">National Identification Number (NIN)</Label>
              <Input id="nin" {...register('nin')} placeholder="Enter 11-digit NIN" />
              {errors.nin && <p className="text-sm text-destructive">{errors.nin.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bvn">Bank Verification Number (BVN)</Label>
              <Input id="bvn" {...register('bvn')} placeholder="Enter 11-digit BVN" />
              {errors.bvn && <p className="text-sm text-destructive">{errors.bvn.message}</p>}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="medicalLicenseNumber">Medical/Professional License Number (Optional)</Label>
              <Input id="medicalLicenseNumber" {...register('medicalLicenseNumber')} placeholder="e.g., MED-123456" />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Professional Certificate</CardTitle>
            <CardDescription>Provide details of your primary professional certification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="certificateType">Certificate Type/Name</Label>
                    <Input id="certificateType" {...register('certificateType')} placeholder="e.g., Project Management Professional (PMP)" />
                    {errors.certificateType && <p className="text-sm text-destructive">{errors.certificateType.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="certificateIssuer">Issuing Organization</Label>
                    <Input id="certificateIssuer" {...register('certificateIssuer')} placeholder="e.g., PMI" />
                    {errors.certificateIssuer && <p className="text-sm text-destructive">{errors.certificateIssuer.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="certificateId">Certificate ID/Number</Label>
                    <Input id="certificateId" {...register('certificateId')} placeholder="e.g., CERT-987654321" />
                    {errors.certificateId && <p className="text-sm text-destructive">{errors.certificateId.message}</p>}
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Highest Degree</CardTitle>
            <CardDescription>Details of your highest academic qualification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="degreeType">Degree Type</Label>
                    <Input id="degreeType" {...register('degreeType')} placeholder="e.g., Master of Business Administration" />
                    {errors.degreeType && <p className="text-sm text-destructive">{errors.degreeType.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="degreeInstitution">Institution/University</Label>
                    <Input id="degreeInstitution" {...register('degreeInstitution')} placeholder="e.g., University of Lagos" />
                    {errors.degreeInstitution && <p className="text-sm text-destructive">{errors.degreeInstitution.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="degreeId">Degree Serial Number/ID</Label>
                    <Input id="degreeId" {...register('degreeId')} placeholder="e.g., DEG-123456" />
                    {errors.degreeId && <p className="text-sm text-destructive">{errors.degreeId.message}</p>}
                </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Facial Verification</CardTitle>
                <CardDescription>
                    Complete a quick facial scan for identity verification.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {scanResults ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700">
                        <CheckCircle className="h-6 w-6" />
                        <div>
                            <h3 className="font-semibold">Scan Completed</h3>
                            <p className="text-sm">Identity scan verified.</p>
                        </div>
                    </div>
                ) : (
                    <Button type="button" onClick={() => setIsScanning(true)}>Start Facial Scan</Button>
                )}
            </CardContent>
        </Card>

        <CardFooter className="flex justify-end mt-6 px-0">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}
