'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, X } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { Button } from './button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useStorage, useFirestore } from '@/firebase';

interface FileUploadProps {
  onUploadComplete: (url: string, fileType: string) => void;
  userId: string;
  value?: string;
  mediaType?: string;
  label?: string;
  accept?: Record<string, string[]>;
  storagePath?: 'public' | 'private';
  className?: string;
}

const generateShortId = () => Math.random().toString(36).slice(2, 9);

export function FileUpload({
  onUploadComplete,
  userId,
  value,
  mediaType,
  label,
  accept = { 'image/*': [], 'video/*': [] },
  storagePath = 'public',
  className,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const storage = useStorage();
  const firestore = useFirestore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!storage || !firestore) {
        toast({ variant: 'destructive', title: 'Services not available' });
        setError('Storage or database service is not configured.');
        return;
      }
      if (acceptedFiles.length === 0) {
        toast({ variant: 'destructive', title: 'Invalid file type selected.' });
        return;
      }

      const file = acceptedFiles[0];
      const fileExtension = file.name.split('.').pop() || '';
      const newFileName = `${generateShortId()}.${fileExtension}`;
      const filePath = `uploads/${storagePath}/${userId}/${newFileName}`;
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (uploadError) => {
          console.error("Upload failed:", uploadError);
          setIsUploading(false);
          setUploadProgress(null);
          setError('Upload failed. Please try again.');
          toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload your file.' });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Save metadata to Firestore
            const mediaCollectionRef = collection(firestore, 'users', userId, 'media');
            const mediaDocData = {
              ownerId: userId,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              storagePath: filePath,
              url: downloadURL,
              createdAt: serverTimestamp(),
            };
            await addDoc(mediaCollectionRef, mediaDocData);

            onUploadComplete(downloadURL, file.type);
            toast({ title: 'Upload Complete' });
          } catch (finalError: any) {
            console.error("Error during upload finalization:", finalError);
            setError(`Upload failed: ${finalError.message}`);
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not save file metadata.' });
          } finally {
            setIsUploading(false);
            setUploadProgress(null);
          }
        }
      );
    },
    [storage, firestore, userId, storagePath, onUploadComplete, toast, accept]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    disabled: isUploading,
  });

  const handleRemove = () => {
    if (value && storage) {
      try {
        const fileRef = ref(storage, value);
        deleteObject(fileRef).catch((error) => {
          console.warn("Could not delete file from storage:", error.message);
        });
      } catch (error: any) {
        console.error("Error creating storage reference for deletion:", error.message);
      }
    }
    onUploadComplete('', '');
  };

  if (value) {
    return (
      <div className={cn("relative group aspect-video", className)}>
        {mediaType?.startsWith('video/') ? (
          <video key={value} controls className="rounded-md object-cover w-full h-full bg-black">
            <source src={value} type={mediaType} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            src={value}
            alt="Uploaded content"
            fill
            className="rounded-md object-cover"
          />
        )}
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className={cn("aspect-video w-full flex flex-col items-center justify-center border rounded-md p-4", className)}>
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-foreground font-semibold mt-4">Uploading...</p>
        <Progress value={uploadProgress} className="w-full max-w-xs mt-2" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={cn("aspect-video w-full flex flex-col items-center justify-center border border-destructive rounded-md p-4", className)}>
        <p className="text-sm text-destructive text-center">{error}</p>
        <Button variant="link" size="sm" onClick={() => setError(null)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-md aspect-video flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-primary transition-colors',
        isDragActive && 'border-primary bg-primary/10',
        className,
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="h-10 w-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground mt-2">
        {label || 'Drag & drop or click to upload'}
      </p>
    </div>
  );
}
