'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Users, Calendar, PlusCircle, Award, BookOpen } from 'lucide-react';

export function MentorDashboard() {
    const { user } = useUser();
    const { profile } = useMemberProfile();
    const userName = profile?.name || user?.displayName?.split(' ')[0] || 'Mentor';
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Welcome, {userName}</h1>
                    <p className="text-muted-foreground">Manage your mentorship activities and growth.</p>
                </div>
                <Card className="bg-primary/5 border-primary/20 shrink-0">
                    <CardContent className="p-3 px-4 flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Account Type</p>
                            <p className="font-semibold text-primary capitalize">{profile?.role?.replace('-', ' ') || 'Mentor'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Mentees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Active mentees</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">0</p>
                        <p className="text-xs text-muted-foreground">Scheduled this week</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Your Content</CardTitle>
                        <CardDescription>Manage your programs, products, and articles.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-20 flex-col items-start p-4" onClick={() => router.push('/admin/programs')}>
                            <BookOpen className="mb-2" />
                            <p className="font-semibold">Manage Programs</p>
                            <p className="text-xs text-muted-foreground text-left">Create and edit your learning programs.</p>
                        </Button>
                         <Button variant="outline" className="h-20 flex-col items-start p-4" onClick={() => router.push('/marketplace/my-products')}>
                            <PlusCircle className="mb-2" />
                            <p className="font-semibold">Manage Products</p>
                            <p className="text-xs text-muted-foreground text-left">Add or update products in the marketplace.</p>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Certification</CardTitle>
                        <CardDescription>Your path to becoming a certified TGN Mentor.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center text-muted-foreground p-6">
                            <Award className="h-10 w-10 mx-auto mb-2 text-primary" />
                            <p className="mb-4">Complete your requirements to earn your badge.</p>
                            <Button onClick={() => router.push('/certification')}>View Progress</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
