'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, Briefcase, BookOpen, Heart, DollarSign } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TGNMember, Program, Cause } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { subMonths, format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminAnalyticsPage() {
  const firestore = useFirestore();
  
  // Data fetching
  const usersRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const programsRef = useMemoFirebase(() => collection(firestore, 'programs'), [firestore]);
  const causesRef = useMemoFirebase(() => collection(firestore, 'causes'), [firestore]);
  
  const { data: users, isLoading: usersLoading } = useCollection<TGNMember>(usersRef);
  const { data: programs, isLoading: programsLoading } = useCollection<Program>(programsRef);
  const { data: causes, isLoading: causesLoading } = useCollection<Cause>(causesRef);

  const isLoading = usersLoading || programsLoading || causesLoading;

  // Memoized calculations
  const stats = useMemo(() => {
    if (isLoading || !users || !programs || !causes) return {
      totalMembers: 0,
      activeMentors: 0,
      totalPrograms: 0,
      totalRaised: 0,
    };
    return {
      totalMembers: users.length,
      activeMentors: users.filter(u => u.role.includes('mentor') && u.isVerifiedMentor).length,
      totalPrograms: programs.length,
      totalRaised: causes.reduce((acc, c) => acc + c.currentAmount, 0),
    };
  }, [users, programs, causes, isLoading]);
  
  const memberGrowthData = useMemo(() => {
    if (!users) return [];
    const now = new Date();
    const data = Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(now, 5 - i);
        return { name: format(d, 'MMM'), users: 0 };
    });
    users.forEach(user => {
        if (user.createdAt?.toDate) {
            const month = format(user.createdAt.toDate(), 'MMM');
            const monthData = data.find(d => d.name === month);
            if (monthData) {
                monthData.users++;
            }
        }
    });
    return data;
  }, [users]);
  
   const programPopularityData = useMemo(() => {
    if (!programs) return [];
    return programs.map(p => ({ name: p.title, enrolled: p.enrolled || 0 }));
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
