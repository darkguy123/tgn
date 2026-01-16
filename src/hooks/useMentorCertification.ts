'use client';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { MentorCertification } from '@/lib/types';

export function useMentorCertification() {
  const { user } = useUser();
  const firestore = useFirestore();

  const certificationDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'mentor_certifications', user.uid);
  }, [user, firestore]);

  const { data: certification, isLoading, error } = useDoc<MentorCertification>(certificationDocRef);

  return { certification, isLoading, error };
}
