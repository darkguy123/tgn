'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const networkData = [
  { name: 'Jan', members: 4000, mentors: 2400 },
  { name: 'Feb', members: 3000, mentors: 1398 },
  { name: 'Mar', members: 2000, mentors: 9800 },
  { name: 'Apr', members: 2780, mentors: 3908 },
  { name: 'May', members: 1890, mentors: 4800 },
  { name: 'Jun', members: 2390, mentors: 3800 },
  { name: 'Jul', members: 3490, mentors: 4300 },
];

const programData = [
  { name: 'Leadership', enrolled: 400, completed: 240 },
  { name: 'Marketing', enrolled: 300, completed: 139 },
  { name: 'Strategy', enrolled: 200, completed: 180 },
  { name: 'Finance', enrolled: 278, completed: 190 },
  { name: 'Tech', enrolled: 189, completed: 80 },
];

const sectorData = [
    { name: 'Technology', value: 4500 },
    { name: 'Healthcare', value: 3200 },
    { name: 'Finance', value: 2800 },
    { name: 'Education', value: 2500 },
    { name: 'Retail', value: 1800 },
    { name: 'Non-Profit', value: 1200 },
]

export default function AdminAnalyticsPage() {
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
        <Card>
          <CardHeader>
            <CardTitle>Total Members</CardTitle>
            <CardDescription>All registered users.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">12,543</p>
            <p className="text-xs text-muted-foreground text-green-500">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Mentors</CardTitle>
            <CardDescription>Verified and active mentors.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">1,821</p>
            <p className="text-xs text-muted-foreground text-green-500">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagement Rate</CardTitle>
            <CardDescription>Daily active users.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">68.5%</p>
            <p className="text-xs text-muted-foreground text-green-500">+5% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Programs Completed</CardTitle>
            <CardDescription>This month.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">842</p>
            <p className="text-xs text-muted-foreground text-green-500">+18% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Network Growth</CardTitle>
            <CardDescription>Total members vs. active mentors over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={networkData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="members" stroke="#8884d8" name="Total Members" />
                <Line type="monotone" dataKey="mentors" stroke="#82ca9d" name="Active Mentors" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Program Performance</CardTitle>
            <CardDescription>Enrollment vs. completion rates.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={programData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="enrolled" fill="#8884d8" name="Enrolled" />
                <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
       <Card>
            <CardHeader>
                <CardTitle>Sector Distribution</CardTitle>
                <CardDescription>Breakdown of members by their primary sector.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sectorData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="hsl(var(--primary))" name="Members" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

    </div>
  );
}
