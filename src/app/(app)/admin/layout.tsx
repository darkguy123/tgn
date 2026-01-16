'use client';

import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isLoading: isProfileLoading } = useMemberProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isProfileLoading && profile?.role !== 'country-manager') {
      router.push('/dashboard');
    }
  }, [profile, isProfileLoading, router]);

  if (isProfileLoading || !profile || profile.role !== 'country-manager') {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
