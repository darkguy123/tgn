'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Globe, Users, Heart, Handshake, BarChart3, Megaphone } from 'lucide-react';

export function PartnerDashboard() {
    const { user } = useUser();
    const { profile } = useMemberProfile();
    const userName = profile?.name || user?.displayName?.split(' ')[0] || 'Partner';
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Welcome, {userName}</h1>
                    <p className="text-muted-foreground">Your hub for collaboration and impact within the TGN.</p>
                </div>
                <Card className="bg-primary/5 border-primary/20 shrink-0">
                    <CardContent className="p-3 px-4 flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Handshake className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Account Type</p>
                            <p className="font-semibold text-primary capitalize">{profile?.role?.replace('-', ' ') || 'Partner'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Network Reach</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">N/A</p>
                        <p className="text-xs text-muted-foreground">Data not available.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">N/A</p>
                        <p className="text-xs text-muted-foreground">Data not available.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fundraisers Supported</CardTitle>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">N/A</p>
                        <p className="text-xs text-muted-foreground">Data not available.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Collaboration Opportunities</CardTitle>
                        <CardDescription>Find ways to contribute your expertise.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center text-muted-foreground p-8">
                            <Handshake className="h-10 w-10 mx-auto mb-2 text-primary" />
                            <p>Opportunities for collaboration will be listed here.</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Impact & Reports</CardTitle>
                        <CardDescription>See the difference your support is making.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center text-muted-foreground p-8">
                            <BarChart3 className="h-10 w-10 mx-auto mb-2 text-primary" />
                            <p>Detailed analytics and impact reports are coming soon.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Share Our Story</CardTitle>
                    <CardDescription>Access media kits and resources to help spread the word.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="text-center text-muted-foreground p-8">
                        <Megaphone className="h-10 w-10 mx-auto mb-2 text-primary" />
                        <p className="mb-4">Media assets will be available here soon.</p>
                        <Button variant="outline">Browse Resources</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
