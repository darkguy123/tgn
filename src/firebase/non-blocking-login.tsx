'use client';
import {
  Auth, // Import Auth type for type hinting
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, onError: (error: any) => void): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance).catch(onError);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, onError: (error: any) => void): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password).catch(onError);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, onError: (error: any) => void): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password).catch(onError);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate social sign-in (non-blocking). */
export function initiateSocialSignIn(authInstance: Auth, providerName: 'google', onError: (error: any) => void): void {
  let provider;
  if (providerName === 'google') {
    provider = new GoogleAuthProvider();
  } else {
    // Potentially handle other providers here
    onError({code: 'auth/invalid-provider', message: 'Invalid social provider.'});
    return;
  }
  
  // CRITICAL: Call signInWithPopup directly. Do NOT use 'await signInWithPopup(...)'.
  signInWithPopup(authInstance, provider).catch(onError);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
