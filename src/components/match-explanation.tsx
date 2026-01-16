"use client";

import React, { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMatchExplanation } from "@/app/actions";
import type { TGNMember } from "@/lib/types";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";

type MatchExplanationProps = {
  mentor: TGNMember;
  mentee: TGNMember;
};

const initialState = {
  explanation: undefined,
  error: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-4 w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Tell me why
        </>
      )}
    </Button>
  );
}

export function MatchExplanation({ mentor, mentee }: MatchExplanationProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(getMatchExplanation, initialState);
  
  const mentorName = mentor.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  useEffect(() => {
    if (state.explanation || state.error) {
      setOpen(true);
    }
  }, [state]);

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="menteeProfile" value={JSON.stringify(mentee)} />
        <input type="hidden" name="mentorProfile" value={JSON.stringify(mentor)} />
        <SubmitButton />
      </form>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-accent" />
              Match Explanation
            </DialogTitle>
            <DialogDescription>
              AI-powered insights into why {mentorName} is a great match for you.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {state.error && (
              <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <p>{state.error}</p>
              </div>
            )}
            {state.explanation && (
              <p className="text-sm leading-relaxed text-foreground">
                {state.explanation}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

    