'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, Briefcase } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { TGNMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminAnalyticsPage() {
  const firestore = useFirestore();
  const usersRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading } = useCollection<TGNMember>(usersRef);

  const totalMembers = users?.length || 0;
  const activeMentors = users?.filter(u => u.role.includes('mentor') && u.isVerifiedMentor).length || 0;

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
                <p className="text-4xl font-bold">{totalMembers}</p>
                <p className="text-xs text-muted-foreground">All registered users.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{activeMentors}</p>
                <p className="text-xs text-muted-foreground">Verified and active mentors.</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Engagement Rate</CardTitle>
                <CardDescription>Daily active users.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">N/A</p>
                <p className="text-xs text-muted-foreground">Data not available.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Programs Completed</CardTitle>
                <CardDescription>This month.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">N/A</p>
                <p className="text-xs text-muted-foreground">Data not available.</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
       <Card>
            <CardHeader>
                <CardTitle>Analytics Charts</CardTitle>
                <CardDescription>Detailed charts will be available soon.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Chart data is not available yet.</p>
            </CardContent>
        </Card>

    </div>
  );
}
