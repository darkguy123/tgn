'use client';
import { useMemo, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Users,
  Calendar,
  Wallet,
  Share2,
  Star,
  Bell,
  ChevronRight,
  Play,
  Clock,
  TrendingUp,
  GraduationCap,
  MessageSquare,
  Shield,
  Loader2,
  ShoppingBag,
  Briefcase,
  ExternalLink,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useMentorCertification } from '@/hooks/useMentorCertification';
import { Skeleton } from '@/components/ui/skeleton';
import { products, events, sectors } from '@/lib/data';
import placeholderImages from '@/lib/placeholder-images.json';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection } from 'firebase/firestore';
import type { TGNMember, Program, Product, Event, Sector } from '@/lib/types';
import { getRecommendations, RecommendationResult } from '@/app/actions';

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find(p => p.id === imageId);
};

const Dashboard = () => {
  const { user } = useUser();
  const { profile, isLoading: isProfileLoading } = useMemberProfile();
  const { certification, isLoading: isCertLoading } = useMentorCertification();
  const userName = user?.displayName?.split(' ')[0] || 'Member';
  const router = useRouter();
  const firestore = useFirestore();

  const programsCollectionRef = useMemoFirebase(
    () => collection(firestore, 'programs'),
    [firestore]
  );
  const usersCollectionRef = useMemoFirebase(
    () => collection(firestore, 'users'),
    [firestore]
  );

  const { data: allPrograms, isLoading: programsLoading } =
    useCollection<Program>(programsCollectionRef);
  const { data: allMembers, isLoading: membersLoading } =
    useCollection<TGNMember>(usersCollectionRef);

  const [recommendations, setRecommendations] = useState<
    RecommendationResult | { error: string } | null
  >(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  useEffect(() => {
    if (
      profile &&
      allPrograms &&
      allMembers &&
      !recommendations &&
      !isLoadingRecs
    ) {
      setIsLoadingRecs(true);
      // Using static data for products, events, and sectors for now
      getRecommendations(
        profile,
        allMembers,
        allPrograms,
        products,
        events,
        sectors
      )
        .then(setRecommendations)
        .finally(() => setIsLoadingRecs(false));
    }
  }, [profile, allPrograms, allMembers, recommendations, isLoadingRecs]);

  const defaultProgress = {
    paidProgramsCompleted: 0,
    accountAgeInMonths: 0,
    menteeBadgeLevel: 0,
    curriculumCompleted: false,
    evaluationPassed: false,
  };

  const currentProgress = certification || defaultProgress;

  const certificationChecklist = useMemo(
    () => [
      { completed: currentProgress.paidProgramsCompleted >= 3 },
      { completed: currentProgress.accountAgeInMonths >= 3 },
      { completed: currentProgress.menteeBadgeLevel >= 7 },
      { completed: currentProgress.curriculumCompleted },
      { completed: currentProgress.evaluationPassed },
    ],
    [currentProgress]
  );

  const overallProgress = useMemo(() => {
    if (isCertLoading) return 0;
    const completedCount = certificationChecklist.filter(
      item => item.completed
    ).length;
    return Math.round((completedCount / certificationChecklist.length) * 100);
  }, [certificationChecklist, isCertLoading]);

  const simplifiedChecklist = useMemo(
    () => [
      {
        label: 'Programs completed',
        value: `${currentProgress.paidProgramsCompleted}/3`,
        done: currentProgress.paidProgramsCompleted >= 3,
      },
      {
        label: 'Badge Level',
        value: `★ ${currentProgress.menteeBadgeLevel}/7`,
        done: currentProgress.menteeBadgeLevel >= 7,
      },
      {
        label: 'Evaluation Status',
        value: currentProgress.evaluationPassed ? 'Passed' : 'Pending',
        done: currentProgress.evaluationPassed,
      },
    ],
    [currentProgress]
  );

  const isLoading =
    isProfileLoading || isCertLoading || programsLoading || membersLoading;

  return (
    <div className="space-y-6">
      {/* Admin Panel (Conditional) */}
      {isProfileLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      ) : (
        profile?.role === 'country-manager' && (
          <Card className="bg-primary/5 border-primary/20">
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
              <Button variant="outline" onClick={() => router.push('/admin/products')}>
                Manage Products <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/causes')}>
                Manage Causes <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )
      )}

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Welcome, {userName}
        </h1>
        <p className="text-muted-foreground">Here's your journey at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-8 w-1/2 mb-1" />
              <Skeleton className="h-6 w-1/4" />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-primary to-blue-800 text-primary-foreground border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-foreground/80 text-sm">
                    Badge Level
                  </p>
                  <p className="text-2xl font-bold">
                    ★ {currentProgress.menteeBadgeLevel || 0}
                  </p>
                </div>
                <Star className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Courses</p>
                <p className="text-2xl font-bold text-foreground">4</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Mentors</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Wallet</p>
                <p className="text-2xl font-bold text-foreground">$250</p>
              </div>
              <Wallet className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">My Courses</CardTitle>
                <CardDescription>
                  View progress • Resume learning
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/marketplace')}
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'Leadership Fundamentals',
                    progress: 75,
                    mentor: 'Dr. Sarah Chen',
                  },
                  {
                    title: 'Business Strategy 101',
                    progress: 45,
                    mentor: 'Michael Okonkwo',
                  },
                ].map((course, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Play className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {course.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        with {course.mentor}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-accent">
                        {course.progress}%
                      </p>
                      <div className="w-16 h-1.5 bg-muted rounded-full mt-1">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                <CardDescription>View schedule • Join live</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('#')}
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    title: 'Weekly Mentor Check-in',
                    time: 'Today, 3:00 PM',
                    type: '1-on-1',
                  },
                  {
                    title: 'Cohort Workshop: Pitching',
                    time: 'Tomorrow, 10:00 AM',
                    type: 'Group',
                  },
                  {
                    title: 'Leadership Masterclass',
                    time: 'Jan 8, 2:00 PM',
                    type: 'Webinar',
                  },
                ].map((session, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {session.title}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {session.time}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                      {session.type}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Community Feed</CardTitle>
                <CardDescription>
                  Posts • Updates • Celebrations
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/community')}
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-center text-muted-foreground p-4">
                <p>View the latest community posts.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recommended for You</CardTitle>
              <CardDescription>
                AI-powered matches to accelerate your growth.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingRecs && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">
                    Generating recommendations...
                  </p>
                </div>
              )}
              {recommendations && 'error' in recommendations && (
                <p className="text-destructive text-sm">
                  {recommendations.error}
                </p>
              )}
              {recommendations &&
                'recommendations' in recommendations &&
                recommendations.recommendations.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      let path = '#';
                      if (item.recommendedType === 'Mentor')
                        path = `/profile/${item.id}`;
                      if (item.recommendedType === 'Program')
                        path = `/programs`;
                      if (item.recommendedType === 'Product')
                        path = `/marketplace`;
                      if (item.recommendedType === 'Event')
                        path = `/community`;
                      if (item.recommendedType === 'Sector')
                        path = `/directory`;
                      router.push(path);
                    }}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {item.recommendedType === 'Mentor' && (
                        <Users className="h-5 w-5 text-primary" />
                      )}
                      {item.recommendedType === 'Program' && (
                        <GraduationCap className="h-5 w-5 text-primary" />
                      )}
                      {item.recommendedType === 'Product' && (
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      )}
                      {item.recommendedType === 'Event' && (
                        <Calendar className="h-5 w-5 text-primary" />
                      )}
                      {item.recommendedType === 'Sector' && (
                        <Briefcase className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.recommendedType}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-accent">
                      {item.matchScore}%
                    </span>
                  </div>
                ))}
              {!recommendations && !isLoadingRecs && !isLoading && (
                <div className="text-sm text-center text-muted-foreground p-4">
                  <p>Your personalized recommendations will appear here.</p>
                </div>
              )}
              {(isLoading || isLoadingRecs) && !recommendations && (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {isLoading ? (
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-9 w-full mt-2" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Certification Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Overall Progress
                    </span>
                    <span className="font-medium text-foreground">
                      {overallProgress}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <div className="space-y-2 pt-2">
                    {simplifiedChecklist.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                        <span
                          className={cn(
                            'font-medium',
                            item.done ? 'text-accent' : 'text-foreground'
                          )}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => router.push('/certification')}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Referral Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-accent">$125</p>
                <p className="text-sm text-muted-foreground">Total earnings</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span>7-level referral preview</span>
              </div>
              <Button variant="outline" className="w-full">
                View Downline
              </Button>
            </CardContent>
          </Card>

          <Card className="border-accent/30 bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-accent" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-card rounded-lg border border-border">
                <p className="font-medium text-foreground text-sm">
                  🏆 Mentor of the Month
                </p>
                <p className="text-xs text-muted-foreground">
                  Dr. Amara Obi - Africa Region
                </p>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border">
                <p className="font-medium text-foreground text-sm">
                  🌟 Mentee of the Month
                </p>
                <p className="text-xs text-muted-foreground">
                  Carlos Rivera - LATAM Region
                </p>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border">
                <p className="font-medium text-foreground text-sm">
                  📅 Global Summit 2026
                </p>
                <p className="text-xs text-muted-foreground">
                  Registration opens Feb 1
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

    