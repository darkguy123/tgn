'use client';

import { useState } from 'react';
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
import { User, Bell, Globe, Palette, CreditCard, Mail, Phone, MapPin, Camera, Save } from "lucide-react";
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import type { TGNMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import placeholderImages from '@/lib/placeholder-images.json';
import { countries } from '@/lib/data';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileSettingsSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email(),
  phone: z.string().optional(),
  purpose: z.string().min(10, 'Bio must be at least 10 characters.'),
  locationCountry: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  imageId: z.string().url("Please enter a valid image URL.").optional().or(z.literal('')),
});

type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;

const timezones = [
    { value: 'Africa/Lagos', label: 'Africa/Lagos (GMT+1)' },
    { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (GMT+5:30)' },
];

const getImage = (imageId?: string) => {
  if (!imageId) return null;
  // If imageId is a full URL, return it directly
  if (imageId.startsWith('http')) {
    return { imageUrl: imageId };
  }
  // Otherwise, find it in the placeholder data
  const image = placeholderImages.placeholderImages.find((p) => p.id === imageId);
  if (!image) {
      if (imageId?.includes('female')) {
          return placeholderImages.placeholderImages.find(p => p.id === 'default-female-avatar');
      }
      return placeholderImages.placeholderImages.find(p => p.id === 'default-male-avatar');
  }
  return image;
};


const SettingsPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { profile, isLoading } = useMemberProfile();

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    sessionReminders: true,
    communityActivity: false,
    marketingEmails: false,
    pushNotifications: true,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(profileSettingsSchema),
    values: {
        name: profile?.name || '',
        email: profile?.email || '',
        purpose: profile?.purpose || '',
        locationCountry: profile?.locationCountry || '',
        phone: profile?.phone || '',
        timezone: profile?.timezone || '',
        imageId: profile?.imageId || '',
    },
    resetOptions: {
        keepDirtyValues: true,
    }
  });

  const handleSave = async (data: ProfileSettingsFormData) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update your profile. Please try again.',
      });
    }
  };
  
  const watchedImageId = watch('imageId');
  const currentAvatar = getImage(watchedImageId || profile?.imageId || 'default-male-avatar');

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
          <TabsTrigger value="notifications"><Bell className="mr-2"/>Notifications</TabsTrigger>
          <TabsTrigger value="preferences"><Palette className="mr-2"/>Preferences</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="mr-2"/>Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
            <form onSubmit={handleSubmit(handleSave)}>
                <div className="grid lg:grid-cols-3 gap-6">
                    <Card>
                    <CardHeader>
                        <CardTitle>Profile Photo</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32">
                           <AvatarImage src={currentAvatar?.imageUrl} alt={profile.name} />
                           <AvatarFallback className="text-4xl">
                                {profile.name ? profile.name.charAt(0) : profile.email.charAt(0)}
                           </AvatarFallback>
                        </Avatar>
                        <div className="w-full space-y-2">
                             <Label htmlFor="imageId">Profile Photo URL</Label>
                             <Input id="imageId" {...register('imageId')} placeholder="https://example.com/photo.jpg"/>
                             {errors.imageId && <p className="text-sm text-destructive">{errors.imageId.message}</p>}
                        </div>
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

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailUpdates', label: 'Email Updates', desc: 'Receive important account updates via email' },
                { key: 'sessionReminders', label: 'Session Reminders', desc: 'Get reminded about upcoming mentorship sessions' },
                { key: 'communityActivity', label: 'Community Activity', desc: 'Notifications for likes, comments, and mentions' },
                { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive news about new programs and features' },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser notifications for real-time updates' },
              ].map((item) => (
                <div 
                  key={item.key}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, [item.key]: checked })
                    }
                  />
                </div>
              ))}
              <Button variant="accent" className="mt-4">
                <Save className="h-4 w-4 mr-2" /> Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Theme</Label>
                  <div className="flex gap-2">
                    {['Light', 'Dark', 'System'].map((theme) => (
                      <Button
                        key={theme}
                        variant={theme === 'Light' ? 'accent' : 'outline'}
                        size="sm"
                      >
                        {theme}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Language</Label>
                   <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="English" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Profile Visibility</p>
                    <p className="text-sm text-muted-foreground">Who can see your profile</p>
                  </div>
                  <Select defaultValue="members">
                    <SelectTrigger className="w-auto">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="members">Members Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Show Online Status</p>
                    <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg mb-4">
                  <p className="text-lg font-bold text-foreground">Pro Member</p>
                  <p className="text-sm text-muted-foreground">$29/month • Renews Jan 15, 2026</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ Unlimited program access</p>
                  <p>✓ Priority mentor matching</p>
                  <p>✓ Certification eligible</p>
                  <p>✓ Community features</p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-14 bg-muted rounded flex items-center justify-center text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/26</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">Default</span>
                </div>
                <Button variant="outline" className="w-full">
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default SettingsPage;
