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
import { sectors } from "@/lib/data";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";

const totalSteps = 3;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");

  const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps + 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));
  
  const progress = (step / totalSteps) * 100;

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
                    Welcome to the Transcend Global Network. Your TGN Member ID is TGN-0009.
                </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="e.g., Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g., London, UK" />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Primary Role</Label>
                <Select onValueChange={setRole} value={role}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mentee">Mentee (I want to learn)</SelectItem>
                    <SelectItem value="mentor">Mentor (I want to share knowledge)</SelectItem>
                    <SelectItem value="affiliate">Affiliate (I want to earn by referring)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Sector Preferences</Label>
                    <p className="text-sm text-muted-foreground">
                        Select industries you're interested in or have expertise in.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {sectors.map((sector) => (
                        <div key={sector} className="flex items-center space-x-2">
                            <Checkbox id={sector.toLowerCase()}/>
                            <Label htmlFor={sector.toLowerCase()} className="font-normal">{sector}</Label>
                        </div>
                    ))}
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
        {step <= totalSteps && (
            <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={handleNext}>
                {step === totalSteps ? "Finish" : "Next"}
            </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
