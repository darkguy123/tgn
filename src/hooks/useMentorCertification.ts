'use client';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { MentorCertification } from '@/lib/types';
import { useMemo } from 'react';

export function useMentorCertification() {
  const { user } = useUser();
  const firestore = useFirestore();

  const certificationQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'mentor_certifications'),
      where('memberId', '==', user.uid),
      limit(1)
    );
  }, [user, firestore]);

  const { data: certificationData, isLoading, error } = useCollection<MentorCertification>(certificationQuery);

  const certification = useMemo(() => (certificationData && certificationData.length > 0 ? certificationData[0] : null), [certificationData]);

  return { certification, isLoading, error };
}
