'use client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { TGNMember } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { countries, continents } from '@/lib/data';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  purpose: z.string().min(10, 'Bio is required'),
  locationCountry: z.string().min(1, 'Country is required'),
  locationContinent: z.string().min(1, 'Continent is required'),
  locationRegion: z.string().optional(),
  imageId: z.string().min(1, 'Image ID is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: TGNMember;
  onSave: (data: ProfileFormData) => Promise<void>;
}

export function ProfileForm({ initialData, onSave }: ProfileFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: ProfileFormData) => {
    await onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
          <CardDescription>
            This information will be displayed on your public profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="purpose">Bio / Purpose</Label>
            <Textarea
              id="purpose"
              {...register('purpose')}
              className="min-h-24"
              placeholder="Tell us about yourself, your skills, and what you hope to achieve..."
            />
            {errors.purpose && (
              <p className="text-sm text-destructive">
                {errors.purpose.message}
              </p>
            )}
          </div>
          
           <div className="space-y-2">
            <Label>Continent</Label>
            <Controller
              name="locationContinent"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your continent" />
                  </SelectTrigger>
                  <SelectContent>
                    {continents.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Country</Label>
            <Controller
              name="locationCountry"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                     {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

           <div className="space-y-2">
            <Label htmlFor="locationRegion">Region / State</Label>
            <Input
              id="locationRegion"
              {...register('locationRegion')}
              placeholder="e.g., California"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageId">Profile Image ID</Label>
            <Input
              id="imageId"
              {...register('imageId')}
              placeholder="e.g., user-1"
            />
            <p className="text-xs text-muted-foreground">For this demo, please use an ID from `placeholder-images.json`</p>
             {errors.imageId && (
              <p className="text-sm text-destructive">{errors.imageId.message}</p>
            )}
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

    