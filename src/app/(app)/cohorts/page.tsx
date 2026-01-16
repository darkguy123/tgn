'use client';
import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, GraduationCap, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import type { EnrolledProgram, Program } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';
import { Progress } from '@/components/ui/progress';

const getImage = (imageId?: string) => {
  if (!imageId) {
    return placeholderImages.placeholderImages.find(p => p.id === 'program-global-business');
  }
  return placeholderImages.placeholderImages.find(p => p.id === imageId);
};

const CohortsPage = () => {
  const { user } = useUser();
  const firestore = useFirestore();

  const enrolledProgramsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'enrolled_programs') : null),
    [user, firestore]
  );
  const { data: enrollments, isLoading: enrollmentsLoading } = useCollection<EnrolledProgram>(enrolledProgramsQuery);

  const programIds = useMemo(() => enrollments?.map(e => e.id) || [], [enrollments]);

  const programsQuery = useMemoFirebase(
    () =>
      programIds.length > 0
        ? query(collection(firestore, 'programs'), where(documentId(), 'in', programIds))
        : null,
    [programIds, firestore]
  );
  const { data: enrolledPrograms, isLoading: programsLoading } = useCollection<Program>(programsQuery);
  
  const isLoading = enrollmentsLoading || programsLoading;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Cohorts</h1>
        <p className="text-muted-foreground">Your enrolled programs and learning spaces.</p>
      </div>
      
      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><Skeleton className="h-80 w-full" /></Card>
          ))}
        </div>
      )}

      {!isLoading && enrolledPrograms?.length === 0 && (
        <Card className="flex flex-col items-center justify-center text-center py-20">
          <CardHeader>
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Book className="h-10 w-10 text-primary" />
            </div>
            <CardTitle>You are not enrolled in any cohorts yet</CardTitle>
            <CardDescription>When you enroll in a group program, your cohort details will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/programs">
                <GraduationCap className="mr-2 h-4 w-4" />
                Explore Programs
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledPrograms?.map(program => {
           const image = getImage(program.imageId);
           const enrollment = enrollments?.find(e => e.id === program.id);
           const progress = enrollment?.progress || 0;
           return (
            <Card key={program.id} className="flex flex-col hover:shadow-card transition-all duration-300 group">
                <CardHeader className="p-0 relative">
                    {image && (
                        <Image
                            src={image.imageUrl}
                            alt={program.title}
                            width={600}
                            height={400}
                            className="aspect-video w-full object-cover rounded-t-lg"
                            data-ai-hint={image.imageHint}
                        />
                    )}
                </CardHeader>
                <CardContent className="p-4 flex flex-col flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors leading-tight mb-2">
                        {program.title}
                    </CardTitle>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-4">with {program.mentor}</p>
                        <div className="space-y-2">
                            <Progress value={progress} />
                            <p className="text-xs text-muted-foreground">{progress}% complete</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <Button variant="accent" size="sm" className="w-full">
                        Continue Learning <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </CardFooter>
            </Card>
           )
        })}
      </div>
    </>
  );
};

export default CohortsPage;
