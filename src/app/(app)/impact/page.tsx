'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, TrendingUp, Users, Globe, Award, Star,
  ArrowUp, ArrowDown, Calendar
} from "lucide-react";

const MONTHLY_STATS = [
  { label: "Sessions Attended", value: 12, change: +15, unit: "" },
  { label: "Hours Mentored", value: 24, change: +8, unit: "hrs" },
  { label: "Connections Made", value: 18, change: +25, unit: "" },
  { label: "Tasks Completed", value: 45, change: -5, unit: "" },
];

const SECTOR_PERFORMANCE = [
  { sector: "Technology", score: 92, members: 12500 },
  { sector: "Finance", score: 88, members: 8900 },
  { sector: "Healthcare", score: 85, members: 6700 },
  { sector: "Education", score: 90, members: 9200 },
  { sector: "Agriculture", score: 78, members: 4500 },
];

const COUNTRY_INSIGHTS = [
  { country: "Nigeria", members: 8500, growth: 22 },
  { country: "Kenya", members: 4200, growth: 18 },
  { country: "South Africa", members: 3800, growth: 15 },
  { country: "USA", members: 6200, growth: 12 },
  { country: "UK", members: 3500, growth: 10 },
  { country: "India", members: 5100, growth: 25 },
];

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
                <p className="text-xl font-bold text-foreground">Dr. Amara Obi</p>
                <p className="text-sm text-muted-foreground">Africa Region • 156 mentees impacted</p>
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
                <p className="text-xl font-bold text-foreground">Carlos Rivera</p>
                <p className="text-sm text-muted-foreground">LATAM Region • Badge Level 5 achieved</p>
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
                Monthly Report
              </CardTitle>
              <CardDescription>January 2026</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {MONTHLY_STATS.map((stat) => (
              <div key={stat.label} className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}{stat.unit}
                  </p>
                  <div className={`flex items-center text-sm ${
                    stat.change > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change > 0 ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ratings & Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Your Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Engagement Score", value: 92 },
                { label: "Mentorship Quality", value: 88 },
                { label: "Community Contribution", value: 85 },
                { label: "Program Completion", value: 95 },
              ].map((rating) => (
                <div key={rating.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{rating.label}</span>
                    <span className="font-medium text-foreground">{rating.value}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${rating.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sector Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Sector Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SECTOR_PERFORMANCE.map((sector) => (
                <div key={sector.sector} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{sector.sector}</p>
                    <p className="text-xs text-muted-foreground">{sector.members.toLocaleString()} members</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full">
                      <div 
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${sector.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-10">{sector.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Country Insights */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Country Insights
            </CardTitle>
            <CardDescription>Member distribution and growth by country</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {COUNTRY_INSIGHTS.map((country) => (
                <div key={country.country} className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="font-medium text-foreground">{country.country}</p>
                  <p className="text-2xl font-bold text-primary">{(country.members / 1000).toFixed(1)}K</p>
                  <div className="flex items-center justify-center text-sm text-green-500">
                    <ArrowUp className="h-3 w-3" />
                    {country.growth}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Your Impact Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Your Impact Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Mentees Guided", value: "12", icon: Users },
                { label: "Programs Completed", value: "8", icon: Award },
                { label: "Community Posts", value: "45", icon: BarChart3 },
                { label: "Referrals Made", value: "23", icon: TrendingUp },
              ].map((item) => (
                <div key={item.label} className="p-4 border border-border rounded-lg text-center">
                  <item.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ImpactPage;
