'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users,
  Book
} from "lucide-react";
import Link from "next/link";

const CohortsPage = () => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Cohorts</h1>
        <p className="text-muted-foreground">Your enrolled programs and group learning spaces.</p>
      </div>

      <Card className="flex flex-col items-center justify-center text-center py-20">
          <CardHeader>
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-10 w-10 text-primary" />
            </div>
            <CardTitle>You are not enrolled in any cohorts yet</CardTitle>
            <CardDescription>
                When you enroll in a group program, your cohort details will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button asChild>
                <Link href="/programs">
                    <Book className="mr-2 h-4 w-4"/>
                    Explore Programs
                </Link>
            </Button>
          </CardContent>
      </Card>
    </>
  );
};

export default CohortsPage;
