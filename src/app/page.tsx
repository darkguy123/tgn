import { Suspense } from 'react';
import AuthPageClient from './auth-page-client';
import { Skeleton } from '@/components/ui/skeleton';

// A simple loading component for the Suspense fallback
function AuthPageLoading() {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    )
}

export default function Page() {
  return (
    <Suspense fallback={<AuthPageLoading />}>
      <AuthPageClient />
    </Suspense>
  );
}
