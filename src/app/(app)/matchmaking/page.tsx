'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, Sparkles, Send, UserCheck, Users, HelpCircle } from "lucide-react";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { TGNMember, Program, Product, Event, Sector } from '@/lib/types';
import { getRecommendations, type RecommendationResult } from '@/app/actions';
import { useRouter } from 'next/navigation';

const getNameFromEmail = (email: string) => {
    return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function MatchmakingPage() {
  const { profile: currentMentee, isLoading: isMenteeLoading } = useMemberProfile();
  const firestore = useFirestore();
  const router = useRouter();

  // Fetch all necessary data for recommendations
  const programsCollectionRef = useMemoFirebase(() => query(collection(firestore, 'programs'), where('deactivatedAt', '==', null)), [firestore]);
  const usersCollectionRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const sectorsCollectionRef = useMemoFirebase(() => collection(firestore, 'sectors'), [firestore]);
  const productsCollectionRef = useMemoFirebase(() => query(collection(firestore, 'products'), where('approvalStatus', '==', 'approved')), [firestore]);
  const eventsCollectionRef = useMemoFirebase(() => query(collection(firestore, 'events'), where('deactivatedAt', '==', null)), [firestore]);

  const { data: allPrograms, isLoading: programsLoading } = useCollection<Program>(programsCollectionRef);
  const { data: allMembers, isLoading: membersLoading } = useCollection<TGNMember>(usersCollectionRef);
  const { data: allSectors, isLoading: sectorsLoading } = useCollection<Sector>(sectorsCollectionRef);
  const { data: allProducts, isLoading: productsLoading } = useCollection<Product>(productsCollectionRef);
  const { data: allEvents, isLoading: eventsLoading } = useCollection<Event>(eventsCollectionRef);
  
  const [recommendations, setRecommendations] = useState<RecommendationResult | { error: string } | null>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  const dataIsLoading = isMenteeLoading || programsLoading || membersLoading || sectorsLoading || productsLoading || eventsLoading;

  useEffect(() => {
    // Only run if we have all the data and haven't fetched recommendations yet.
    if (!dataIsLoading && currentMentee && allPrograms && allMembers && allProducts && allEvents && allSectors && isLoadingRecs) {
      getRecommendations(
        currentMentee,
        allMembers,
        allPrograms,
        allProducts,
        allEvents,
        allSectors
      )
        .then(setRecommendations)
        .finally(() => setIsLoadingRecs(false));
    } else if (!dataIsLoading && !isLoadingRecs) {
      // Data loaded but we are not loading recs anymore, do nothing.
    } else if (!dataIsLoading && !currentMentee) {
        // Data loaded but no mentee profile, stop loading.
        setIsLoadingRecs(false);
    }
  }, [dataIsLoading, currentMentee, allMembers, allPrograms, allProducts, allEvents, allSectors, isLoadingRecs]);


  if (dataIsLoading || isLoadingRecs) {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">
                Your Mentor Recommendations
                </h1>
                <p className="text-muted-foreground">
                AI-powered matches based on your profile and goals.
                </p>
            </header>
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Finding the best matches for you...</p>
            </div>
        </div>
    )
  }

  if (!currentMentee) {
    return (
        <div className="text-center py-20">
            <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Could not load your profile.</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                We need your profile information to generate mentor recommendations.
            </p>
        </div>
    );
  }
  
  if (recommendations && 'error' in recommendations) {
    return (
        <div className="text-center py-20">
            <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Could not generate recommendations.</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                {recommendations.error}
            </p>
        </div>
    );
  }

  const mentorRecommendations = recommendations?.recommendations.filter(rec => rec.recommendedType === 'Mentor') || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Your Mentor Recommendations
        </h1>
        <p className="text-muted-foreground">
          AI-powered matches based on your profile and goals.
        </p>
      </header>

      {mentorRecommendations.length === 0 && !isLoadingRecs && (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Matches Found Yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                We couldn't find any suitable mentor matches right now.
                <br/>
                Make sure your profile is complete to get better recommendations.
            </p>
            <Button className="mt-6" variant="outline" onClick={() => router.push('/settings/profile')}>
                Update My Profile
            </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mentorRecommendations.map((rec) => {
          const mentor = allMembers?.find(m => m.id === rec.recommendedId);
          if (!mentor) return null;

          const name = mentor.name || getNameFromEmail(mentor.email);
          return (
            <Card key={mentor.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-col items-center text-center p-6 bg-muted/30">
                <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-md">
                  <AvatarImage src={mentor.avatarUrl} alt={name} />
                  <AvatarFallback className="text-3xl">{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{name}</CardTitle>
                <CardDescription>{mentor.locationCountry}</CardDescription>
                {mentor.isVerifiedMentor && (
                    <Badge variant="secondary" className="mt-2 border-green-500/50 bg-green-500/10 text-green-700">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Verified Mentor
                    </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-4 space-y-4">
                 <div>
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-muted-foreground">Match Score</p>
                        <p className="text-sm font-bold text-primary">{rec.matchScore}%</p>
                    </div>
                    <Progress value={rec.matchScore} className="h-2" />
                 </div>
                 <div className="p-3 bg-muted rounded-lg text-sm text-foreground/80">
                    <p className="font-semibold text-foreground/90 flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-accent" /> Why it's a match</p>
                    <p className="mt-1">{rec.explanation}</p>
                 </div>
                 <div className="flex justify-center gap-1.5 flex-wrap">
                    {mentor.sectorPreferences?.slice(0,3).map(sector => (
                        <Badge key={sector} variant="secondary">{sector}</Badge>
                    ))}
                </div>
              </CardContent>
              <CardFooter className="p-4">
                 <Button className="w-full" onClick={() => router.push(`/profile/${mentor.id}`)}>
                    <UserCheck className="mr-2 h-4 w-4" /> View Profile
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
    