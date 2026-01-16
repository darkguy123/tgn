import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  FileText,
  Star,
  Award,
  BookOpen,
  Calendar,
  BadgeDollarSign,
} from "lucide-react";

export default function CertificationPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          Verification & Certification
        </h1>
        <p className="text-muted-foreground">
          Enhance your profile and unlock new opportunities within the network.
        </p>
      </header>

      <Tabs defaultValue="mentor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mentee">Mentee Verification</TabsTrigger>
          <TabsTrigger value="mentor">Mentor Certification</TabsTrigger>
        </TabsList>
        <TabsContent value="mentee">
          <Card>
            <CardHeader>
              <CardTitle>Become a Verified Mentee</CardTitle>
              <CardDescription>
                Show your commitment and gain access to exclusive benefits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Verification Benefits:</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Priority access to top mentors.</li>
                  <li>Discounts on courses, events, and marketplace items.</li>
                  <li>A "Verified" badge on your profile to stand out.</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Requirements:</h3>
                <p className="text-muted-foreground">
                  Complete your profile and attend an introductory webinar.
                </p>
              </div>
              <Button>Start Verification</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="mentor">
          <Card>
            <CardHeader>
              <CardTitle>Mentor Certification Path</CardTitle>
              <CardDescription>
                Follow our structured path to become a certified TGN Mentor or
                a verified Associate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  TGN Certified Mentor Path
                </h3>
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <BadgeDollarSign className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Complete 3 Paid Programs</p>
                      <p className="text-sm text-muted-foreground">
                        Status: 1 of 3 completed
                      </p>
                    </div>
                    <Progress value={33} className="ml-auto w-1/4 mt-2" />
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <Calendar className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Be Active for 3+ Months</p>
                      <p className="text-sm text-muted-foreground">
                        Status: 1.5 of 3 months
                      </p>
                    </div>
                    <Progress value={50} className="ml-auto w-1/4 mt-2" />
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <Star className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-medium">
                        Achieve 7-Star Mentee Badge
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Current: ★ 4
                      </p>
                    </div>
                    <Progress value={(4 / 7) * 100} className="ml-auto w-1/4 mt-2" />
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-medium">
                        Complete Certification Curriculum
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Includes assessments and practicum.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Start Curriculum
                    </Button>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Pass TGN Evaluation</p>
                      <p className="text-sm text-muted-foreground">
                        Final review by the TGN committee.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      disabled
                    >
                      Pending
                    </Button>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg bg-primary/5 border-primary/20">
                    <Award className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Certificate Issued</p>
                      <p className="text-sm text-muted-foreground">
                        Your official TGN Certified Mentor certificate.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      disabled
                    >
                      View Certificate
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">
                  Associate Mentor Verification (for Experienced Mentors)
                </h3>
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <FileText className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Application Review</p>
                      <p className="text-sm text-muted-foreground">
                        Submit your professional experience for review.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Apply Now
                    </Button>
                  </div>
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <Star className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Orientation & Assessment</p>
                      <p className="text-sm text-muted-foreground">
                        Complete a verification call and platform orientation.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      disabled
                    >
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
