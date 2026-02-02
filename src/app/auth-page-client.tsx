'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReCAPTCHA from 'react-google-recaptcha';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser, initiateEmailSignUp, initiateEmailSignIn, initiateSocialSignIn } from '@/firebase';
import { Chrome, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { sendPasswordResetEmail } from 'firebase/auth';

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signUpSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
});


const AuthPageClient = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPassDialogOpen, setForgotPassDialogOpen] = useState(false);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);

  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('tgn_referrer_uid', ref);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/onboarding');
    }
  }, [user, isUserLoading, router]);
  
  const handleAuthError = (error: any) => {
    let title = 'Authentication Error';
    let description = 'An unexpected error occurred. Please try again later.';

    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        title = 'Invalid Credentials';
        description = 'The email or password you entered is incorrect. Please try again.';
        break;
      case 'auth/email-already-in-use':
        title = 'Account Exists';
        description = 'An account with this email address already exists. Please sign in instead.';
        setIsSignUp(false);
        break;
      case 'auth/weak-password':
        title = 'Weak Password';
        description = 'Your password must be at least 6 characters long.';
        break;
      default:
        // Keep the generic message for other errors
        break;
    }
    
    toast({
        variant: 'destructive',
        title: title,
        description: description,
    });
  }

  const handleEmailSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (isSignUp) {
      const token = await recaptchaRef.current?.executeAsync();
      if (!token) {
        toast({
          variant: "destructive",
          title: "CAPTCHA required",
          description: "Please complete the CAPTCHA to continue.",
        });
        return;
      }
      initiateEmailSignUp(auth, data.email, data.password, handleAuthError);
      recaptchaRef.current?.reset();

    } else {
      initiateEmailSignIn(auth, data.email, data.password, handleAuthError);
    }
  };

  const handleSocialLogin = (providerName: 'google') => {
    initiateSocialSignIn(auth, providerName, handleAuthError);
  };
  
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsSendingResetLink(true);
    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      toast({
        title: "Reset Link Sent",
        description: "Please check your email to reset your password.",
      });
      setForgotPassDialogOpen(false);
      setForgotPasswordEmail('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset link.",
      });
    } finally {
      setIsSendingResetLink(false);
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col font-body">
       <Image
          src="/signinpagebg.jpeg"
          alt="People collaborating in a modern office"
          fill={true}
          className="object-cover"
          data-ai-hint="collaboration office"
        />
        <div className="absolute inset-0 bg-black/50" />
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-card text-card-foreground">
          {/* Form */}
          <div className="p-8 md:p-12">
             <div className="flex justify-center mb-8">
                <Logo className="h-20 object-contain"/>
            </div>

            <h1 className="text-3xl font-bold text-foreground text-center">
              {isSignUp ? "Create Account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-muted-foreground text-center">
              {isSignUp 
                ? "Join the global mentorship network" 
                : "Securely sign in to your account"}
            </p>

            {!showEmailForm ? (
              <div className='mt-8 space-y-4'>
                 <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => handleSocialLogin('google')}>
                  <Chrome className="h-5 w-5" />
                  <span>Continue with Google</span>
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => setShowEmailForm(true)}>
                  <Mail className="h-5 w-5" />
                  <span>Continue with Email</span>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleEmailSubmit)} className="mt-8 space-y-4">
                <ReCAPTCHA
                    ref={recaptchaRef}
                    size="invisible"
                    sitekey="6LcJlF0sAAAAABAyv_Bma2qYK5qCLobDFGFRO_kL"
                />
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...register("email")} required className="h-12 text-base"/>
                   {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••"
                      {...register("password")}
                      required 
                      className="h-12 text-base pr-10"
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                   {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="remember-me" />
                        <Label htmlFor="remember-me" className="text-sm font-normal">Remember me</Label>
                    </div>
                     <Dialog open={isForgotPassDialogOpen} onOpenChange={setForgotPassDialogOpen}>
                        <DialogTrigger asChild>
                            <button type="button" className="text-sm text-primary hover:underline">
                                Forgot password?
                            </button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reset Your Password</DialogTitle>
                                <DialogDescription>
                                    Enter your email address and we'll send you a link to reset your password.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleForgotPassword}>
                                <div className="py-4">
                                    <Label htmlFor="forgot-email">Email Address</Label>
                                    <Input
                                        id="forgot-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={forgotPasswordEmail}
                                        onChange={e => setForgotPasswordEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setForgotPassDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSendingResetLink}>
                                        {isSendingResetLink && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Send Reset Link
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Button type="submit" className="w-full h-12">
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

        </div>
      </main>
      <footer className="relative z-10 py-6 text-center text-sm text-white">
        <p>Transcend Global Network © All rights reserved</p>
      </footer>
    </div>
  );
};

export default AuthPageClient;
