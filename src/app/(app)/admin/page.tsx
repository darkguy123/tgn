'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page just redirects to the main admin dashboard.
export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return null; // Render nothing while redirecting
}
