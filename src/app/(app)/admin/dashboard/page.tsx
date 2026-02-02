'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, BookOpen, Calendar, BarChart3, ShoppingBag, Heart, Megaphone, Briefcase, DollarSign, Share2 } from 'lucide-react';
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
            <Button variant="outline" size="lg" className="h-20 justify-start" onClick={() => router.push('/admin/analytics')}>
                <BarChart3 className="mr-4 h-6 w-6" />
                <div className="text-left">
                    <p className="font-semibold">Analytics</p>
                    <p className="text-xs text-muted-foreground">View network performance</p>
                </div>
            </Button>
            <Button variant="outline" size="lg" className="h-20 justify-start" onClick={() => router.push('/admin/users')}>
                <Users className="mr-4 h-6 w-6" />
                <div className="text-left">
                    <p className="font-semibold">User Management</p>
                    <p className="text-xs text-muted-foreground">Manage roles and permissions</p>
                </div>
            </Button>
            <Button variant="outline" size="lg" className="h-20 justify-start" onClick={() => router.push('/admin/kyc')}>
                <Shield className="mr-4 h-6 w-6" />
                <div className="text-left">
                    <p className="font-semibold">KYC Verification</p>
                    <p className="text-xs text-muted-foreground">Approve mentor submissions</p>
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
            <Button variant="outline" size="lg" className="h-20 justify-start" onClick={() => router.push('/admin/products')}>
                <ShoppingBag className="mr-4 h-6 w-6" />
                <div className="text-left">
                    <p className="font-semibold">Product Approvals</p>
                    <p className="text-xs text-muted-foreground">Review member products</p>
                </div>
            </Button>
            <Button variant="outline" size="lg" className="h-20 justify-start" onClick={() => router.push('/admin/sectors')}>
                <Briefcase className="mr-4 h-6 w-6" />
                <div className="text-left">
                    <p className="font-semibold">Sector Management</p>
                    <p className="text-xs text-muted-foreground">Manage industry sectors</p>
                </div>
            </Button>
            <Button variant="outline" size="lg" className="h-20 justify-start" onClick={() => router.push('/admin/causes')}>
                <Heart className="mr-4 h-6 w-6" />
                <div className="text-left">
                    <p className="font-semibold">Fundraisers</p>
                    <p className="text-xs text-muted-foreground">Approve community causes</p>
                </div>
            </Button>
             <Button variant="outline" size="lg" className="h-20 justify-start" onClick={() => router.push('/admin/ads')}>
                <Megaphone className="mr-4 h-6 w-6" />
                <div className="text-left">
                    <p className="font-semibold">Ad Campaigns</p>
                    <p className="text-xs text-muted-foreground">Review sponsored ads</p>
                </div>
            </Button>
             <Button variant="outline" size="lg" className="h-20 justify-start" onClick={() => router.push('/admin/withdrawals')}>
                <DollarSign className="mr-4 h-6 w-6" />
                <div className="text-left">
                    <p className="font-semibold">Withdrawal Requests</p>
                    <p className="text-xs text-muted-foreground">Process member withdrawals</p>
                </div>
            </Button>
            <Button variant="outline" size="lg" className="h-20 justify-start" onClick={() => router.push('/admin/commissions')}>
                <DollarSign className="mr-4 h-6 w-6" />
                <div className="text-left">
                    <p className="font-semibold">Commissions</p>
                    <p className="text-xs text-muted-foreground">View affiliate commissions</p>
                </div>
            </Button>
            <Button variant="outline" size="lg" className="h-20 justify-start" onClick={() => router.push('/admin/referrals')}>
                <Share2 className="mr-4 h-6 w-6" />
                <div className="text-left">
                    <p className="font-semibold">Referrals</p>
                    <p className="text-xs text-muted-foreground">Browse affiliate network</p>
                </div>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
