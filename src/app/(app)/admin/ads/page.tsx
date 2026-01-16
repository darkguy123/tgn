'use client';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
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
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { AdCampaign } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import placeholderImages from '@/lib/placeholder-images.json';

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};

export default function AdminAdsPage() {
  const firestore = useFirestore();
  const adsRef = useMemoFirebase(() => collection(firestore, 'ads'), [firestore]);
  const { data: ads, isLoading, error } = useCollection<AdCampaign>(adsRef);
  const { toast } = useToast();

  const handleUpdateStatus = async (adId: string, status: 'active' | 'rejected') => {
    const adDocRef = doc(firestore, 'ads', adId);
    try {
      await updateDoc(adDocRef, { status });
      toast({
        title: 'Ad Campaign Updated',
        description: `The campaign has been ${status === 'active' ? 'approved' : 'rejected'}.`,
      });
    } catch (e) {
      console.error("Failed to update ad status: ", e);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the campaign status.',
      });
    }
  };

  const renderTable = (filteredAds: AdCampaign[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign</TableHead>
          <TableHead>Creator</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAds.map(ad => {
            const creatorImg = getImage(ad.creatorImageId);
            return (
                <TableRow key={ad.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                             <Image
                                src={ad.imageUrl || 'https://placehold.co/120x80'}
                                alt={ad.name}
                                width={120}
                                height={80}
                                className="aspect-[3/2] w-20 object-cover rounded-md"
                            />
                            <div>
                                <p className="font-medium">{ad.name}</p>
                                <p className="text-xs text-muted-foreground">{ad.headline}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={creatorImg?.imageUrl} />
                                <AvatarFallback>{ad.creatorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{ad.creatorName}</span>
                        </div>
                    </TableCell>
                    <TableCell>${ad.budget.toFixed(2)}</TableCell>
                    <TableCell>
                        {ad.createdAt?.toDate ? formatDistanceToNow(ad.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                        {ad.status === 'pending' && (
                            <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(ad.id, 'active')}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(ad.id, 'rejected')}>
                                    <XCircle className="mr-2 h-4 w-4" /> Reject
                                </Button>
                            </div>
                        )}
                         <a href={ad.callToActionUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </TableCell>
                </TableRow>
            )
        })}
        {filteredAds.length === 0 && (
            <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    No ad campaigns in this category.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const pendingAds = ads?.filter(c => c.status === 'pending') ?? [];
  const activeAds = ads?.filter(c => c.status === 'active') ?? [];
  const rejectedAds = ads?.filter(c => c.status === 'rejected') ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ad Management</h1>
          <p className="text-muted-foreground">
            Review, approve, and manage all member-submitted ad campaigns.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="pending">
            <div className="px-6 pt-4">
                <TabsList>
                <TabsTrigger value="pending">
                    <Clock className="mr-2 h-4 w-4" /> Pending ({pendingAds.length})
                </TabsTrigger>
                <TabsTrigger value="active">
                    <CheckCircle className="mr-2 h-4 w-4" /> Approved ({activeAds.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                    <XCircle className="mr-2 h-4 w-4" /> Rejected ({rejectedAds.length})
                </TabsTrigger>
                </TabsList>
            </div>
            
            {isLoading && <div className="p-6">
                {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-16 w-full mt-2" />)}
            </div>}

            {error && <p className="p-6 text-destructive">Failed to load ad campaigns.</p>}

            {!isLoading && ads && (
                <>
                    <TabsContent value="pending" className="m-0">
                        {renderTable(pendingAds)}
                    </TabsContent>
                    <TabsContent value="active" className="m-0">
                        {renderTable(activeAds)}
                    </TabsContent>
                    <TabsContent value="rejected" className="m-0">
                        {renderTable(rejectedAds)}
                    </TabsContent>
                </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

    