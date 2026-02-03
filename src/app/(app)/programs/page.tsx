
'use client';

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, Users, Award,
  ChevronRight, Star, Calendar, ArrowLeft,
  Video, Book, Wallet, Loader2, PartyPopper, MapPin, Hammer, GraduationCap
} from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc, runTransaction, serverTimestamp, increment, addDoc, getDocs } from 'firebase/firestore';
import placeholderImages from "@/lib/placeholder-images.json";
import type { Program, AffiliateReferral, Commission } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { useMemberProfile } from "@/hooks/useMemberProfile";

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};

const ProgramsPage = () => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEnrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [enrollmentStep, setEnrollmentStep] = useState<'confirm' | 'success'>('confirm');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { profile } = useMemberProfile();
  const { wallet, isLoading: isWalletLoading } = useWallet();
  const { toast } = useToast();
  
  const programsCollectionRef = useMemoFirebase(() => 
    (firestore && user && profile) ? query(collection(firestore, 'programs'), where('deactivatedAt', '==', null)) : null, 
    [firestore, user, profile]
  );
  const { data: allPrograms, isLoading: programsLoading, error: programsError } = useCollection<Program>(programsCollectionRef);

  const programsByType = useMemo(() => {
    if (!allPrograms) return { free: [], paid: [], executive: [] };
    
    return allPrograms.reduce((acc, program) => {
      const typeKey = program.type.toLowerCase() as 'free' | 'paid' | 'executive';
      if (!acc[typeKey]) {
        acc[typeKey] = [];
      }
      acc[typeKey].push(program);
      return acc;
    }, { free: [], paid: [], executive: [] } as Record<'free' | 'paid' | 'executive', Program[]>);
  }, [allPrograms]);

  const handleEnrollClick = () => {
    if (!user) {
      router.push('/');
      return;
    }
    setEnrollmentStep('confirm');
    setEnrollDialogOpen(true);
  }

  const handleConfirmEnrollment = async () => {
    if (!user || !selectedProgram || !firestore) return;
    
    const price = selectedProgram.price || 0;
    if (price > 0 && (!wallet || wallet.balance < price)) {
        toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Your wallet balance is too low.' });
        return;
    }

    setIsSubmitting(true);

    try {
        const referralsRef = collection(firestore, 'affiliate_referrals');
        const q = query(referralsRef, where('referredMemberId', '==', user.uid));
        const referralsSnapshot = await getDocs(q);
        const upline = referralsSnapshot.docs.map(doc => doc.data() as AffiliateReferral);

        await runTransaction(firestore, async (transaction) => {
            const programRef = doc(firestore, "programs", selectedProgram.id);
            const enrollmentRef = doc(firestore, "users", user.uid, "enrolled_programs", selectedProgram.id);
            
            const enrollmentDoc = await transaction.get(enrollmentRef);
            if (enrollmentDoc.exists()) {
                throw new Error("You are already enrolled in this program.");
            }

            transaction.set(enrollmentRef, {
                programId: selectedProgram.id,
                enrolledAt: serverTimestamp(),
                progress: 0,
            });

            transaction.update(programRef, { enrolled: increment(1) });

            if (price > 0 && wallet) {
                const buyerWalletRef = doc(firestore, "wallets", user.uid);
                const newBalance = wallet.balance - price;
                transaction.update(buyerWalletRef, { balance: newBalance });

                for (const referral of upline) {
                    const commissionAmount = price * (referral.commissionPercentage / 100);
                    const referrerWalletRef = doc(firestore, 'wallets', referral.referrerMemberId);
                    
                    const referrerWalletDoc = await transaction.get(referrerWalletRef);
                    const currentBalance = referrerWalletDoc.exists() ? referrerWalletDoc.data().balance : 0;
                    const newReferrerBalance = currentBalance + commissionAmount;
                    transaction.set(referrerWalletRef, { balance: newReferrerBalance, memberId: referral.referrerMemberId, currency: 'USD' }, { merge: true });
                }
            }
        });

        if (price > 0) {
            const buyerTransactionsRef = collection(firestore, "users", user.uid, "transactions");
            await addDoc(buyerTransactionsRef, {
                type: 'purchase',
                status: 'completed',
                amount: -price,
                currency: 'USD',
                description: `Enrollment: ${selectedProgram.title}`,
                createdAt: serverTimestamp(),
            });

            const commissionsRef = collection(firestore, 'commissions');
            for (const referral of upline) {
                const commissionAmount = price * (referral.commissionPercentage / 100);
                await addDoc(commissionsRef, {
                    referrerId: referral.referrerMemberId,
                    buyerId: user.uid,
                    programId: selectedProgram.id,
                    saleAmount: price,
                    commissionAmount: commissionAmount,
                    level: referral.level,
                    createdAt: serverTimestamp(),
                });
            }
        }

        toast({ title: "Enrollment Successful!", description: `Welcome to ${selectedProgram.title}.` });
        setEnrollmentStep('success');

    } catch (e: any) {
        toast({ variant: 'destructive', title: "Enrollment Failed", description: e.message || "An unexpected error occurred." });
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  };


  if (selectedProgram) {
    const img = getImage(selectedProgram.imageId);
    return (
      <div>
        <Button 
          variant="ghost" 
          onClick={() => setSelectedProgram(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Programs
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                 {img && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                        <Image
                            src={img.imageUrl}
                            alt={selectedProgram.title}
                            width={800}
                            height={450}
                            className="aspect-video w-full object-cover"
                            data-ai-hint={img.imageHint}
                        />
                    </div>
                )}
                <CardTitle className="text-2xl">{selectedProgram.title}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-accent fill-accent" /> {selectedProgram.rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {selectedProgram.enrolled || 0} enrolled
                    </span>
                    <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {selectedProgram.duration}
                    </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                    <TabsTrigger value="mentor">Mentor</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {selectedProgram.format === 'Physical' && selectedProgram.location && (
                      <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-semibold text-foreground">{selectedProgram.location}</p>
                        </div>
                      </div>
                    )}
                    {selectedProgram.preRecordedVideoUrl && (selectedProgram.format === 'Pre-recorded') && (
                        <div className="aspect-video w-full rounded-lg overflow-hidden border bg-muted">
                            <iframe
                                className="w-full h-full"
                                src={selectedProgram.preRecordedVideoUrl.replace("watch?v=", "embed/")}
                                title="Program Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                    <p className="text-muted-foreground">
                      {selectedProgram.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold text-foreground">{selectedProgram.duration}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Certification</p>
                        <p className="font-semibold text-foreground">{selectedProgram.certified ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="curriculum" className="space-y-3">
                    {[
                      "Module 1: Foundation & Core Concepts",
                      "Module 2: Practical Application",
                      "Module 3: Advanced Strategies",
                      "Module 4: Case Studies & Analysis",
                      "Module 5: Final Project & Assessment",
                    ].map((module, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {i + 1}
                        </div>
                        <span className="text-foreground">{module}</span>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="mentor">
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                        {selectedProgram.mentor.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-foreground">{selectedProgram.mentor}</p>
                        <p className="text-muted-foreground text-sm mb-2">Executive Mentor • 15+ years experience</p>
                        <p className="text-muted-foreground text-sm">
                          A distinguished leader with extensive experience in mentoring and developing 
                          future leaders across multiple industries.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-3">
                    <div className="p-6 text-center bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground">Schedule details for this program are not yet available.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {selectedProgram.price ? (
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-foreground">${selectedProgram.price}</p>
                    <p className="text-sm text-muted-foreground">one-time payment</p>
                  </div>
                ) : (
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-accent">FREE</p>
                  </div>
                )}
                <Button variant="accent" className="w-full mb-3" size="lg" onClick={handleEnrollClick}>
                  Enroll Now
                </Button>
                {(selectedProgram.format === 'Live') && selectedProgram.googleMeetUrl && (
                  <Button asChild variant="default" className="w-full mb-3" size="lg">
                    <a href={selectedProgram.googleMeetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                        <Video className="mr-2 h-5 w-5" />
                        Join Live Session
                    </a>
                  </Button>
                )}
                {selectedProgram.certified && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4 text-accent" />
                    Certification eligible
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <Dialog open={isEnrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
            <DialogContent>
                {enrollmentStep === 'confirm' ? (
                <>
                    <DialogHeader>
                        <DialogTitle>Confirm Enrollment</DialogTitle>
                        <DialogDescription>You are about to enroll in &quot;{selectedProgram.title}&quot;.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {selectedProgram.price && selectedProgram.price > 0 && (
                            <>
                                <div className="p-4 border rounded-lg flex justify-between items-center">
                                    <span className="font-medium">Program Price</span>
                                    <span className="font-bold text-lg">${selectedProgram.price.toFixed(2)}</span>
                                </div>
                                <div className="p-4 border rounded-lg flex justify-between items-center bg-muted/50">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Wallet className="h-5 w-5" />
                                        <span>Your Wallet Balance</span>
                                    </div>
                                    <span className="font-semibold">{isWalletLoading ? <Skeleton className="h-5 w-20" /> : `$${wallet?.balance.toFixed(2)}`}</span>
                                </div>
                            </>
                        )}
                        {selectedProgram.price && selectedProgram.price > 0 && wallet && wallet.balance < selectedProgram.price && (
                             <p className="text-sm text-destructive text-center">You have insufficient funds to enroll.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEnrollDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="accent"
                            onClick={handleConfirmEnrollment}
                            disabled={isSubmitting || (selectedProgram.price > 0 && (!wallet || wallet.balance < selectedProgram.price))}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Enrolling...' : 'Confirm and Enroll'}
                        </Button>
                    </DialogFooter>
                </>
                ) : (
                <>
                    <DialogHeader className="items-center text-center">
                         <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-2">
                            <PartyPopper className="h-8 w-8 text-green-600" />
                        </div>
                        <DialogTitle>Enrollment Successful!</DialogTitle>
                        <DialogDescription>
                            You have successfully enrolled in &quot;{selectedProgram.title}&quot;.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center pt-4">
                        <Button onClick={() => { setEnrollDialogOpen(false); router.push('/cohorts'); }}>Go to My Cohorts</Button>
                    </DialogFooter>
                </>
                )}
            </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  const renderSkeletons = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader className="p-0 relative">
            <Skeleton className="aspect-[3/2] w-full rounded-t-lg" />
          </CardHeader>
          <CardContent className="p-4 flex flex-col flex-1">
            <Skeleton className="h-5 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="space-y-3 my-4 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex items-center justify-between mt-auto">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-9 w-1/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );


  const isLoading = (programsLoading || !allPrograms) && !programsError;

  return (
    <div>
       <Tabs defaultValue="explore">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Programs & Mentorship</h1>
                <p className="text-muted-foreground">Explore curated learning paths designed by industry leaders.</p>
            </div>
            <TabsList>
                <TabsTrigger value="explore">Explore All</TabsTrigger>
                <TabsTrigger value="my-learning">My Learning</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            </TabsList>
        </div>
        
        <TabsContent value="explore">
            <Tabs defaultValue="free" className="space-y-6">
                <TabsList>
                <TabsTrigger value="free">Free</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="executive">Executive</TabsTrigger>
                </TabsList>
                
                {programsError ? (
                    <Card className="border-dashed">
                        <CardContent className="p-10 text-center flex flex-col items-center">
                            <Hammer className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">Program Catalog Under Development</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-2">
                                We're updating our curated program permissions. Our latest learning paths will be available shortly.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    Object.entries(programsByType).map(([key, programs]) => (
                    <TabsContent key={key} value={key}>
                        {isLoading ? renderSkeletons() : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {programs.length === 0 && !isLoading && <p className="text-muted-foreground col-span-full text-center py-10">No {key} programs available yet.</p>}
                            {programs.map((program) => {
                            const img = getImage(program.imageId);
                            return (
                                <Card 
                                    key={program.id} 
                                    className="flex flex-col hover:shadow-card transition-all duration-300 cursor-pointer group"
                                    onClick={() => setSelectedProgram(program)}
                                >
                                    <CardHeader className="p-0 relative">
                                    {img ? (
                                        <Image
                                            src={img.imageUrl}
                                            alt={program.title}
                                            width={600}
                                            height={400}
                                            className="aspect-[3/2] w-full object-cover rounded-t-lg"
                                            data-ai-hint={img.imageHint}
                                        />
                                    ) : (
                                        <div className="aspect-[3/2] w-full object-cover rounded-t-lg bg-muted flex items-center justify-center">
                                            <p className="text-muted-foreground text-sm">No Image</p>
                                        </div>
                                    )}
                                    </CardHeader>
                                    <CardContent className="p-4 flex flex-col flex-1">
                                        <CardTitle className="text-lg group-hover:text-primary transition-colors leading-tight">
                                        {program.title}
                                        </CardTitle>
                                        <CardDescription className="mt-1">with {program.mentor}</CardDescription>
                                        <div className="space-y-3 my-4 flex-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <Clock className="h-4 w-4" /> {program.duration}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                            <Star className="h-4 w-4 text-accent fill-accent" /> {program.rating.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <Users className="h-4 w-4" /> {program.enrolled || 0} enrolled
                                            </span>
                                            {program.certified && (
                                            <span className="flex items-center gap-1.5 text-accent font-medium">
                                                <Award className="h-4 w-4" /> Certified
                                            </span>
                                            )}
                                        </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            {program.price ? (
                                                <span className="text-xl font-bold text-foreground">${program.price}</span>
                                            ) : (
                                                <span className="text-xl font-bold text-accent">Free</span>
                                            )}
                                            <Button variant="accent" size="sm">
                                                View Program <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                            })}
                        </div>
                        )}
                    </TabsContent>
                    ))
                )}
            </Tabs>
        </TabsContent>

        <TabsContent value="my-learning">
             <Card className="flex flex-col items-center justify-center text-center py-20">
                <CardHeader>
                    <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Book className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Redirecting...</CardTitle>
                    <CardDescription>
                        Taking you to your enrolled programs.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                     <Button onClick={() => router.push('/cohorts')}>View My Cohorts</Button>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="curriculum">
             <Card className="flex flex-col items-center justify-center text-center py-20">
                <CardHeader>
                    <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        The TGN Mentor Certification learning path will be available here shortly.
                    </CardDescription>
                </CardHeader>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default ProgramsPage;
