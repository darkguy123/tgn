'use client';
import { useRouter, useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductForm, type ProductFormData } from '@/components/marketplace/ProductForm';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { productId } = params;
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();

  const productRef = useMemoFirebase(
    () => (firestore && productId ? doc(firestore, 'products', productId as string) : null),
    [firestore, productId]
  );
  
  const { data: product, isLoading, error } = useDoc<Product>(productRef);

  const handleSave = async (data: ProductFormData, imageUrl: string) => {
    if (!productRef) return;

    const dataToUpdate = {
      ...data,
      imageUrl,
      // When re-submitting, it should go back to pending
      approvalStatus: 'pending' as const,
    };
    
    updateDoc(productRef, dataToUpdate)
      .then(() => {
        toast({
          title: 'Product Updated',
          description: `${data.name} has been re-submitted for approval.`,
        });
        router.push('/marketplace/my-products');
      })
      .catch((serverError) => {
        console.error('Failed to update product:', serverError);
        const permissionError = new FirestorePermissionError({
          path: productRef.path,
          operation: 'update',
          requestResourceData: dataToUpdate,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to update the product. Please try again.',
        });
      });
  };

  if (isLoading || !user) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <Skeleton className="h-10 w-10" />
                <div className='space-y-2'>
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
            </div>
            <div className="space-y-4 rounded-lg border p-6">
                 <Skeleton className="h-6 w-32" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-6 w-32" />
                 <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
  }

  if (error) {
    return <div className="text-destructive">Error loading product data.</div>;
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">Editing &quot;{product.name}&quot;</p>
        </div>
      </div>
      <ProductForm onSave={handleSave} initialData={product} isEditing userId={user.uid} />
    </div>
  );
}
