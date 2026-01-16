'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, PlusCircle, PackageSearch, MoreVertical, Edit, Trash2, Megaphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function MyProductsPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { profile, isLoading: profileLoading } = useMemberProfile();
  const { toast } = useToast();

  const productsQuery = useMemoFirebase(
    () =>
      profile
        ? query(collection(firestore, 'products'), where('sellerMemberId', '==', profile.id))
        : null,
    [firestore, profile]
  );

  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  const isLoading = profileLoading || productsLoading;

  const handleDelete = (productId: string) => {
    if (!firestore || !window.confirm('Are you sure you want to permanently delete this product?')) {
      return;
    }
    const productDocRef = doc(firestore, 'products', productId);
    deleteDoc(productDocRef)
      .then(() => {
        toast({
          title: 'Product Deleted',
          description: 'Your product listing has been permanently deleted.',
        });
      })
      .catch((e) => {
        console.error(e);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: productDocRef.path, operation: 'delete' }));
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not delete the product.',
        });
      });
  };

  const filteredProducts = useMemo(() => {
    const live = products?.filter(p => p.approvalStatus === 'approved') ?? [];
    const pending = products?.filter(p => p.approvalStatus === 'pending') ?? [];
    const inReview = products?.filter(p => p.approvalStatus === 'in_review') ?? [];
    const rejected = products?.filter(p => p.approvalStatus === 'rejected') ?? [];
    return { live, pending, inReview, rejected };
  }, [products]);

  const renderProductList = (products: Product[]) => {
    if (products.length === 0) {
      return (
        <div className="py-20 text-center text-muted-foreground">
          <PackageSearch className="mx-auto h-12 w-12" />
          <p className="mt-4">No products in this category.</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="aspect-video relative mb-4">
                <Image
                  src={product.imageUrl || 'https://placehold.co/400x300'}
                  alt={product.name}
                  fill
                  className="rounded-md object-cover"
                />
                 <div className="absolute top-2 right-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-none">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {product.approvalStatus === 'approved' && (
                                <DropdownMenuItem onClick={() => router.push(`/ads/new?productId=${product.id}`)}>
                                    <Megaphone className="mr-2 h-4 w-4" /> Promote
                                </DropdownMenuItem>
                            )}
                            {product.approvalStatus === 'rejected' && (
                                <DropdownMenuItem onClick={() => router.push(`/marketplace/my-products/${product.id}/edit`)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit & Resubmit
                                </DropdownMenuItem>
                            )}
                            {(product.approvalStatus === 'pending' || product.approvalStatus === 'rejected') && (
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(product.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
              <h3 className="font-semibold truncate">{product.name}</h3>
              <div className="flex justify-between items-center mt-2">
                <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                <Badge
                  variant={
                    product.approvalStatus === 'approved'
                      ? 'default'
                      : product.approvalStatus === 'rejected'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className={product.approvalStatus === 'approved' ? 'bg-green-600' : ''}
                >
                  {product.approvalStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/marketplace')}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
                <p className="text-muted-foreground">
                    Manage your product listings and view their status.
                </p>
            </div>
        </div>
        <Button asChild>
          <Link href="/marketplace/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </div>
      
      <Card>
        <Tabs defaultValue="live" className="w-full">
            <CardHeader>
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="live">Live ({filteredProducts.live.length})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({filteredProducts.pending.length})</TabsTrigger>
                    <TabsTrigger value="in_review">In Review ({filteredProducts.inReview.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({filteredProducts.rejected.length})</TabsTrigger>
                </TabsList>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i}><CardContent className="p-4"><Skeleton className="w-full h-56" /></CardContent></Card>
                        ))}
                    </div>
                ) : (
                    <>
                        <TabsContent value="live">
                            {renderProductList(filteredProducts.live)}
                        </TabsContent>
                        <TabsContent value="pending">
                            {renderProductList(filteredProducts.pending)}
                        </TabsContent>
                         <TabsContent value="in_review">
                            {renderProductList(filteredProducts.inReview)}
                        </TabsContent>
                        <TabsContent value="rejected">
                            {renderProductList(filteredProducts.rejected)}
                        </TabsContent>
                    </>
                )}
            </CardContent>
        </Tabs>
      </Card>

    </div>
  );
}
