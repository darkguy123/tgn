'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, Briefcase, BookOpen, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { subMonths, format } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TGNMember, Program, Cause } from '@/lib/types';


export default function AdminAnalyticsPage() {
  const firestore = useFirestore();

  // Queries
  const usersRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const programsRef = useMemoFirebase(() => collection(firestore, 'programs'), [firestore]);
  const causesRef = useMemoFirebase(() => collection(firestore, 'causes'), [firestore]);

  // Data fetching
  const { data: members, isLoading: membersLoading } = useCollection<TGNMember>(usersRef);
  const { data: programs, isLoading: programsLoading } = useCollection<Program>(programsRef);
  const { data: causes, isLoading: causesLoading } = useCollection<Cause>(causesRef);

  const isLoading = membersLoading || programsLoading || causesLoading;

  const stats = useMemo(() => {
    if (isLoading || !members || !programs || !causes) {
      return {
        totalMembers: 0,
        activeMentors: 0,
        totalPrograms: 0,
        totalRaised: 0,
      };
    }
    return {
      totalMembers: members.length,
      activeMentors: members.filter(m => m.isVerifiedMentor).length,
      totalPrograms: programs.length,
      totalRaised: causes.reduce((acc, cause) => acc + cause.currentAmount, 0),
    };
  }, [isLoading, members, programs, causes]);

  const memberGrowthData = useMemo(() => {
    if (!members) return [];
    const now = new Date();
    
    const monthlyCounts: { [key: string]: number } = {};

    // Initialize the last 6 months
    for (let i = 5; i >= 0; i--) {
        const month = format(subMonths(now, i), 'MMM');
        monthlyCounts[month] = 0;
    }

    members.forEach(member => {
        if (member.createdAt?.toDate) {
            const createdAtDate = member.createdAt.toDate();
            // Check if the member was created within the last 6 months
            if (createdAtDate >= subMonths(now, 6)) {
                const month = format(createdAtDate, 'MMM');
                if (monthlyCounts.hasOwnProperty(month)) {
                    monthlyCounts[month]++;
                }
            }
        }
    });
    
    return Object.entries(monthlyCounts).map(([name, users]) => ({ name, users }));

  }, [members]);

  const programPopularityData = useMemo(() => {
    if (!programs) return [];
    return programs
      .map(p => ({ name: p.title, enrolled: p.enrolled || 0 }))
      .sort((a, b) => b.enrolled - a.enrolled)
      .slice(0, 5); // Top 5
  }, [programs]);


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
                <p className="text-4xl font-bold">{stats.totalMembers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">All registered users.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.activeMentors.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Verified and active mentors.</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.totalPrograms.toLocaleString()}</p>
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
                            <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Program Popularity</CardTitle>
                    <CardDescription>Top 5 programs by enrollment.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={programPopularityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={false} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="enrolled" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
       </div>

    </div>
  );
}
