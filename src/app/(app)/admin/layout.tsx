'use client';

import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { isUserAdmin } from '@/lib/auth-utils';
import { Loader2 } from 'lucide-react';

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
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div>
            <p className="text-lg font-semibold">Validating Admin Access</p>
            <p className="text-sm text-muted-foreground">Please wait a moment...</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
