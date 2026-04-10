'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Image as ImageIcon } from 'lucide-react';

export default function AdminSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const brandingDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'app_settings', 'branding') : null, [firestore]);
  const { data: brandingData, isLoading } = useDoc<{ logoUrl?: string }>(brandingDocRef);

  const handleUploadLogo = async () => {
    if (!logoFile || !firestore) return;
    
    setIsUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `settings/branding/logo-${Date.now()}`);
      await uploadBytes(storageRef, logoFile);
      const url = await getDownloadURL(storageRef);

      if (brandingData) {
        await updateDoc(brandingDocRef!, { logoUrl: url });
      } else {
        await setDoc(brandingDocRef!, { logoUrl: url });
      }

      toast({ title: 'Success', description: 'Website logo updated successfully.' });
      setLogoFile(null);
    } catch (e: any) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Upload Failed', description: e.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
          <p className="text-muted-foreground">Manage global application configurations.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Update the website logo and appearance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="font-medium text-sm mb-2">Current Logo</p>
              <div className="p-4 bg-muted border rounded-lg inline-block">
                {isLoading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={brandingData?.logoUrl || '/transcendlogo2.png'} 
                    alt="Current Logo" 
                    className="max-h-16 object-contain"
                  />
                )}
              </div>
            </div>

            <div>
              <p className="font-medium text-sm mb-2">Upload New Logo</p>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <Button 
                  onClick={handleUploadLogo} 
                  disabled={!logoFile || isUploading}
                >
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                  {isUploading ? 'Uploading...' : 'Save Logo'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Recommended size: 358x98 pixels. PNG with transparent background.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
