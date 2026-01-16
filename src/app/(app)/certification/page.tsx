'use client';

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
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CERTIFICATION_CHECKLIST = [
  {
    id: 1,
    label: 'Complete 3 paid programs',
    current: 1,
    target: 3,
    completed: false,
  },
  {
    id: 2,
    label: 'Be active for 3+ months',
    current: 1.5,
    target: 3,
    unit: 'months',
    completed: false,
  },
  {
    id: 3,
    label: 'Achieve 7-Star Mentee Badge',
    current: 4,
    target: 7,
    completed: false,
  },
  {
    id: 4,
    label: 'Complete certification curriculum',
    current: 1,
    target: 1,
    completed: true,
  },
  { id: 5, label: 'Pass TGN evaluation', current: 0, target: 1, completed: false },
];

const CERTIFICATIONS = [
  {
    name: 'TGN Certified Mentor',
    status: 'in_progress',
    progress: 20,
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
  const overallProgress = Math.round(
    (CERTIFICATION_CHECKLIST.filter(item => item.completed).length /
      CERTIFICATION_CHECKLIST.length) *
      100
  );

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
            {CERTIFICATION_CHECKLIST.map(item => (
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
            {CERTIFICATIONS.map((cert, i) => (
              <div key={i} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center',
                        cert.status === 'completed' && 'bg-accent/20',
                        cert.status === 'in_progress' && 'bg-primary/20',
                        cert.status === 'eligible' && 'bg-muted',
                        cert.status === 'locked' && 'bg-muted'
                      )}
                    >
                      {cert.status === 'completed' && (
                        <Award className="h-5 w-5 text-accent" />
                      )}
                      {cert.status === 'in_progress' && (
                        <Activity className="h-5 w-5 text-primary" />
                      )}
                      {cert.status === 'eligible' && (
                        <Star className="h-5 w-5 text-muted-foreground" />
                      )}
                      {cert.status === 'locked' && (
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
                      cert.status === 'completed' &&
                        'bg-accent/20 text-accent',
                      cert.status === 'in_progress' &&
                        'bg-primary/20 text-primary',
                      cert.status === 'eligible' &&
                        'bg-muted text-muted-foreground',
                      cert.status === 'locked' &&
                        'bg-muted text-muted-foreground'
                    )}
                  >
                    {cert.status === 'in_progress' && 'In Progress'}
                    {cert.status === 'completed' && 'Completed'}
                    {cert.status === 'eligible' && 'Eligible'}
                    {cert.status === 'locked' && 'Locked'}
                  </span>
                </div>

                {cert.status === 'in_progress' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary font-medium">
                        {cert.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${cert.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {cert.status === 'completed' && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Earned: {cert.earned}
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                )}

                {cert.status === 'eligible' && (
                  <div className="mt-3">
                    <Button variant="accent" size="sm" className="w-full">
                      Start Certification{' '}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">1/3</p>
            <p className="text-sm text-muted-foreground">Paid programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">1.5 months</p>
            <p className="text-sm text-muted-foreground">Activity duration</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">★ 4</p>
            <p className="text-sm text-muted-foreground">Badge level</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">Pending</p>
            <p className="text-sm text-muted-foreground">TGN Evaluation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificationPage;
