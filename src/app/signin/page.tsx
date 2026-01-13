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
} from 'firebase/auth';
import { Chrome } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import Link from 'next/link';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleSocialLogin = async (providerName: 'google') => {
    setError(null);
    let provider;
    if (providerName === 'google') {
      provider = new GoogleAuthProvider();
    } else {
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

  const XIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 7.184L18.901 1.153zm-1.653 19.57h2.608L5.401 2.542H2.639l14.609 18.181z"></path>
    </svg>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0C0A15] p-4 font-body" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)' , backgroundSize: '20px 20px'}}>
        <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">
            
            <div className="p-8 md:p-12">
                <h1 className="text-3xl font-bold text-gray-900">{isSignUp ? 'Create an account' : 'Log in'}</h1>
                <p className="mt-2 text-gray-600">{isSignUp ? "Let's get started with 30-days free trial" : 'Welcome back! Please enter your details.'}</p>
                
                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button variant="outline" className="h-12 border-gray-300" onClick={() => handleSocialLogin('google')}>
                        <Chrome className="mr-2 h-5 w-5" />
                        Sign {isSignUp ? 'up' : 'in'} with Google
                    </Button>
                    <Button variant="outline" className="h-12 border-gray-300 bg-black text-white hover:bg-black/80 hover:text-white">
                        <XIcon />
                        <span className='ml-2'>Sign {isSignUp ? 'up' : 'in'} with X</span>
                    </Button>
                </div>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {isSignUp && (
                        <div className="space-y-2">
                            <Label htmlFor="name">Name*</Label>
                            <Input id="name" type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} required className="h-12"/>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email*</Label>
                        <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="h-12"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password*</Label>
                        <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="h-12"/>
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" className="w-full h-12 bg-gray-900 text-white hover:bg-gray-700">
                        {isSignUp ? 'Sign up' : 'Log in'}
                    </Button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-indigo-600 hover:text-indigo-500">
                        {isSignUp ? 'Log in' : 'Sign up'}
                    </button>
                </p>

                {isSignUp && (
                    <p className="mt-4 text-center text-xs text-gray-500">
                        By creating an account, you agree to our <Link href="#" className="underline">terms of use</Link>.
                    </p>
                )}
            </div>

            <div className="relative hidden items-center justify-center bg-gray-900 md:flex">
                 <div className="absolute inset-0 bg-black/50"></div>
                {authImage && (
                    <Image
                        src={authImage.imageUrl}
                        alt={authImage.description}
                        layout='fill'
                        objectFit='cover'
                        data-ai-hint={authImage.imageHint}
                        className="opacity-50"
                    />
                )}
                <div className="relative z-10 max-w-sm p-8 text-white">
                    <h2 className="text-4xl font-bold">Effortless AI Solutions Tailored for Enterprises</h2>
                    <p className="mt-4 text-gray-300">
                        Transform the way your business operates with seamless AI integration—designed to automate workflows, accelerate decision-making, without the technical complexity.
                    </p>
                </div>
            </div>

        </div>
    </div>
  );
};

export default AuthPage;
