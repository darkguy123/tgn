'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Label } from '@/components/ui/label';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';

const productSchema = z.object({
  name: z.string().min(5, 'Product name must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.preprocess(
    a => parseFloat(String(a)),
    z.number().min(0, 'Price cannot be negative')
  ),
  type: z.enum(['Book', 'Course', 'Tool', 'Digital Asset']),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { profile } = useMemberProfile();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const onSubmit = (data: ProductFormData) => {
    if (!user || !profile || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a product.',
      });
      return;
    }
    
    if (!imageUrl) {
      toast({
        variant: 'destructive',
        title: 'Image Required',
        description: 'Please upload an image for your product.',
      });
      return;
    }

    const productsCollection = collection(firestore, 'products');
    const dataToSave = {
      ...data,
      imageUrl,
      sellerMemberId: user.uid,
      sellerName: profile.name || profile.email.split('@')[0],
      sellerAvatarUrl: profile.avatarUrl,
      approvalStatus: 'pending' as const,
      createdAt: serverTimestamp(),
    };
    
    addDoc(productsCollection, dataToSave)
      .then(() => {
        toast({
          title: 'Product Submitted!',
          description: 'Your product has been submitted for admin approval.',
        });
        router.push('/marketplace/my-products');
      })
      .catch((error) => {
        console.error('Failed to create product:', error);
        const permissionError = new FirestorePermissionError({
          path: productsCollection.path,
          operation: 'create',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create the product. Please try again.',
        });
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">List a New Product</h1>
          <p className="text-muted-foreground">
            Share your product with the global community.
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                        <CardDescription>
                        Your product will be reviewed by an admin before it goes live.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="e.g., The Ultimate Mentorship Guide"
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select product type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Book">Book</SelectItem>
                                        <SelectItem value="Course">Course</SelectItem>
                                        <SelectItem value="Tool">Tool</SelectItem>
                                        <SelectItem value="Digital Asset">Digital Asset</SelectItem>
                                    </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.type && (
                                <p className="text-sm text-destructive">{errors.type.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            className="min-h-32"
                            placeholder="Describe your product, what it does, and who it's for."
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">
                            {errors.description.message}
                            </p>
                        )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price (USD)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                {...register('price')}
                                placeholder="e.g., 29.99"
                            />
                            {errors.price && (
                                <p className="text-sm text-destructive">
                                {errors.price.message}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Product Image</CardTitle>
                        <CardDescription>Add a clear image of your product.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FileUpload value={imageUrl} onUploadComplete={setImageUrl} />
                    </CardContent>
                </Card>
            </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/marketplace')}
            >
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
        </div>
      </form>
    </div>
  );
}
