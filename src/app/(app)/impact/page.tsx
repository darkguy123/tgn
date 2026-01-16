'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, TrendingUp, Users, Globe, Award, Star,
  ArrowUp, ArrowDown, Calendar
} from "lucide-react";

const ImpactPage = () => {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Impact Overview</h1>
        <p className="text-muted-foreground">Track your contribution and network growth.</p>
      </div>

      {/* Highlights */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mentor of the Month</p>
                <p className="text-xl font-bold text-foreground">To be announced</p>
                <p className="text-sm text-muted-foreground">Network-wide recognition</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mentee of the Month</p>
                <p className="text-xl font-bold text-foreground">To be announced</p>
                <p className="text-sm text-muted-foreground">Celebrating growth & achievement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Report */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Network Monthly Report
              </CardTitle>
              <CardDescription>Data not yet available</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">New Members</p>
                <p className="text-2xl font-bold text-foreground">N/A</p>
            </div>
             <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Sessions Held</p>
                <p className="text-2xl font-bold text-foreground">N/A</p>
            </div>
             <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Programs Completed</p>
                <p className="text-2xl font-bold text-foreground">N/A</p>
            </div>
             <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Causes Funded</p>
                <p className="text-2xl font-bold text-foreground">N/A</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Your Ratings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Your Personal Impact
            </CardTitle>
            <CardDescription>This data is specific to your activity.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col items-center justify-center text-center py-10">
                <BarChart3 className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your impact data is not yet available.</p>
            </div>
          </CardContent>
        </Card>

        {/* Sector Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Network Performance
            </CardTitle>
             <CardDescription>Insights into the network's health.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center text-center py-10">
                <TrendingUp className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Network performance data is not yet available.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ImpactPage;
