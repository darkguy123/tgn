'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, X } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';
import { Button } from './button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useStorage } from '@/firebase';

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

export function FileUpload({
  onUploadComplete,
  userId,
  value,
  mediaType,
  label,
  accept = { 'image/*': [] },
  storagePath = 'public',
  className,
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const storage = useStorage();

  const isUploading = uploadProgress !== null && uploadProgress >= 0;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!storage) {
        toast({ variant: 'destructive', title: 'Storage not available' });
        setError('Storage service is not configured.');
        return;
      }
      if (acceptedFiles.length === 0) {
        toast({ variant: 'destructive', title: 'Invalid file type selected.' });
        return;
      }
      const file = acceptedFiles[0];
      const filePath = `uploads/${storagePath}/${userId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

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
          setError('Upload failed. Please try again.');
          toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload your file.' });
          setUploadProgress(null);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setUploadProgress(null); // Stop loading UI FIRST
            onUploadComplete(downloadURL, file.type); // THEN notify parent
            toast({ title: 'Upload Complete' });
          } catch (getUrlError) {
            console.error("Could not get download URL:", getUrlError);
            setError('Could not retrieve file URL.');
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not get file URL after upload.' });
            setUploadProgress(null);
          }
        }
      );
    },
    [storage, userId, storagePath, onUploadComplete, toast, accept]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
  });

  const handleRemove = () => {
    if (value && storage) {
        try {
            const fileRef = ref(storage, value);
            deleteObject(fileRef).catch((error) => {
                console.warn("Could not delete file from storage:", error);
            });
        } catch (error) {
            console.error("Error creating storage reference for deletion:", error);
        }
    }
    onUploadComplete('', '');
  };

  if (value && !isUploading) {
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
    )
  }

  if (isUploading) {
      return (
        <div className={cn("aspect-video w-full flex flex-col items-center justify-center border rounded-md p-4", className)}>
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-foreground font-semibold mt-4">Uploading...</p>
            <Progress value={uploadProgress} className="w-full max-w-xs mt-2" />
        </div>
      )
  }
  
  if (error) {
       return (
        <div className={cn("aspect-video w-full flex flex-col items-center justify-center border border-destructive rounded-md p-4", className)}>
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="link" size="sm" onClick={() => setError(null)}>Try Again</Button>
        </div>
      )
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
