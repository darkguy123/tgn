"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { members } from "@/lib/data";
import { Award, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const chartData = [
  { month: "January", members: 186 },
  { month: "February", members: 305 },
  { month: "March", members: 237 },
  { month: "April", members: 273 },
  { month: "May", members: 209 },
  { month: "June", members: 214 },
];

const chartConfig = {
  members: {
    label: "New Members",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const totalMembers = members.length;
  const totalMentors = members.filter((m) => m.role === "Mentor").length;
  const verifiedMembers = members.filter((m) => m.isVerified).length;

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Members</CardDescription>
            <CardTitle className="text-4xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-muted-foreground" />
              {totalMembers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +25% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Mentors</CardDescription>
            <CardTitle className="text-4xl font-bold flex items-center gap-2">
              <Award className="h-8 w-8 text-muted-foreground" />
              {totalMentors}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +10% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Verified Members</CardDescription>
            <CardTitle className="text-4xl font-bold flex items-center gap-2">
              <UserCheck className="h-8 w-8 text-muted-foreground" />
              {verifiedMembers}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              +15% from last month
            </div>
          </CardContent>
        </Card>
         <Card className="sm:col-span-2 md:col-span-1 lg:col-span-2 xl:col-span-1 flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Welcome to TGN Hub!</CardTitle>
            <CardDescription>
              Your journey to global connection starts here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/matchmaking">
              <Button size="sm" className="w-full">
                Find a Mentor
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Member Growth</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="members" fill="var(--color-members)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
