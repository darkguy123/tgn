
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/icons";
import { MapPin, Briefcase, User, Target, Check, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { continents, countries, sectors as SECTORS, roles as ROLES, goals as GOALS } from "@/lib/data";
import { useUser, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import { Skeleton } from "@/components/ui/skeleton";

const Onboarding = () => {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [tgnMemberId, setTgnMemberId] = useState("");
  
  const { profile, isLoading: isProfileLoading } = useMemberProfile();

  // Form state
  const [continent, setContinent] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
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
    if (step < 4) {
      setStep(step + 1);
    } else {
       if (user && firestore) {
        const newId = `TGN-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const dataToSave = {
            id: user.uid,
            tgnMemberId: newId,
            signInType: user.providerData[0]?.providerId || "password",
            email: user.email,
            locationContinent: continent,
            locationCountry: country,
            locationRegion: region,
            sectorPreferences: selectedSectors,
            role: selectedRole,
            purpose: bio,
            identityProfile: JSON.stringify({ goals: selectedGoals, interests: interests }),
            createdAt: new Date().toISOString(),
        };
        const userDocRef = doc(firestore, "users", user.uid);
        setDocumentNonBlocking(userDocRef, dataToSave, { merge: true });
        setTgnMemberId(newId);
        setCompleted(true);
      }
    }
  };

  const handleComplete = () => {
    router.push("/dashboard");
  };

  const stepIcons = [
    <MapPin key="1" className="h-5 w-5" />,
    <Briefcase key="2" className="h-5 w-5" />,
    <User key="3" className="h-5 w-5" />,
    <Target key="4" className="h-5 w-5" />
  ];
  
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none" />
        
        <Card className="w-full max-w-md text-center animate-scale-in border-0 shadow-xl">
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      {/* Header */}
      <header className="py-6 px-4">
        <div className="flex justify-center">
          <Logo className="h-12 object-contain" />
        </div>
      </header>
      
      {/* Progress indicator */}
      <div className="px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
                  s < step ? "bg-primary text-primary-foreground" :
                  s === step ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                )}>
                  {s < step ? <Check className="h-5 w-5" /> : stepIcons[s - 1]}
                </div>
                {s < 4 && (
                  <div className={cn(
                    "h-1 w-12 sm:w-16 mx-1",
                    s < step ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <Card className="w-full max-w-lg animate-fade-in border-0 shadow-xl">
          {/* Step 1: Location */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="text-xl">Where are you joining from?</CardTitle>
                <CardDescription>This helps personalize your experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Continent</Label>
                  <Select value={continent} onValueChange={setContinent}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select continent" />
                    </SelectTrigger>
                    <SelectContent>
                      {continents.map(c => <SelectItem key={c} value={c.toLowerCase().replace(' ', '-')}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Region / State</Label>
                  <Input
                    placeholder="Enter your region or state"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="h-12"
                  />
                </div>
              </CardContent>
            </>
          )}
          
          {/* Step 2: Sectors */}
          {step === 2 && (
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
          
          {/* Step 3: Role */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="text-xl">Select your role</CardTitle>
                <CardDescription>How do you want to participate?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {ROLES.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={cn(
                        "p-4 rounded-lg border text-left transition-all duration-200 flex items-center gap-4",
                        selectedRole === role.id
                          ? "bg-primary text-primary-foreground border-primary shadow-soft"
                          : "bg-card border-border hover:border-primary/50 hover:bg-muted"
                      )}
                    >
                      <span className="text-2xl">{role.icon}</span>
                      <div>
                        <p className="font-medium">{role.title}</p>
                        <p className={cn(
                          "text-sm",
                          selectedRole === role.id ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                          {role.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </>
          )}
          
          {/* Step 4: Purpose */}
          {step === 4 && (
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
                (step === 1 && (!continent || !country)) ||
                (step === 2 && selectedSectors.length === 0) ||
                (step === 3 && !selectedRole) ||
                (step === 4 && !bio)
              }
            >
              {step === 4 ? "Complete Setup" : "Continue"}
            </Button>
            {step > 1 && (
              <Button 
                variant="ghost" 
                className="w-full mt-2"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Onboarding;
