'use client';

import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { isUserAdmin } from '@/lib/auth-utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isLoading: isProfileLoading } = useMemberProfile();
  const router = useRouter();

  const userIsAdmin = isUserAdmin(profile);

  useEffect(() => {
    if (!isProfileLoading && !userIsAdmin) {
      router.push('/dashboard');
    }
  }, [profile, isProfileLoading, router, userIsAdmin]);

  if (isProfileLoading || !profile || !userIsAdmin) {
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
