'use client';
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
import { MatchExplanation } from "@/components/match-explanation";
import placeholderImages from "@/lib/placeholder-images.json";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { TGNMember } from "@/lib/types";


const getImage = (imageId?: string) => {
  if (!imageId) return null;
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};

const getNameFromEmail = (email: string) => {
    return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function MatchmakingPage() {
  const { profile: currentMentee, isLoading: isMenteeLoading } = useMemberProfile();
  
  const firestore = useFirestore();
  const membersRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  // A more sophisticated query could be used here
  const mentorsQuery = useMemoFirebase(() => query(membersRef, where('role', 'in', ['associate-mentor', 'mentor-candidate'])), [membersRef]);
  
  const { data: recommendedMentors, isLoading: areMentorsLoading } = useCollection<TGNMember>(mentorsQuery);

  if (isMenteeLoading || areMentorsLoading) {
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
    return <div>Could not load your user data. Please try again.</div>;
  }

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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendedMentors?.map((mentor) => {
          const img = getImage(mentor.imageId);
          const name = getNameFromEmail(mentor.email);
          return (
            <Card key={mentor.id} className="flex flex-col">
              <CardHeader className="flex flex-col items-center text-center p-6">
                <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-md">
                  <AvatarImage src={img?.imageUrl} alt={name} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{name}</CardTitle>
                <CardDescription>{mentor.locationCountry}</CardDescription>
                <Badge variant="default" className="mt-2 bg-green-500 hover:bg-green-600">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Verified Mentor
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-0">
                <div className="flex justify-center gap-2 flex-wrap">
                    {mentor.sectorPreferences?.map(sector => (
                        <Badge key={sector} variant="secondary">{sector}</Badge>
                    ))}
                    <Badge variant="secondary" className="capitalize">{mentor.role.replace('-', ' ')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center line-clamp-3">
                    {mentor.purpose}
                </p>
              </CardContent>
              <CardFooter className="p-4">
                <MatchExplanation mentor={mentor} mentee={currentMentee} />
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
