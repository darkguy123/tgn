'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/icons";
import { Briefcase, Target, Check, PartyPopper, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { sectors as SECTORS, goals as GOALS } from "@/lib/data";
import { useUser, useFirestore } from "@/firebase";
import { doc, serverTimestamp, addDoc, collection, query, where, getDocs, writeBatch, setDoc } from "firebase/firestore";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const getCommissionForLevel = (level: number) => {
    switch (level) {
        case 1: return 5;
        case 2: return 3;
        case 3: return 2;
        case 4: return 1.5;
        case 5: return 1.5;
        case 6: return 1;
        case 7: return 1;
        default: return 0;
    }
};

const Onboarding = () => {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [tgnMemberId, setTgnMemberId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { profile, isLoading: isProfileLoading } = useMemberProfile();

  // Form state
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [interests, setInterests] = useState("");

  useEffect(() => {
    if (!isProfileLoading && profile) {
      router.push('/dashboard');
    }
  }, [profile, isProfileLoading, router]);


  const toggleSector = (sectorName: string) => {
    if (selectedSectors.includes(sectorName)) {
      setSelectedSectors(selectedSectors.filter(s => s !== sectorName));
    } else if (selectedSectors.length < 3) {
      setSelectedSectors([...selectedSectors, sectorName]);
    }
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
       if (user && firestore) {
        setIsSubmitting(true);
        try {
            const newId = `TGN-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const dataToSave = {
                id: user.uid,
                tgnMemberId: newId,
                signInType: user.providerData[0]?.providerId || "password",
                email: user.email,
                locationContinent: 'Africa',
                locationCountry: 'Nigeria',
                locationRegion: '',
                timezone: 'Africa/Lagos',
                role: 'mentee' as const,
                sectorPreferences: selectedSectors,
                purpose: bio,
                identityProfile: JSON.stringify({ goals: selectedGoals, interests: interests }),
                createdAt: serverTimestamp(),
                connections: [],
                isVerifiedMentor: false,
                hasTransactionPin: false,
            };
            const userDocRef = doc(firestore, "users", user.uid);
            
            await setDoc(userDocRef, dataToSave, { merge: true });

            const referrerUid = localStorage.getItem('tgn_referrer_uid');
            if (referrerUid) {
              const referralsCollection = collection(firestore, 'affiliate_referrals');
              const batch = writeBatch(firestore);
              let currentReferrerId: string | null = referrerUid;

              for (let level = 1; level <= 7; level++) {
                if (!currentReferrerId) break;

                const commissionPercentage = getCommissionForLevel(level);

                const referralData = {
                  referrerMemberId: currentReferrerId,
                  referredMemberId: user.uid,
                  level: level,
                  commissionPercentage: commissionPercentage,
                  createdAt: serverTimestamp(),
                };
                const newReferralRef = doc(referralsCollection);
                batch.set(newReferralRef, referralData);
                
                const q = query(referralsCollection, where('referredMemberId', '==', currentReferrerId), where('level', '==', 1));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    currentReferrerId = querySnapshot.docs[0].data().referrerMemberId;
                } else {
                    currentReferrerId = null; 
                }
              }
              await batch.commit();
              localStorage.removeItem('tgn_referrer_uid');
            }
            
            setTgnMemberId(newId);
            setCompleted(true);
        } catch (error) {
            console.error("Onboarding submission failed:", error);
            toast({
                variant: "destructive",
                title: "Setup Failed",
                description: "Could not save your profile. Please try again."
            })
        } finally {
            setIsSubmitting(false);
        }
      }
    }
  };

  const handleComplete = () => {
    router.push("/dashboard");
  };

  const stepIcons = [
    <Briefcase key="1" className="h-5 w-5" />,
    <Target key="2" className="h-5 w-5" />
  ];
  
  // If loading, or if a profile already exists (which means we're about to redirect), show a loader.
  if (isProfileLoading || profile) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    )
  }


  if (completed) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <Image
          src="/signinpagebg.jpeg"
          alt="People collaborating in a modern office"
          fill={true}
          className="object-cover"
          data-ai-hint="collaboration office"
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <Card className="relative z-10 w-full max-w-md text-center animate-scale-in border-0 shadow-xl">
          <CardHeader className="pb-4 pt-8">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center">
              <PartyPopper className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">🎉 You're in!</CardTitle>
            <CardDescription className="text-lg">
              Your TGN Member ID has been created.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Member ID</p>
              <p className="text-lg font-mono font-bold text-primary">{tgnMemberId}</p>
            </div>
            <Button size="lg" className="w-full" onClick={handleComplete}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      <Image
        src="/signinpagebg.jpeg"
        alt="People collaborating in a modern office"
        fill={true}
        className="object-cover"
        data-ai-hint="collaboration office"
      />
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <header className="py-6 px-4">
          <div className="flex justify-center">
            <Logo className="h-12 object-contain" />
          </div>
        </header>
        
        {/* Progress indicator */}
        <div className="px-4 py-4">
          <div className="max-w-xs mx-auto">
            <div className="flex items-center justify-center">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
                    s < step ? "bg-primary text-primary-foreground" :
                    s === step ? "bg-primary text-primary-foreground" :
                    "bg-white/10 border-2 border-white/30 text-white/80"
                  )}>
                    {s < step ? <Check className="h-5 w-5" /> : stepIcons[s - 1]}
                  </div>
                  {s < 2 && (
                    <div className={cn(
                      "h-1 w-24 sm:w-32 mx-1",
                      s < step ? "bg-primary" : "bg-white/20"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <main className="flex-1 flex items-start justify-center px-4 py-8">
          <Card className="w-full max-w-lg animate-fade-in border-0 shadow-xl">
            {/* Step 1: Sectors */}
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="text-xl">Choose your sector(s)</CardTitle>
                  <CardDescription>Select up to 3 sectors. You can update this later.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SECTORS.map((sector) => (
                      <button
                        key={sector.id}
                        onClick={() => toggleSector(sector.name)}
                        className={cn(
                          "p-3 rounded-lg border text-sm font-medium transition-all duration-200",
                          selectedSectors.includes(sector.name)
                            ? "bg-primary text-primary-foreground border-primary shadow-soft"
                            : "bg-card border-border hover:border-primary/50 hover:bg-muted"
                        )}
                      >
                        {sector.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    {selectedSectors.length}/3 selected
                  </p>
                </CardContent>
              </>
            )}
            
            {/* Step 2: Purpose */}
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="text-xl">Your purpose</CardTitle>
                  <CardDescription>Help us understand your goals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Short bio</Label>
                    <Textarea 
                      placeholder="Tell us about yourself..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goals (select all that apply)</Label>
                    <div className="flex flex-wrap gap-2">
                      {GOALS.map((goal) => (
                        <button
                          key={goal}
                          onClick={() => toggleGoal(goal)}
                          className={cn(
                            "px-3 py-2 rounded-full border text-sm font-medium transition-all duration-200",
                            selectedGoals.includes(goal)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-border hover:border-primary/50"
                          )}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Interests</Label>
                    <Input 
                      placeholder="e.g., AI, Leadership, Sustainability"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </CardContent>
              </>
            )}
            
            {/* Navigation */}
            <div className="p-6 pt-0">
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleNext}
                disabled={
                  isSubmitting ||
                  (step === 1 && selectedSectors.length === 0) ||
                  (step === 2 && !bio)
                }
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  step === 2 ? "Complete Setup" : "Continue"
                )}
              </Button>
              {step > 1 && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-2"
                  onClick={() => setStep(step - 1)}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Onboarding;
