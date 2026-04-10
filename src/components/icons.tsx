'use client';
import Image from 'next/image';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

export function Logo({ className }: { className?: string }) {
  const firestore = useFirestore();
  // Safe fetch - wait for firestore to be initialized
  const { data: branding } = useDoc<{ logoUrl?: string }>(
    firestore ? doc(firestore, 'app_settings', 'branding') : null
  );

  return (
    <Image
      src={branding?.logoUrl || "/transcendlogo2.png"}
      alt="Transcend Global Network Logo"
      width={358}
      height={98}
      priority
      className={className}
    />
  );
}
