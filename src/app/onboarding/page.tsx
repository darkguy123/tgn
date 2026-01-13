"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { sectors, continents, countries } from "@/lib/data";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { useUser, useFirestore, useAuth } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

const totalSteps = 4;

const roles = [
    "Mentee",
    "Mentor Candidate",
    "Associate",
    "Collaborator",
    "Sponsor",
    "Country Manager",
    "Volunteer",
    "Media"
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const { user } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const handleNext = async () => {
    if (step === totalSteps) {
      // On finish, save data to Firestore.
      const formData = new FormData(document.querySelector('form')!);
      const tgnMemberId = `TGN-${String(Math.floor(Math.random() * 9000) + 1000)}`;

      const dataToSave = {
        id: user?.uid,
        tgnMemberId: tgnMemberId,
        signInType: user?.providerData[0]?.providerId || "email",
        email: user?.email,
        locationContinent: formData.get("continent"),
        locationCountry: formData.get("country"),
        locationRegion: formData.get("region"),
        role: formData.get("role"),
        purpose: formData.get("purpose"),
        identityProfile: formData.get("identityProfile"),
        sectorPreferences: selectedSectors,
      };

      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        setDocumentNonBlocking(userDocRef, dataToSave, { merge: true });
      }
      
      setStep((s) => s + 1);
      
    } else {
      setStep((s) => Math.min(s + 1, totalSteps + 1));
    }
  };
  
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSectorChange = (sector: string, checked: boolean | "indeterminate") => {
    if (checked) {
      if(selectedSectors.length < 30) {
        setSelectedSectors([...selectedSectors, sector]);
      }
    } else {
      setSelectedSectors(selectedSectors.filter((s) => s !== sector));
    }
  };

  const progress = (step / totalSteps) * 100;

  if (!user) {
      return (
          <div className="flex min-h-screen flex-col items-center justify-center">
              <p>Loading user information...</p>
          </div>
      )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
       <div className="absolute top-6 left-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-foreground">
          <Logo className="h-6 w-6"/>
          <span className="font-semibold">TGN Hub</span>
        </Link>
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          {step <= totalSteps ? (
            <>
              <Progress value={progress} className="mb-4" />
              <CardTitle>Universal Member Onboarding</CardTitle>
              <CardDescription>
                Step {step} of {totalSteps}: Complete your profile to join the network.
              </CardDescription>
            </>
          ) : (
            <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-center">Onboarding Complete!</CardTitle>
                <CardDescription className="text-center">
                    Welcome to the Transcend Global Network.
                </CardDescription>
            </>
          )}
        </CardHeader>
        <form>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="continent">Continent</Label>
                    <Select name="continent">
                    <SelectTrigger id="continent">
                        <SelectValue placeholder="Select your continent..." />
                    </SelectTrigger>
                    <SelectContent>
                        {continents.map(c => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select name="country">
                    <SelectTrigger id="country">
                        <SelectValue placeholder="Select your country..." />
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map(c => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input id="region" name="region" placeholder="e.g., California" />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Primary Role</Label>
                <Select onValueChange={setRole} value={role} name="role">
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => <SelectItem key={r} value={r.toLowerCase().replace(' ', '_')}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Sector Preferences (up to 30)</Label>
                    <p className="text-sm text-muted-foreground">
                        Select industries you're interested in or have expertise in.
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                    {sectors.map((sector) => (
                        <div key={sector} className="flex items-center space-x-2">
                            <Checkbox 
                                id={sector.toLowerCase()}
                                onCheckedChange={(checked) => handleSectorChange(sector, checked)}
                                checked={selectedSectors.includes(sector)}
                                disabled={selectedSectors.length >= 30 && !selectedSectors.includes(sector)}
                            />
                            <Label htmlFor={sector.toLowerCase()} className="font-normal">{sector}</Label>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">{selectedSectors.length} of 30 selected.</p>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Textarea id="purpose" name="purpose" placeholder="What is your purpose for joining the network?" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="identityProfile">Identity Profile</Label>
                    <Textarea id="identityProfile" name="identityProfile" placeholder="Describe your self-identified identity." />
                </div>
            </div>
          )}
          {step > totalSteps && (
              <div className="text-center">
                  <p>You can now access all features of the network.</p>
                  <Button asChild className="mt-4">
                      <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
              </div>
          )}
        </CardContent>
        </form>
        {step <= totalSteps && (
            <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleNext} type="button">
                {step === totalSteps ? "Finish" : "Next"}
            </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
