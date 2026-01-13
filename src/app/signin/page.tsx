'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { Chrome, Eye } from 'lucide-react';
import { Logo } from '@/components/icons';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import placeholderImages from "@/lib/placeholder-images.json";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const authImage = placeholderImages.placeholderImages.find(p => p.id === 'auth-image');

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/onboarding');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/onboarding');
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (isUserLoading || (!isUserLoading && user)) {
      return null;
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        {authImage && (
             <Image
                src={authImage.imageUrl}
                alt={authImage.description}
                fill
                className="absolute inset-0 object-cover"
                data-ai-hint={authImage.imageHint}
             />
        )}
        <div className="relative z-20">
          <Link href="/" className="flex items-center text-lg font-medium">
             A WISE QUOTE
          </Link>
        </div>
        <div className="relative z-20 mt-auto">
          <div className="space-y-2 text-4xl font-bold">
            <h1>Get</h1>
            <h1>Everything</h1>
            <h1>You Want</h1>
          </div>
          <p className="mt-4 text-lg">
            You can get everything you want if you work hard, trust the process, and stick to the plan.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-8">
            <div className="flex justify-start">
                <Logo className="h-6 w-auto" />
            </div>
          <div className="grid gap-2 text-left">
            <h1 className="text-3xl font-bold">
              {isSignUp ? 'Create an account' : 'Welcome Back'}
            </h1>
            <p className="text-balance text-muted-foreground">
              {isSignUp
                ? 'Enter your details below to create your account'
                : 'Enter your email and password to access your account'}
            </p>
          </div>
          <form onSubmit={handleEmailSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                        <Link
                            href="/forgot-password"
                            className="ml-auto inline-block text-sm underline"
                        >
                            Forgot Password
                        </Link>
                    )}
                </div>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Eye className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            {!isSignUp && (
                <div className="flex items-center space-x-2">
                    <Checkbox id="remember-me" />
                    <Label htmlFor="remember-me" className="font-normal">Remember me</Label>
                </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-black text-white hover:bg-black/90">
              {isSignUp ? 'Create account' : 'Sign In'}
            </Button>
            <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin}>
              <Chrome className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button onClick={() => setIsSignUp(false)} className="underline">
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button onClick={() => setIsSignUp(true)} className="underline">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
