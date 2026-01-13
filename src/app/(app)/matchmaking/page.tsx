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
import { members } from "@/lib/data";
import { MatchExplanation } from "@/components/match-explanation";
import placeholderImages from "@/lib/placeholder-images.json";
import { CheckCircle2 } from "lucide-react";

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};

export default function MatchmakingPage() {
  const currentMentee = members.find((m) => m.name === "Chloe Kim");
  const recommendedMentors = members.filter(
    (m) =>
      m.role === "Mentor" &&
      (m.sector === "Technology" || m.sector === "Finance")
  );

  if (!currentMentee) {
    return <div>Could not load user data.</div>;
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
        {recommendedMentors.map((mentor) => {
          const img = getImage(mentor.imageId);
          return (
            <Card key={mentor.id} className="flex flex-col">
              <CardHeader className="flex flex-col items-center text-center p-6">
                <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-md">
                  <AvatarImage src={img?.imageUrl} alt={mentor.name} />
                  <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{mentor.name}</CardTitle>
                <CardDescription>{mentor.location}</CardDescription>
                {mentor.isVerified && (
                    <Badge variant="default" className="mt-2 bg-green-500 hover:bg-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Verified Mentor
                    </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-1 p-6 pt-0">
                <div className="flex justify-center gap-2">
                    <Badge variant="secondary">{mentor.sector}</Badge>
                    <Badge variant="secondary">{mentor.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center line-clamp-3">
                    {mentor.profile}
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
