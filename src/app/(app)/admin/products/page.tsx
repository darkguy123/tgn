'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function AdminProductsPage() {
  const firestore = useFirestore();
  const productsRef = useMemoFirebase(() => (firestore ? collection(firestore, 'products') : null), [firestore]);
  const { data: products, isLoading, error } = useCollection<Product>(productsRef);
  const { toast } = useToast();

  const handleUpdateStatus = (productId: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    const productDocRef = doc(firestore, 'products', productId);
    
    updateDoc(productDocRef, { approvalStatus: status })
      .then(() => {
        toast({
          title: 'Product Updated',
          description: `The product status has been updated to ${status}.`,
        });
      })
      .catch((serverError) => {
        console.error("Failed to update product status: ", serverError);
        const permissionError = new FirestorePermissionError({
          path: productDocRef.path,
          operation: 'update',
          requestResourceData: { approvalStatus: status }
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not update the product status.',
        });
      });
  };

  const renderTable = (filteredProducts: Product[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Seller</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredProducts.map(product => {
            return (
                <TableRow key={product.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                             <Image
                                src={product.imageUrl || 'https://placehold.co/120x80'}
                                alt={product.name}
                                width={120}
                                height={80}
                                className="aspect-[3/2] w-20 object-cover rounded-md"
                            />
                            <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.type}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={product.sellerAvatarUrl} />
                                <AvatarFallback>{product.sellerName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{product.sellerName}</span>
                        </div>
                    </TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                        {product.createdAt?.toDate ? formatDistanceToNow(product.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                        {product.approvalStatus === 'pending' && (
                            <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(product.id, 'approved')}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(product.id, 'rejected')}>
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                </Button>
                            </div>
                        )}
                    </TableCell>
                </TableRow>
            )
        })}
        {filteredProducts.length === 0 && (
            <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    No products in this category.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const pendingProducts = products?.filter(c => c.approvalStatus === 'pending') ?? [];
  const approvedProducts = products?.filter(c => c.approvalStatus === 'approved') ?? [];
  const rejectedProducts = products?.filter(c => c.approvalStatus === 'rejected') ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">
            Review, approve, and manage all member-submitted products.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="pending">
            <div className="px-6 pt-4">
                <TabsList>
                <TabsTrigger value="pending">
                    <Clock className="mr-2 h-4 w-4" /> Pending ({pendingProducts.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                    <CheckCircle className="mr-2 h-4 w-4" /> Approved ({approvedProducts.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                    <XCircle className="mr-2 h-4 w-4" /> Rejected ({rejectedProducts.length})
                </TabsTrigger>
                </TabsList>
            </div>
            
            {isLoading && <div className="p-6">
                {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-16 w-full mt-2" />)}
            </div>}

            {error && <p className="p-6 text-destructive">Failed to load products.</p>}

            {!isLoading && products && (
                <>
                    <TabsContent value="pending" className="m-0">
                        {renderTable(pendingProducts)}
                    </TabsContent>
                    <TabsContent value="approved" className="m-0">
                        {renderTable(approvedProducts)}
                    </TabsContent>
                    <TabsContent value="rejected" className="m-0">
                        {renderTable(rejectedProducts)}
                    </TabsContent>
                </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
