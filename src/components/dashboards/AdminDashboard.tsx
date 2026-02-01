'use client';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowRight } from 'lucide-react';

export function AdminDashboard() {
    const router = useRouter();

    return (
        <Card className="bg-primary/5 border-primary/20 mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="text-primary" />
                        Admin Panel
                    </CardTitle>
                    <CardDescription>
                        You have administrative privileges. Click to manage network features.
                    </CardDescription>
                </div>
                <Button onClick={() => router.push('/admin/dashboard')}>
                    Go to Admin Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardHeader>
        </Card>
    )
}
