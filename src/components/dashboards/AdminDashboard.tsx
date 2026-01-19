'use client';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Calendar, ExternalLink, CheckCheck, BarChart3, Users, Megaphone, Heart } from 'lucide-react';

export function AdminDashboard() {
    const router = useRouter();

    return (
        <Card className="bg-primary/5 border-primary/20 mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="text-primary" />
                    Admin Panel
                </CardTitle>
                <CardDescription>
                    You have administrative privileges. Access and manage network features.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                <Button onClick={() => router.push('/admin/programs')}>Manage Programs</Button>
                <Button variant="outline" onClick={() => router.push('/admin/events')}>
                    Manage Events <Calendar className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => router.push('/admin/products')}>
                    Manage Products <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => router.push('/admin/kyc')}>
                    Manage KYC <CheckCheck className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => router.push('/admin/causes')}>
                    Manage Fundraisers <Heart className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => router.push('/admin/analytics')}>
                    View Analytics <BarChart3 className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => router.push('/admin/users')}>
                    Manage Users <Users className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => router.push('/admin/ads')}>
                    Manage Ads <Megaphone className="ml-2 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    )
}
