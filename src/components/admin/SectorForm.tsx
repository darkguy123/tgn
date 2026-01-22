'use client';
import { useForm } from 'react-hook-form';
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
import { Label } from '@/components/ui/label';
import type { Sector } from '@/lib/types';
import { useRouter } from 'next/navigation';

const sectorSchema = z.object({
  name: z.string().min(2, 'Sector name must be at least 2 characters'),
  description: z.string().optional(),
});

type SectorFormData = z.infer<typeof sectorSchema>;

interface SectorFormProps {
  initialData?: Sector;
  onSave: (data: SectorFormData) => Promise<void>;
}

export function SectorForm({ initialData, onSave }: SectorFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SectorFormData>({
    resolver: zodResolver(sectorSchema),
    defaultValues: initialData || { name: '', description: '' },
  });

  const onSubmit = async (data: SectorFormData) => {
    await onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Sector Details</CardTitle>
          <CardDescription>
            Fill in the information for the sector.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Sector Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              className="min-h-24"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/sectors')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Sector'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
