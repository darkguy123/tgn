'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Globe, Palette, CreditCard, Save } from "lucide-react";
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { countries } from '@/lib/data';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';

const profileSettingsSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email(),
  phone: z.string().optional(),
  purpose: z.string().min(10, 'Bio must be at least 10 characters.'),
  locationCountry: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
});

type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;

const timezones = [
    { value: 'Africa/Lagos', label: 'Africa/Lagos (GMT+1)' },
    { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (GMT+5:30)' },
];

const SettingsPage = () => {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { profile, isLoading } = useMemberProfile();
  
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(profileSettingsSchema),
  });
  
  useEffect(() => {
    if (profile) {
        reset({
            name: profile.name || '',
            email: profile.email || '',
            purpose: profile.purpose || '',
            locationCountry: profile.locationCountry || '',
            phone: profile.phone || '',
            timezone: profile.timezone || '',
        });
        setAvatarUrl(profile.avatarUrl || '');
    }
  }, [profile, reset]);


  const handleSave = (data: ProfileSettingsFormData) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    const userDocRef = doc(firestore, 'users', user.uid);
    const dataToSave = {
      ...data,
      avatarUrl: avatarUrl,
      updatedAt: serverTimestamp(),
    };
    
    updateDoc(userDocRef, dataToSave)
        .then(() => {
            toast({
                title: 'Profile Updated',
                description: 'Your profile has been successfully updated.',
            });
        })
        .catch((error) => {
            console.error('Failed to update profile:', error);
            const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: dataToSave
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update your profile. Please try again.',
            });
        });
  };
  
  if (isLoading || !profile) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
            <Skeleton className="h-10 w-96" />
            <div className="grid lg:grid-cols-3 gap-6">
                 <Skeleton className="h-64 w-full" />
                 <Skeleton className="h-96 w-full lg:col-span-2" />
            </div>
        </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex-wrap h-auto justify-start">
          <TabsTrigger value="profile"><User className="mr-2"/>Profile</TabsTrigger>
          <TabsTrigger value="notifications" disabled><Bell className="mr-2"/>Notifications</TabsTrigger>
          <TabsTrigger value="preferences" disabled><Palette className="mr-2"/>Preferences</TabsTrigger>
          <TabsTrigger value="billing" disabled><CreditCard className="mr-2"/>Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
            <form onSubmit={handleSubmit(handleSave)}>
                <div className="grid lg:grid-cols-3 gap-6">
                    <Card>
                    <CardHeader>
                        <CardTitle>Profile Photo</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <FileUpload 
                            value={avatarUrl}
                            onUploadComplete={setAvatarUrl}
                            label="Upload Profile Photo"
                        />
                    </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" {...register('name')} />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register('email')} readOnly className="bg-muted/50 cursor-not-allowed"/>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" {...register('phone')} />
                            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="purpose">Bio</Label>
                            <Textarea id="purpose" {...register('purpose')} rows={3} />
                             {errors.purpose && <p className="text-sm text-destructive">{errors.purpose.message}</p>}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="locationCountry">Country</Label>
                                <Controller
                                name="locationCountry"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                )}
                                />
                                {errors.locationCountry && <p className="text-sm text-destructive">{errors.locationCountry.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Controller
                                name="timezone"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timezones.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                    </SelectContent>
                                    </Select>
                                )}
                                />
                                {errors.timezone && <p className="text-sm text-destructive">{errors.timezone.message}</p>}
                            </div>
                        </div>

                        <Button type="submit" variant="accent" className="mt-4" disabled={isSubmitting}>
                        <Save className="h-4 w-4 mr-2" /> {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </CardContent>
                    </Card>
                </div>
            </form>
        </TabsContent>
        {/* Other tabs content can be added here */}
      </Tabs>
    </>
  );
};

export default SettingsPage;
