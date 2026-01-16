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
import { Switch } from '@/components/ui/switch';
import type { Program } from '@/lib/types';
import { useRouter } from 'next/navigation';

const programSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description is required'),
  mentor: z.string().min(2, 'Mentor name is required'),
  type: z.enum(['Free', 'Paid', 'Executive']),
  format: z.enum(['Live', 'Pre-recorded', 'Self-paced', 'Hybrid']),
  price: z.preprocess(
    a => (a === '' ? undefined : parseFloat(String(a))),
    z.number().optional()
  ),
  duration: z.string().min(1, 'Duration is required'),
  enrolled: z.preprocess(
    a => (a === '' ? 0 : parseInt(String(a), 10)),
    z.number().default(0)
  ),
  rating: z.preprocess(
    a => (a === '' ? 0 : parseFloat(String(a))),
    z.number().min(0).max(5).default(0)
  ),
  certified: z.boolean().default(false),
  imageId: z.string().min(1, 'Image ID is required'),
  googleMeetUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
});

type ProgramFormData = z.infer<typeof programSchema>;

interface ProgramFormProps {
  initialData?: Program;
  onSave: (data: ProgramFormData) => Promise<void>;
}

export function ProgramForm({ initialData, onSave }: ProgramFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      ...initialData,
      price: initialData?.price ?? undefined,
      googleMeetUrl: initialData?.googleMeetUrl ?? '',
    },
  });

  const onSubmit = async (data: ProgramFormData) => {
    await onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
          <CardDescription>
            Fill in the information for the program.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mentor">Mentor</Label>
            <Input id="mentor" {...register('mentor')} />
            {errors.mentor && (
              <p className="text-sm text-destructive">{errors.mentor.message}</p>
            )}
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              className="min-h-24"
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select program type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Free">Free</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Controller
              name="format"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select program format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Live">Live</SelectItem>
                    <SelectItem value="Pre-recorded">Pre-recorded</SelectItem>
                    <SelectItem value="Self-paced">Self-paced</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register('price')}
              placeholder="e.g., 199.99 (leave blank for Free)"
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              {...register('duration')}
              placeholder="e.g., 8 weeks"
            />
             {errors.duration && (
              <p className="text-sm text-destructive">{errors.duration.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageId">Image ID</Label>
            <Input
              id="imageId"
              {...register('imageId')}
              placeholder="e.g., program-leadership"
            />
             {errors.imageId && (
              <p className="text-sm text-destructive">{errors.imageId.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="googleMeetUrl">Google Meet URL</Label>
            <Input
              id="googleMeetUrl"
              type="url"
              {...register('googleMeetUrl')}
              placeholder="https://meet.google.com/..."
            />
            {errors.googleMeetUrl && (
              <p className="text-sm text-destructive">{errors.googleMeetUrl.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-4">
             <Controller
              name="certified"
              control={control}
              render={({ field }) => (
                 <Switch
                    id="certified"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="certified">Offers Certification</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/programs')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Program'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

    