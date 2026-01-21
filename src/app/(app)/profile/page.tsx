'use client';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyProfilePage() {
  const { profile, isLoading } = useMemberProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && profile?.tgnMemberId) {
      router.replace(`/member/${profile.tgnMemberId}`);
    }
    // If there's an error or no profile after loading, redirect to dashboard as a fallback.
    if (!isLoading && !profile) {
        router.replace('/dashboard');
    }
  }, [profile, isLoading, router]);

  return (
    // Show a loading state while redirecting
    <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
      <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
          </div>
      </div>
    </div>
  );
}
