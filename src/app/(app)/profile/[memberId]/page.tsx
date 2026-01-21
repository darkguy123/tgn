'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase } from 'lucide-react';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import type { TGNMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const firestore = useFirestore();

  const isTgnId = memberId.startsWith('TGN-');

  const memberDocRef = useMemoFirebase(() => {
    if (isTgnId || !firestore) return null;
    return doc(firestore, 'users', memberId);
  }, [firestore, memberId, isTgnId]);

  const memberQuery = useMemoFirebase(() => {
    if (!isTgnId || !firestore) return null;
    return query(collection(firestore, 'users'), where('tgnMemberId', '==', memberId));
  }, [firestore, memberId, isTgnId]);
  
  const { data: memberFromDoc, isLoading: isDocLoading } = useDoc<TGNMember>(memberDocRef);
  const { data: membersFromQuery, isLoading: isQueryLoading } = useCollection<TGNMember>(memberQuery);

  const member = isTgnId ? membersFromQuery?.[0] : memberFromDoc;
  const isLoading = isDocLoading || isQueryLoading;
  
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

  if (!isLoading && !member) {
    return notFound();
  }

  const name = member.name || member.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <main className="lg:col-span-2 space-y-6">
        <Card className="overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1557683316-9ca2a4f4e427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxhYnN0cmFjdCUyMGJsdWV8ZW58MHx8fHwxNzE3Nzc4MDUwfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Profile banner" width={1200} height={300} className="h-48 w-full object-cover" data-ai-hint="abstract blue"
            />
          <div className="relative">
            <div className="p-6 pt-20 flex flex-col md:flex-row justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{name}</h1>
                  <p className="text-muted-foreground capitalize">{member.role.replace('-', ' ')}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{member.locationCountry}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0 shrink-0">
                    {/* Action buttons removed for simplicity */}
                </div>
            </div>
             <Avatar className="absolute -top-16 left-6 h-32 w-32 rounded-full border-4 border-card">
              <AvatarImage src={member.avatarUrl} alt={name} />
              <AvatarFallback className="text-4xl">{name.charAt(0)}</AvatarFallback>
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
      </aside>
    </div>
  );
}
