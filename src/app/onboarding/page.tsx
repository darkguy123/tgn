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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { continents, countries, regions } from "@/lib/data";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { useUser, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";

const totalSteps = 1;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const { user } = useUser();
  const firestore = useFirestore();

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
          <Logo className="h-8 w-auto"/>
          <span className="font-semibold sr-only">TGN Hub</span>
        </Link>
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          {step <= totalSteps ? (
            <>
              <Progress value={progress} className="mb-4" />
              <CardTitle>Universal Member Onboarding</CardTitle>
              <CardDescription>
                Step {step} of {totalSteps}: Let's start with your location.
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
                        {continents.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                        {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select name="region">
                  <SelectTrigger id="region">
                      <SelectValue placeholder="Select your region..." />
                  </SelectTrigger>
                  <SelectContent>
                      {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
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
