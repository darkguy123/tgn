'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Award,
  CheckCircle,
  Clock,
  BookOpen,
  Activity,
  Star,
  FileText,
  Download,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMentorCertification } from '@/hooks/useMentorCertification';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const CERTIFICATIONS = [
  {
    name: 'TGN Certified Mentor',
    status: 'in_progress', // This will be dynamic
    progress: 20, // This will be dynamic
    earned: null,
    description: 'Foundation certification for aspiring mentors',
  },
  {
    name: 'Associate Mentor',
    status: 'eligible',
    progress: 0,
    earned: null,
    description: 'Verification for experienced mentors',
  },
  {
    name: 'Executive Mentor',
    status: 'locked',
    progress: 0,
    earned: null,
    description: 'Elite certification for senior mentors',
  },
  {
    name: 'Leadership Fundamentals',
    status: 'completed',
    progress: 100,
    earned: 'Dec 15, 2025',
    description: 'Core leadership skills certification',
  },
];


const CertificationPage = () => {
  const { certification, isLoading, error } = useMentorCertification();

  const defaultProgress = {
    paidProgramsCompleted: 0,
    accountAgeInMonths: 0,
    menteeBadgeLevel: 0,
    curriculumCompleted: false,
    evaluationPassed: false,
  };

  const currentProgress = certification || defaultProgress;

  const certificationChecklist = useMemo(() => [
    {
      id: 1,
      label: 'Complete 3 paid programs',
      current: currentProgress.paidProgramsCompleted,
      target: 3,
      completed: currentProgress.paidProgramsCompleted >= 3,
    },
    {
      id: 2,
      label: 'Be active for 3+ months',
      current: currentProgress.accountAgeInMonths,
      target: 3,
      unit: 'months',
      completed: currentProgress.accountAgeInMonths >= 3,
    },
    {
      id: 3,
      label: 'Achieve 7-Star Mentee Badge',
      current: currentProgress.menteeBadgeLevel,
      target: 7,
      completed: currentProgress.menteeBadgeLevel >= 7,
    },
    {
      id: 4,
      label: 'Complete certification curriculum',
      current: currentProgress.curriculumCompleted ? 1 : 0,
      target: 1,
      completed: currentProgress.curriculumCompleted,
    },
    { id: 5, label: 'Pass TGN evaluation', current: currentProgress.evaluationPassed ? 1 : 0, target: 1, completed: currentProgress.evaluationPassed },
  ], [currentProgress]);

  const overallProgress = useMemo(() => {
    if(isLoading) return 0;
    const completedCount = certificationChecklist.filter(item => item.completed).length;
    return Math.round((completedCount / certificationChecklist.length) * 100);
  }, [certificationChecklist, isLoading]);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-20" />
              </div>
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </CardContent>
        </Card>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
             <CardHeader>
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
               {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
               ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">Failed to load certification progress.</div>
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Certification Progress
        </h1>
        <p className="text-muted-foreground">
          Track your journey to becoming a certified mentor.
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="mb-6 bg-primary text-primary-foreground border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-foreground/80">Overall Progress</p>
              <p className="text-4xl font-bold">{overallProgress}%</p>
            </div>
            <Award className="h-16 w-16 text-accent" />
          </div>
          <div className="h-3 bg-primary-foreground/20 rounded-full">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="text-blue-500" />
                Mentor Verification (KYC)
            </CardTitle>
            <CardDescription>
                Become a verified mentor to gain trust and unlock exclusive benefits.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
                Our verification process ensures the safety and quality of our mentorship network. Submit your documents to get your profile badge.
            </p>
            <Button asChild>
                <Link href="/kyc">
                    Start Verification <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
            </Button>
        </CardContent>
    </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Certification Checklist</CardTitle>
            <CardDescription>
              Complete all requirements to earn your certification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {certificationChecklist.map(item => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg border',
                  item.completed
                    ? 'bg-accent/10 border-accent/30'
                    : 'bg-muted/50 border-border'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center',
                      item.completed ? 'bg-accent text-white' : 'bg-muted'
                    )}
                  >
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'font-medium',
                      item.completed ? 'text-accent' : 'text-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-sm font-medium',
                    item.completed ? 'text-accent' : 'text-muted-foreground'
                  )}
                >
                  {item.current}/{item.target} {item.unit || ''}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Certifications List */}
        <Card>
          <CardHeader>
            <CardTitle>My Certifications</CardTitle>
            <CardDescription>
              View and download your certificates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {CERTIFICATIONS.map((cert, i) => {
              const isTgnCert = cert.name === 'TGN Certified Mentor';
              const certStatus = isTgnCert ? (certification?.isCertified ? 'completed' : 'in_progress') : cert.status;
              const certProgress = isTgnCert ? overallProgress : cert.progress;
              const earnedDate = isTgnCert ? certification?.certificationDate : cert.earned;

              return (
              <div key={i} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center',
                        certStatus === 'completed' && 'bg-accent/20',
                        certStatus === 'in_progress' && 'bg-primary/20',
                        certStatus === 'eligible' && 'bg-muted',
                        certStatus === 'locked' && 'bg-muted'
                      )}
                    >
                      {certStatus === 'completed' && (
                        <Award className="h-5 w-5 text-accent" />
                      )}
                      {certStatus === 'in_progress' && (
                        <Activity className="h-5 w-5 text-primary" />
                      )}
                      {certStatus === 'eligible' && (
                        <Star className="h-5 w-5 text-muted-foreground" />
                      )}
                      {certStatus === 'locked' && (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {cert.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cert.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      certStatus === 'completed' &&
                        'bg-accent/20 text-accent',
                      certStatus === 'in_progress' &&
                        'bg-primary/20 text-primary',
                      certStatus === 'eligible' &&
                        'bg-muted text-muted-foreground',
                      certStatus === 'locked' &&
                        'bg-muted text-muted-foreground'
                    )}
                  >
                    {certStatus === 'in_progress' && 'In Progress'}
                    {certStatus === 'completed' && 'Completed'}
                    {certStatus === 'eligible' && 'Eligible'}
                    {certStatus === 'locked' && 'Locked'}
                  </span>
                </div>

                {certStatus === 'in_progress' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary font-medium">
                        {certProgress}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${certProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {certStatus === 'completed' && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Earned: {earnedDate ? new Date(earnedDate).toLocaleDateString() : 'N/A'}
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                )}

                {certStatus === 'eligible' && (
                  <div className="mt-3">
                    <Button variant="accent" size="sm" className="w-full">
                      Start Certification{' '}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )})}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{currentProgress.paidProgramsCompleted}/3</p>
            <p className="text-sm text-muted-foreground">Paid programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{currentProgress.accountAgeInMonths} months</p>
            <p className="text-sm text-muted-foreground">Activity duration</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">★ {currentProgress.menteeBadgeLevel}</p>
            <p className="text-sm text-muted-foreground">Badge level</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{currentProgress.evaluationPassed ? 'Passed' : 'Pending'}</p>
            <p className="text-sm text-muted-foreground">TGN Evaluation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificationPage;

    