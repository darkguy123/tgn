'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, Briefcase, BookOpen, Heart, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { subMonths, format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Mock Data to prevent overloading the connection
const mockStats = {
  totalMembers: 1250,
  activeMentors: 150,
  totalPrograms: 45,
  totalRaised: 52340,
};

const mockMemberGrowthData = [
    { name: 'Jan', users: 150 },
    { name: 'Feb', users: 220 },
    { name: 'Mar', users: 300 },
    { name: 'Apr', users: 280 },
    { name: 'May', users: 450 },
    { name: 'Jun', users: 600 },
];

const mockProgramPopularityData = [
    { name: 'Intro to AI', enrolled: 120 },
    { name: 'Leadership 101', enrolled: 95 },
    { name: 'Startup Scaling', enrolled: 80 },
    { name: 'Digital Marketing', enrolled: 150 },
    { name: 'Personal Branding', enrolled: 70 },
];


export default function AdminAnalyticsPage() {
  // All firebase fetching logic is removed to prevent network errors.
  const isLoading = false; // We are not loading live data anymore.

  // Use mock data
  const stats = mockStats;
  const memberGrowthData = mockMemberGrowthData;
  const programPopularityData = mockProgramPopularityData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
          <p className="text-muted-foreground">
            Insights into network growth, engagement, and performance.
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Download Monthly Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.totalMembers}</p>
                <p className="text-xs text-muted-foreground">All registered users.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.activeMentors}</p>
                <p className="text-xs text-muted-foreground">Verified and active mentors.</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.totalPrograms}</p>
                <p className="text-xs text-muted-foreground">Live & self-paced courses.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">${stats.totalRaised.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">From community fundraisers.</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
       <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Member Growth</CardTitle>
                    <CardDescription>New members over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={memberGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Program Popularity</CardTitle>
                    <CardDescription>Number of enrolled members per program.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={programPopularityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={false} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="enrolled" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
       </div>

    </div>
  );
}
