'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Cause, TGNMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { HeartHandshake, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import placeholderImages from '@/lib/placeholder-images.json';

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find(p => p.id === imageId);
};

export default function CausesPage() {
  const firestore = useFirestore();
  const causesQuery = useMemoFirebase(
    () =>
      query(collection(firestore, 'causes'), where('status', '==', 'approved')),
    [firestore]
  );
  const { data: causes, isLoading, error } = useCollection<Cause>(causesQuery);
  
  const usersRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: allUsers, isLoading: usersLoading } = useCollection<TGNMember>(usersRef);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Causes</h1>
          <p className="text-muted-foreground">
            Support fundraising campaigns from our global community members.
          </p>
        </div>
        <Button asChild>
          <Link href="/community/causes/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create a Cause
          </Link>
        </Button>
      </header>

      {(isLoading || usersLoading) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-full mt-4" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-9 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-destructive">Failed to load causes.</p>
        </div>
      )}

      {!isLoading && !usersLoading && causes?.length === 0 && (
         <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <HeartHandshake className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Active Causes</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                There are no approved fundraising causes at the moment.
            </p>
            <Button className="mt-6" asChild>
                <Link href="/community/causes/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Be the first to create one!
                </Link>
            </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {causes?.map(cause => {
          const progress = (cause.currentAmount / cause.goalAmount) * 100;
          const creator = allUsers?.find(u => u.tgnMemberId === cause.creatorMemberId);
          const creatorImage = creator?.imageId ? getImage(creator.imageId) : null;
          
          return (
            <Card key={cause.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{cause.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={creatorImage?.imageUrl} />
                    <AvatarFallback>{cause.creatorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>by {cause.creatorName}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {cause.description}
                </p>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      Raised: {formatCurrency(cause.currentAmount)}
                    </span>
                    <span className="font-medium">
                      Goal: {formatCurrency(cause.goalAmount)}
                    </span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Donate Now</Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

    