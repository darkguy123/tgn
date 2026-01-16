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
import type { Event } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '../ui/calendar';

const eventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  description: z.string().min(10, 'Description is required'),
  location: z.string().min(2, 'Location is required'),
  type: z.enum(['Conference', 'Webinar', 'Workshop', 'Meetup']),
  price: z.preprocess(
    a => (a === '' ? undefined : parseFloat(String(a))),
    z.number().optional()
  ),
  startDate: z.date(),
  endDate: z.date(),
  imageUrl: z.string().optional(),
  googleMeetUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: Event;
  onSave: (data: EventFormData) => Promise<void>;
}

export function EventForm({ initialData, onSave }: EventFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      ...initialData,
      price: initialData?.price ?? undefined,
      googleMeetUrl: initialData?.googleMeetUrl ?? '',
      startDate: initialData?.startDate?.toDate ? initialData.startDate.toDate() : new Date(),
      endDate: initialData?.endDate?.toDate ? initialData.endDate.toDate() : new Date(),
    },
  });

  const onSubmit = async (data: EventFormData) => {
    await onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Fill in the information for the event.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register('location')} placeholder="e.g. Virtual or City, Country" />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
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
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Conference">Conference</SelectItem>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Meetup">Meetup</SelectItem>
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
              placeholder="e.g., 99.99 (leave blank for Free)"
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>
          
            <div className="space-y-2">
                 <Label>Start Date</Label>
                <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                    )}
                />
            </div>
            
            <div className="space-y-2">
                 <Label>End Date</Label>
                <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                         <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                    )}
                />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="imageUrl">Image ID</Label>
                <Input
                id="imageUrl"
                {...register('imageUrl')}
                placeholder="e.g., program-global-business"
                />
                {errors.imageUrl && (
                <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
                )}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="googleMeetUrl">Google Meet URL (for virtual events)</Label>
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

        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/events')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Event'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
