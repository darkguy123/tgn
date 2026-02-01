'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, BookOpen, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
    const router = useRouter();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome to the TGN network management center.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Management Sections</CardTitle>
            <CardDescription>Navigate to different parts of the admin panel.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" size="lg" className="h-20 justify-start" onClick={() => router.push('/admin/users')}>
                <Users className="mr-4 h-6 w-6" />
                <div className="text-left">
                    <p className="font-semibold">User Management</p>
                    <p className="text-xs text-muted-foreground">Manage roles and permissions</p>
                </div>
            </Button>
            <Button variant="outline" size="lg" className="h-20 justify-start" onClick={() => router.push('/admin/programs')}>
                <BookOpen className="mr-4 h-6 w-6" />
                <div className="text-left">
                    <p className="font-semibold">Program Management</p>
                    <p className="text-xs text-muted-foreground">Create and edit programs</p>
                </div>
            </Button>
             <Button variant="outline" size="lg" className="h-20 justify-start" onClick={() => router.push('/admin/events')}>
                <Calendar className="mr-4 h-6 w-6" />
                <div className="text-left">
                    <p className="font-semibold">Event Management</p>
                    <p className="text-xs text-muted-foreground">Manage network events</p>
                </div>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
