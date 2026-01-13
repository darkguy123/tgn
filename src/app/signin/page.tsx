'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider, 
  OAuthProvider
} from 'firebase/auth';
import { Chrome, Facebook, Linkedin, Mail } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import Link from 'next/link';
import { Logo } from '@/components/icons';


const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/onboarding');
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
      // On success, the useEffect will trigger the redirect
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSocialLogin = async (providerName: 'google' | 'linkedin' | 'facebook') => {
    setError(null);
    let provider;
    if (providerName === 'google') {
      provider = new GoogleAuthProvider();
    } else if (providerName === 'facebook') {
      provider = new FacebookAuthProvider();
    } else if (providerName === 'linkedin') {
      provider = new OAuthProvider('linkedin.com');
    }
    else {
      setError('Unknown provider.');
      return;
    }
    
    try {
      await signInWithPopup(auth, provider);
      // On success, the useEffect will trigger the redirect
    } catch (error: any) {
      setError(error.message);
    }
  };

  const authImage = placeholderImages.placeholderImages.find(p => p.id === 'auth-image');

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0C0A15]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0C0A15] text-white font-body" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)' , backgroundSize: '20px 20px'}}>
      <main className="flex-1 flex items-center justify-center p-4 my-10">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 bg-transparent rounded-2xl overflow-hidden">
          {/* Left Side: Form */}
          <div className="p-8 md:p-12">
             <div className="flex justify-start mb-8">
                <Logo className="h-20 object-contain" />
            </div>

            <h1 className="text-3xl font-bold">
              {isSignUp ? "Create Account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isSignUp 
                ? "Join the global mentorship network" 
                : "Securely sign in to your account"}
            </p>

            {!showEmailForm ? (
              <div className='mt-8 space-y-4'>
                 <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={() => handleSocialLogin('google')}>
                  <Chrome className="h-5 w-5" />
                  <span>Continue with Google</span>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={() => handleSocialLogin('linkedin')}>
                  <Linkedin className="h-5 w-5" />
                  <span>Continue with LinkedIn</span>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={() => handleSocialLogin('facebook')}>
                  <Facebook className="h-5 w-5" />
                  <span>Continue with Facebook</span>
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#0C0A15] px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full justify-start gap-3 h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white" onClick={() => setShowEmailForm(true)}>
                  <Mail className="h-5 w-5" />
                  <span>Continue with Email</span>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 bg-white/5 border-white/10 focus:ring-primary text-base"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="h-12 bg-white/5 border-white/10 focus:ring-primary text-base"/>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setShowEmailForm(false)}>
                  Back to all options
                </Button>
              </form>
            )}

            <div className="pt-6 text-center text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-primary hover:underline">
                {isSignUp ? 'Sign in' : 'Create one'}
              </button>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-black/30 z-10"></div>
            {authImage && (
              <Image
                src={authImage.imageUrl}
                alt={authImage.description}
                layout='fill'
                objectFit='cover'
                data-ai-hint={authImage.imageHint}
                className="opacity-70"
              />
            )}
            <div className="relative z-20 flex flex-col justify-end h-full p-12">
              <h2 className="text-4xl font-bold">Effortless AI Solutions Tailored for Enterprises</h2>
              <p className="mt-4 text-gray-300">
                Transform the way your business operates with seamless AI integration—designed to automate workflows, accelerate decision-making, without the technical complexity.
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Transcend Global Network © All rights reserved</p>
      </footer>
    </div>
  );
};

export default AuthPage;