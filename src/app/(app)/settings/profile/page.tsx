'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, CreditCard, Save, Trash2, Plus, Star, MoreVertical, Loader2 } from "lucide-react";
import { useFirestore, useUser, errorEmitter, FirestorePermissionError, useCollection, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, collection, addDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { countries } from '@/lib/data';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import type { SavedCard } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

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

const cardSchema = z.object({
    cardNumber: z.string().min(16, "Invalid card number").max(16, "Invalid card number"),
    expiryMonth: z.string().min(2, "MM").max(2, "MM"),
    expiryYear: z.string().min(2, "YY").max(2, "YY"),
    cvc: z.string().min(3, "CVC").max(4, "CVC"),
    isDefault: z.boolean().default(false),
});

type CardFormData = z.infer<typeof cardSchema>;


const SettingsPage = () => {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { profile, isLoading } = useMemberProfile();
  
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');

  // State for notifications
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    sessionReminders: true,
    communityActivity: false,
    marketingEmails: false,
    pushNotifications: true,
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // State for billing
  const [isAddCardOpen, setAddCardOpen] = useState(false);

  // Fetch saved cards
  const cardsCollectionRef = useMemoFirebase(
    () => user ? collection(firestore, 'users', user.uid, 'cards') : null,
    [user, firestore]
  );
  const { data: savedCards, isLoading: cardsLoading } = useCollection<SavedCard>(cardsCollectionRef);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(profileSettingsSchema),
  });

  const {
    register: registerCard,
    handleSubmit: handleCardSubmit,
    formState: { errors: cardErrors, isSubmitting: isCardSubmitting },
    reset: resetCardForm
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
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
        if (profile.notificationPreferences) {
            setNotifications(profile.notificationPreferences);
        }
    }
  }, [profile, reset]);


  const handleSaveProfile = (data: ProfileSettingsFormData) => {
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

  const handleSaveNotifications = async () => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to save settings.' });
        return;
    }
    setIsSavingNotifications(true);
    const userDocRef = doc(firestore, 'users', user.uid);
    try {
        await updateDoc(userDocRef, { notificationPreferences: notifications, updatedAt: serverTimestamp() });
        toast({ title: 'Preferences Saved', description: 'Your notification settings have been updated.' });
    } catch (error) {
        console.error("Failed to save notification preferences: ", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: userDocRef.path, operation: 'update', requestResourceData: { notificationPreferences: notifications } }));
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save your preferences.' });
    } finally {
        setIsSavingNotifications(false);
    }
  };
  
  const handleAddCard = async (data: CardFormData) => {
    if (!user || !cardsCollectionRef) return;
    
    const newCard: Omit<SavedCard, 'id'> = {
        brand: 'Visa', // Placeholder
        last4: data.cardNumber.slice(-4),
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        isDefault: data.isDefault,
    };

    if (data.isDefault && savedCards) {
        // Unset other defaults
        const updates = savedCards.filter(c => c.isDefault).map(c => updateDoc(doc(firestore, 'users', user.uid, 'cards', c.id), { isDefault: false }));
        await Promise.all(updates);
    }
    
    await addDoc(cardsCollectionRef, newCard);
    toast({ title: "Card Added", description: "Your new payment method has been saved." });
    resetCardForm();
    setAddCardOpen(false);
  };
  
  const handleRemoveCard = async (cardId: string) => {
    if (!user) return;
    const cardDocRef = doc(firestore, 'users', user.uid, 'cards', cardId);
    try {
        await deleteDoc(cardDocRef);
        toast({ title: "Card Removed", description: "The payment method has been deleted." });
    } catch (error) {
        console.error("Failed to remove card: ", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: cardDocRef.path, operation: 'delete' }));
        toast({ variant: 'destructive', title: 'Error', description: 'Could not remove the card.' });
    }
  };


  if (isLoading || !profile || !user) {
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
          <TabsTrigger value="billing"><CreditCard className="mr-2"/>Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
            <form onSubmit={handleSubmit(handleSaveProfile)}>
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
                            userId={user.uid}
                            storagePath="public"
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
        
        <TabsContent value="notifications">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Notification Preferences</CardTitle>
                    <CardDescription>Choose how you want to be notified.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                        { key: 'emailUpdates', label: 'Email Updates', desc: 'Receive important account updates via email' },
                        { key: 'sessionReminders', label: 'Session Reminders', desc: 'Get reminded about upcoming mentorship sessions' },
                        { key: 'communityActivity', label: 'Community Activity', desc: 'Notifications for likes, comments, and mentions' },
                        { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive news about new programs and features' },
                        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser notifications for real-time updates' },
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <p className="font-medium text-foreground">{item.label}</p>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                            <Switch
                                checked={notifications[item.key as keyof typeof notifications]}
                                onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                            />
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <Button variant="accent" onClick={handleSaveNotifications} disabled={isSavingNotifications}>
                        {isSavingNotifications ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        {isSavingNotifications ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

        <TabsContent value="billing">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Payment Methods</CardTitle>
                        <CardDescription>Manage your saved cards for transactions.</CardDescription>
                    </div>
                    <Dialog open={isAddCardOpen} onOpenChange={setAddCardOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Add Card</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add a New Card</DialogTitle>
                                <DialogDescription>Your card information is stored securely.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCardSubmit(handleAddCard)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cardNumber">Card Number</Label>
                                    <Input id="cardNumber" placeholder="•••• •••• •••• ••••" {...registerCard("cardNumber")} />
                                    {cardErrors.cardNumber && <p className="text-sm text-destructive">{cardErrors.cardNumber.message}</p>}
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="expiryMonth">Expiry Date</Label>
                                        <div className="flex gap-2">
                                            <Input id="expiryMonth" placeholder="MM" {...registerCard("expiryMonth")} />
                                            <Input placeholder="YY" {...registerCard("expiryYear")} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <Input id="cvc" placeholder="123" {...registerCard("cvc")} />
                                    </div>
                                </div>
                                {cardErrors.expiryMonth && <p className="text-sm text-destructive">{cardErrors.expiryMonth.message}</p>}
                                {cardErrors.expiryYear && <p className="text-sm text-destructive">{cardErrors.expiryYear.message}</p>}
                                {cardErrors.cvc && <p className="text-sm text-destructive">{cardErrors.cvc.message}</p>}
                                 <div className="flex items-center space-x-2">
                                    <Controller
                                        name="isDefault"
                                        control={control}
                                        render={({ field }) => <Switch id="isDefault" checked={field.value} onCheckedChange={field.onChange} />}
                                    />
                                    <Label htmlFor="isDefault">Set as default payment method</Label>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={() => setAddCardOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isCardSubmitting}>{isCardSubmitting ? 'Saving...' : 'Save Card'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cardsLoading && <Skeleton className="h-20 w-full" />}
                    {!cardsLoading && savedCards?.map((card) => (
                        <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-14 bg-muted rounded flex items-center justify-center text-xs font-bold">{card.brand}</div>
                                <div>
                                    <p className="font-medium text-foreground">•••• {card.last4}</p>
                                    <p className="text-sm text-muted-foreground">Expires {card.expiryMonth}/{card.expiryYear}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {card.isDefault && <Badge variant="secondary"><Star className="h-3 w-3 mr-1" /> Default</Badge>}
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete this card. This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleRemoveCard(card.id)} className={cn(buttonVariants({ variant: "destructive" }))}>
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                    {!cardsLoading && (!savedCards || savedCards.length === 0) && (
                        <p className="text-center text-muted-foreground py-8">No saved cards found.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default SettingsPage;
