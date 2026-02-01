'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, TrendingUp, Users, Globe, Award, Star,
  DollarSign, Heart, Loader2, BookOpen
} from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { subDays } from 'date-fns';
import type { TGNMember, Cause, AffiliateReferral, Commission, EnrolledProgram } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemberProfile } from '@/hooks/useMemberProfile';

const ImpactPage = () => {
  const firestore = useFirestore();
  const { profile, isLoading: isProfileLoading } = useMemberProfile();

  // --- QUERIES ---
  const thirtyDaysAgoTimestamp = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    return Timestamp.fromDate(thirtyDaysAgo);
  }, []);

  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const newUsersQuery = useMemoFirebase(() => query(collection(firestore, 'users'), where('createdAt', '>=', thirtyDaysAgoTimestamp)), [firestore, thirtyDaysAgoTimestamp]);
  const fundraisersQuery = useMemoFirebase(() => query(collection(firestore, 'causes'), where('status', '==', 'approved')), [firestore]);

  // Personal Impact Queries
  const referralsQuery = useMemoFirebase(
    () => profile ? query(collection(firestore, 'affiliate_referrals'), where('referrerMemberId', '==', profile.id)) : null,
    [firestore, profile]
  );
  const commissionsQuery = useMemoFirebase(
    () => profile ? query(collection(firestore, 'commissions'), where('referrerId', '==', profile.id)) : null,
    [firestore, profile]
  );
  const enrollmentsQuery = useMemoFirebase(
    () => profile ? collection(firestore, 'users', profile.id, 'enrolled_programs') : null,
    [firestore, profile]
  );
  
  // --- DATA FETCHING ---
  const { data: allUsers, isLoading: usersLoading } = useCollection<TGNMember>(usersQuery);
  const { data: newUsers, isLoading: newUsersLoading } = useCollection<TGNMember>(newUsersQuery);
  const { data: fundraisers, isLoading: fundraisersLoading } = useCollection<Cause>(fundraisersQuery);

  const { data: downline, isLoading: isDownlineLoading } = useCollection<AffiliateReferral>(referralsQuery);
  const { data: commissions, isLoading: isCommissionsLoading } = useCollection<Commission>(commissionsQuery);
  const { data: enrollments, isLoading: isEnrollmentsLoading } = useCollection<EnrolledProgram>(enrollmentsQuery);

  const isLoading = usersLoading || newUsersLoading || fundraisersLoading || isProfileLoading || isDownlineLoading || isCommissionsLoading || isEnrollmentsLoading;
  
  // --- CALCULATIONS ---
  // Network stats
  const totalMembers = allUsers?.length || 0;
  const newMembersCount = newUsers?.length || 0;
  const totalRaised = fundraisers?.reduce((acc, fundraiser) => acc + fundraiser.currentAmount, 0) || 0;
  const fundedFundraisers = fundraisers?.filter(c => c.currentAmount >= c.goalAmount).length || 0;
  
  // Personal stats
  const referralsCount = downline?.length || 0;
  const totalCommission = commissions?.reduce((acc, c) => acc + c.commissionAmount, 0) || 0;
  const programsCompleted = enrollments?.filter(e => e.progress === 100).length || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  const renderStatCard = (title: string, value: string | number, icon: React.ReactNode, loading: boolean) => (
      <div className="p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">{icon} {title}</p>
          {loading ? <Skeleton className="h-7 w-20" /> : <p className="text-2xl font-bold text-foreground">{value}</p>}
      </div>
  );

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Impact Overview</h1>
        <p className="text-muted-foreground">Track our collective contribution and network growth.</p>
      </div>

      {/* Highlights */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mentor of the Month</p>
                <p className="text-xl font-bold text-foreground">To be announced</p>
                <p className="text-sm text-muted-foreground">Network-wide recognition</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mentee of the Month</p>
                <p className="text-xl font-bold text-foreground">To be announced</p>
                <p className="text-sm text-muted-foreground">Celebrating growth & achievement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Network Statistics
              </CardTitle>
              <CardDescription>An overview of our collective impact.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {renderStatCard("Total Members", totalMembers.toLocaleString(), <Users className="h-4 w-4" />, isLoading)}
            {renderStatCard("New Members (30d)", newMembersCount.toLocaleString(), <TrendingUp className="h-4 w-4" />, isLoading)}
            {renderStatCard("Total Raised", formatCurrency(totalRaised), <DollarSign className="h-4 w-4" />, isLoading)}
            {renderStatCard("Fundraisers Funded", fundedFundraisers, <Heart className="h-4 w-4" />, isLoading)}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Your Personal Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Your Personal Impact
            </CardTitle>
            <CardDescription>This data is specific to your activity.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Calculating your impact...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Users className="h-4 w-4"/>Referred</p>
                            <p className="text-2xl font-bold">{referralsCount}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><DollarSign className="h-4 w-4"/>Earned</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalCommission)}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><BookOpen className="h-4 w-4"/>Completed</p>
                            <p className="text-2xl font-bold">{programsCompleted}</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center pt-2">Your activity contributes to the growth of the TGN community.</p>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Network Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Network Performance
            </CardTitle>
             <CardDescription>Insights into the network's health.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center text-center py-10">
                <TrendingUp className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Network performance data is not yet available.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ImpactPage;
