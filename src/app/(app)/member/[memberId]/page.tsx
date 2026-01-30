'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Edit, Send, Award, ShoppingBag } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import type { TGNMember, Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import placeholderImages from '@/lib/placeholder-images.json';

// Helper to get image URL from placeholder data
const getImageUrl = (imageId?: string) => {
  if (!imageId) return "https://images.unsplash.com/photo-1557683316-9ca2a4f4e427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxhYnN0cmFjdCUyMGJsdWV8ZW58MHx8fHwxNzE3Nzc4MDUwfDA&ixlib=rb-4.1.0&q=80&w=1080";
  const image = placeholderImages.placeholderImages.find((p) => p.id === imageId);
  return image?.imageUrl || "https://images.unsplash.com/photo-1557683316-9ca2a4f4e427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxhYnN0cmFjdCUyMGJsdWV8ZW58MHx8fHwxNzE3Nzc4MDUwfDA&ixlib=rb-4.1.0&q=80&w=1080";
}

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useUser();
  const memberId = params.memberId as string;
  const firestore = useFirestore();

  const memberQuery = useMemoFirebase(() => {
    if (!firestore || !memberId) return null;
    const isTgnId = memberId.startsWith('TGN-');
    if (isTgnId) {
        return query(collection(firestore, 'users'), where('tgnMemberId', '==', memberId));
    }
    return query(collection(firestore, 'users'), where(documentId(), '==', memberId));
  }, [firestore, memberId]);

  const { data: members, isLoading } = useCollection<TGNMember>(memberQuery);
  const member = members?.[0];

  const productsQuery = useMemoFirebase(
    () =>
      member
        ? query(
            collection(firestore, 'products'),
            where('sellerMemberId', '==', member.id),
            where('approvalStatus', '==', 'approved')
          )
        : null,
    [firestore, member]
  );
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  const isOwnProfile = currentUser && member && currentUser.uid === member.id;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6 pt-20 relative">
                    <Skeleton className="absolute -top-16 left-6 h-32 w-32 rounded-full border-4 border-card" />
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                </div>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-4/5" />
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  // If after loading, no member is found, show the not-found page.
  if (!member) {
    return notFound();
  }

  // --- Safe defaults for rendering ---
  const name = member.name || (member.email ? member.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '') || "TGN Member";
  const role = member.role?.replace('-', ' ') || 'Member';
  const location = member.locationCountry || 'Location not set';
  const avatarFallback = name.charAt(0)?.toUpperCase() || "T";
  const bannerUrl = getImageUrl('profile-banner-default'); // Using a default banner

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <main className="lg:col-span-2 space-y-6">
        <Card className="overflow-hidden">
            <Image
              src={bannerUrl}
              alt="Profile banner" width={1200} height={300} className="h-48 w-full object-cover" data-ai-hint="abstract blue"
            />
          <div className="relative">
            <div className="p-6 pt-20 flex flex-col md:flex-row justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{name}</h1>
                  <p className="text-muted-foreground capitalize">{role}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0 shrink-0">
                    {isOwnProfile ? (
                        <Button onClick={() => router.push('/settings/profile')}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                    ) : (
                        <Button onClick={() => router.push(`/chat/${member.id}`)}>
                            <Send className="mr-2 h-4 w-4" /> Message
                        </Button>
                    )}
                </div>
            </div>
             <Avatar className="absolute -top-16 left-6 h-32 w-32 rounded-full border-4 border-card">
              <AvatarImage src={member.avatarUrl} alt={name} />
              <AvatarFallback className="text-4xl">{avatarFallback}</AvatarFallback>
            </Avatar>
          </div>
        </Card>

        <Card>
            <CardHeader><CardTitle>About</CardTitle></CardHeader>
            <CardContent><p className="text-foreground/90 whitespace-pre-line">{member.purpose || 'No bio provided.'}</p></CardContent>
        </Card>
      </main>

      <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
        {member.sectorPreferences && member.sectorPreferences.length > 0 && (
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" />Sectors</CardTitle></CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {member.sectorPreferences.map(sector => (
                        <Badge key={sector} variant="secondary">{sector}</Badge>
                    ))}
                </CardContent>
            </Card>
        )}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Achievements
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {member.isVerifiedMentor && <Badge variant="secondary">Verified Mentor</Badge>}
                <Badge variant="outline">Early Adopter</Badge>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Products
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {productsLoading && <p>Loading products...</p>}
                {!productsLoading && products && products.length > 0 ? (
                    products.map(product => (
                        <Link key={product.id} href="/marketplace" className="flex items-center gap-3 group">
                            <Image src={product.imageUrl} alt={product.name} width={64} height={64} className="rounded-md object-cover h-16 w-16" />
                            <div className="flex-1">
                                <p className="font-semibold group-hover:text-primary">{product.name}</p>
                                <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No products listed yet.</p>
                )}
            </CardContent>
        </Card>
      </aside>
    </div>
  );
}
