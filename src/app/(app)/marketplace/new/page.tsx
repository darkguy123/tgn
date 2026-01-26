'use client';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductForm, type ProductFormData } from '@/components/marketplace/ProductForm';

export default function NewProductPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { profile } = useMemberProfile();
  const { toast } = useToast();

  const handleSave = async (data: ProductFormData, imageUrl: string) => {
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
      sellerAvatarUrl: profile.avatarUrl || '',
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
        console.error('Failed to create product with code:', error.code, 'and message:', error.message, 'Full error:', error);
        const permissionError = new FirestorePermissionError({
          path: productsCollection.path,
          operation: 'create',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Error creating product',
          description: error.message || 'Please try again.',
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
      {user && <ProductForm onSave={handleSave} userId={user.uid} />}
    </div>
  );
}
