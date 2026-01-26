'use client';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, File as FileIcon, X } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';
import { Button } from './button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useStorage } from '@/firebase';

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
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const storage = useStorage();

  const isUploading = uploadProgress !== null;
  const displayUrl = localPreview || value;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!storage) {
        toast({ variant: 'destructive', title: 'Storage not available', description: 'Please try again later.' });
        return;
      }
      if (acceptedFiles.length === 0) {
        toast({ variant: 'destructive', title: 'Invalid File Type' });
        return;
      }
      
      const file = acceptedFiles[0];
      const previewUrl = URL.createObjectURL(file);
      setLocalPreview(previewUrl);

      const storageRef = ref(storage, `uploads/${storagePath}/${userId}/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
          setUploadProgress(null);
          setLocalPreview(null);
          URL.revokeObjectURL(previewUrl);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              onUploadComplete(downloadURL);
              setUploadProgress(null);
              setLocalPreview(null);
              URL.revokeObjectURL(previewUrl);
            })
            .catch((error) => {
              console.error('Get URL error:', error);
              toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not retrieve file URL.' });
              setUploadProgress(null);
              setLocalPreview(null);
              URL.revokeObjectURL(previewUrl);
            });
        }
      );
    },
    [onUploadComplete, storage, storagePath, toast, userId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, multiple: false });

  const handleRemove = () => {
    if (value && storage) {
        try {
            const fileRef = ref(storage, value);
            deleteObject(fileRef).catch((error) => {
                console.warn("Could not delete file from storage:", error.message);
            });
        } catch (e) {
            console.warn("Invalid URL for deletion:", e);
        }
    }
    onUploadComplete('');
  };

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);
  
  const isImage = displayUrl && (displayUrl.startsWith('blob:') || (displayUrl.startsWith('http') && /\.(jpg|jpeg|png|gif|webp)/i.test(displayUrl)));

  if (displayUrl && !isUploading) {
    return (
      <div className="relative group aspect-video">
        {isImage ? (
          <Image src={displayUrl} alt={label || 'Uploaded content'} fill className="rounded-md object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 border rounded-md h-full">
            <FileIcon className="h-16 w-16 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2 truncate max-w-full">{displayUrl.split('%2F').pop()?.split('?')[0] || 'File'}</p>
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
      {isUploading && displayUrl && isImage ? (
          <>
            <Image src={displayUrl} alt="Uploading preview" fill className="object-cover rounded-md opacity-30" />
            <div className="absolute z-10 flex flex-col items-center w-full px-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm text-primary-foreground font-semibold mt-2 bg-black/50 px-2 py-1 rounded">Uploading...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mt-2" />
            </div>
          </>
      ) : (
        <>
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {label || 'Drag & drop an image, or click to select'}
          </p>
        </>
      )}
    </div>
  );
}
