'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { FileUpload } from '@/components/ui/file-upload';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function UploadTestPage() {
  const { user } = useUser();
  const [imageUrl, setImageUrl] = useState('');
  const [fileType, setFileType] = useState('');

  const handleUploadComplete = (url: string, type: string) => {
    setImageUrl(url);
    setFileType(type);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-1/4 mb-4" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>File Upload Test</CardTitle>
          <CardDescription>
            Use this page to test the file upload functionality. This is a temporary testing page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            value={imageUrl}
            mediaType={fileType}
            onUploadComplete={handleUploadComplete}
            userId={user.uid}
            label="Upload an image to test"
            crop={{ aspect: 1 }}
          />
        </CardContent>
      </Card>

      {imageUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Image Preview:</h3>
              <div className="mt-2 relative aspect-square max-w-sm">
                <Image
                  src={imageUrl}
                  alt="Uploaded preview"
                  fill
                  className="rounded-md object-cover"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium">Firebase Storage URL:</h3>
              <p className="text-xs text-muted-foreground break-all">{imageUrl}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
