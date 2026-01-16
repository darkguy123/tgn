'use client';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { AdCampaign } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from './ui/button';

interface AdPlacementProps {
  size: '350x350' | '128x90' | 'skyscraper';
  className?: string;
}

const adDimensions = {
  '350x350': { width: 350, height: 350 },
  '128x90': { width: 128, height: 90 },
  'skyscraper': { width: 160, height: 600 },
};

export function AdPlacement({ size, className }: AdPlacementProps) {
  const firestore = useFirestore();
  const [ad, setAd] = useState<AdCampaign | null>(null);

  const adsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'ads'), where('status', '==', 'active'), where('adSize', '==', size)) : null,
    [firestore, size]
  );
  
  const { data: activeAds, isLoading } = useCollection<AdCampaign>(adsQuery);

  useEffect(() => {
    if (activeAds && activeAds.length > 0) {
      const randomIndex = Math.floor(Math.random() * activeAds.length);
      setAd(activeAds[randomIndex]);
    } else {
      setAd(null);
    }
  }, [activeAds]);

  if (isLoading) {
    const dims = adDimensions[size];
    return <Skeleton className="w-full" style={{ height: `${dims.height}px` }} />;
  }

  if (!ad) {
    return null; // Don't render anything if no ad is available
  }
  
  const dims = adDimensions[size];

  return (
    <div className={className}>
        <p className="text-xs text-muted-foreground mb-1">Sponsored</p>
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <Link href={ad.callToActionUrl} target="_blank" rel="noopener noreferrer sponsored" className="block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-t-lg">
                    <Image
                        src={ad.imageUrl}
                        alt={ad.headline}
                        width={dims.width}
                        height={dims.height}
                        className="w-full h-auto object-cover"
                    />
                </Link>
                <div className="p-3">
                    <h4 className="font-semibold text-sm leading-tight">{ad.headline}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ad.bodyText}</p>
                    <Button asChild variant="link" size="sm" className="p-0 h-auto mt-2 text-primary">
                        <Link href={ad.callToActionUrl} target="_blank" rel="noopener noreferrer sponsored">
                            {ad.callToActionText}
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
