'use client';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Wallet } from '@/lib/types';

export function useWallet() {
  const { user } = useUser();
  const firestore = useFirestore();

  const walletDocRef = useMemoFirebase(() => {
    if (!user) return null;
    // Assuming the wallet document ID is the same as the user's UID
    return doc(firestore, 'wallets', user.uid);
  }, [user, firestore]);

  const { data: wallet, isLoading, error } = useDoc<Wallet>(walletDocRef);

  return { wallet, isLoading, error };
}
