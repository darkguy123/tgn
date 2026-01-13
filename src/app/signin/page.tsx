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
  FacebookAuthProvider, // Added for Facebook
  OAuthProvider, // Generic OAuth provider for others like LinkedIn
} from 'firebase/auth';
import { Chrome, Linkedin, Facebook, Mail } from 'lucide-react';
import { Logo } from '@/components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      // A quick check to see if the user exists in Firestore might be needed here
      // before redirecting to /dashboard or /onboarding.
      // For now, we'll redirect to onboarding as the primary flow.
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

  const handleSocialLogin = async (providerName: 'google' | 'linkedin' | 'facebook') => {
    setError(null);
    let provider;
    switch (providerName) {
      case 'google':
        provider = new GoogleAuthProvider();
        break;
      case 'linkedin':
        // Note: LinkedIn requires custom parameters and whitelisting in Firebase Console
        provider = new OAuthProvider('linkedin.com');
        break;
      case 'facebook':
        provider = new FacebookAuthProvider();
        break;
      default:
        setError('Unknown provider.');
        return;
    }
    
    try {
      await signInWithPopup(auth, provider);
      router.push('/onboarding');
    } catch (error: any) {
      // Handle specific errors, like account-exists-with-different-credential
      setError(error.message);
    }
  };

  if (isUserLoading || user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo className="h-20 object-contain" />
          </div>
          
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-foreground">
                {isSignUp ? "Create Account" : "Welcome back"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isSignUp 
                  ? "Join the global mentorship network" 
                  : "Securely sign in to your account"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {!showEmailForm ? (
                <>
                  {/* Social Login Buttons */}
                  <Button 
                    variant="outline"
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => handleSocialLogin("google")}
                  >
                    <Chrome className="h-5 w-5 text-[#4285F4]" />
                    <span>Continue with Google</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => handleSocialLogin("linkedin")}
                  >
                    <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                    <span>Continue with LinkedIn</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => handleSocialLogin("facebook")}
                  >
                    <Facebook className="h-5 w-5 text-[#1877F2]" />
                    <span>Continue with Facebook</span>
                  </Button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => setShowEmailForm(true)}
                  >
                    <Mail className="h-5 w-5 text-primary" />
                    <span>Continue with Email</span>
                  </Button>
                </>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  
                  <Button type="submit" className="w-full h-12" size="lg">
                    {isSignUp ? "Create Account" : "Sign In"}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setShowEmailForm(false)}
                  >
                    Back to all options
                  </Button>
                </form>
              )}
              
              {/* Toggle Sign Up / Sign In */}
              <div className="pt-4 text-center text-sm text-muted-foreground">
                {isSignUp ? (
                  <>
                    Already have an account?{" "}
                    <button 
                      onClick={() => setIsSignUp(false)}
                      className="text-primary font-medium hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <button 
                      onClick={() => setIsSignUp(true)}
                      className="text-primary font-medium hover:underline"
                    >
                      Create one
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Transcend Global Network © All rights reserved</p>
      </footer>
    </div>
  );
};

export default AuthPage;
