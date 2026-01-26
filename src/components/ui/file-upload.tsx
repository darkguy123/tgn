'use client';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, File as FileIcon, X } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { Button } from './button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useStorage, useFirestore } from '@/firebase';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  userId: string;
  value?: string;
  label?: string;
  accept?: Record<string, string[]>;
  storagePath?: 'public' | 'private';
}

export function FileUpload({ onUploadComplete, userId, value, label, accept = { 'image/*': [] }, storagePath = 'public' }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();
  const storage = useStorage();
  const firestore = useFirestore();

  const isUploading = uploadProgress !== null;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!storage || !firestore) {
        toast({ variant: 'destructive', title: 'Services not available', description: 'Please try again later.' });
        return;
      }
      if (acceptedFiles.length === 0) {
        toast({ variant: 'destructive', title: 'Invalid File Type' });
        return;
      }
      
      const file = acceptedFiles[0];
      setUploadProgress(0);
      setUploadError(null);

      const filePath = `uploads/${storagePath}/${userId}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          const errorMessage = 'Upload failed. Please check your network and security rules.';
          setUploadError(errorMessage);
          toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
          setUploadProgress(null);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Create a document in Firestore
            const mediaCollectionRef = collection(firestore, `users/${userId}/media`);
            const mediaFileData = {
              uploaderId: userId,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              storagePath: filePath,
              downloadUrl: downloadURL,
              createdAt: serverTimestamp(),
            };
            await addDoc(mediaCollectionRef, mediaFileData);

            onUploadComplete(downloadURL);
            toast({ title: 'Upload Successful', description: `${file.name} has been uploaded.` });
            setUploadProgress(null);

          } catch (error: any) {
            console.error('Error during post-upload process:', error);
            const errorMessage = 'Upload succeeded but failed to save file metadata.';
            setUploadError(errorMessage);
            toast({ variant: 'destructive', title: 'Upload Failed', description: error.message || 'Could not save file details.' });
            setUploadProgress(null);
          }
        }
      );
    },
    [onUploadComplete, storage, firestore, storagePath, toast, userId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, multiple: false });

  const handleRemove = () => {
    // This is a best-effort removal. It won't work if the 'value' is not a GCS URL
    // that contains the full path, which it usually doesn't.
    // For now, simply clearing the value is safer.
    if (value && storage) {
        try {
            const fileRef = ref(storage, value);
            deleteObject(fileRef).catch((error) => {
                // Log error but don't block user. It might be a cross-origin URL.
                console.warn("Could not delete file from storage. It might be a cross-origin URL or protected.", error);
            });
        } catch (e) {
             console.warn("Could not parse storage URL for deletion.", e);
        }
    }
    onUploadComplete('');
  };
  
  const isImage = value && (value.startsWith('http') && /\.(jpg|jpeg|png|gif|webp|svg)/i.test(value));
  
  const onTryAgain = () => {
    setUploadError(null);
    setUploadProgress(null);
  }

  if (value && !isUploading) {
    return (
      <div className="relative group aspect-video">
        {isImage ? (
          <Image src={value} alt={label || 'Uploaded content'} fill className="rounded-md object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 border rounded-md h-full">
            <FileIcon className="h-16 w-16 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2 truncate max-w-full">{value.split('%2F').pop()?.split('?')[0] || 'File'}</p>
          </div>
        )}
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-md aspect-video flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-primary transition-colors relative',
        isDragActive && 'border-primary bg-primary/10'
      )}
    >
      <input {...getInputProps()} />
      {isUploading ? (
          <div className="flex flex-col items-center w-full px-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-sm text-foreground font-semibold mt-2">Uploading...</p>
              <Progress value={uploadProgress} className="w-full max-w-xs mt-2" />
          </div>
      ) : uploadError ? (
         <div className="flex flex-col items-center text-destructive">
            <p>{uploadError}</p>
            <Button type="button" variant="link" size="sm" className="mt-2" onClick={onTryAgain}>Try again</Button>
         </div>
      ) : (
        <>
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-2">
            {label || 'Drag & drop a file, or click to select'}
          </p>
        </>
      )}
    </div>
  );
}
