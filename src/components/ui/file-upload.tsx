'use client';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, File as FileIcon, X } from 'lucide-react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';
import { Button } from './button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  userId: string;
  value?: string;
  label?: string;
  accept?: Record<string, string[]>;
}

export function FileUpload({ onUploadComplete, userId, value, label, accept = { 'image/*': ['.jpeg', '.png', '.gif'] } }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const isImage = fileUrl && (fileUrl.includes('.png') || fileUrl.includes('.jpg') || fileUrl.includes('.jpeg') || fileUrl.includes('.gif') || fileUrl.startsWith('data:image'));

  useEffect(() => {
    setFileUrl(value || null);
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        toast({
            variant: 'destructive',
            title: 'Invalid File',
            description: `Please upload a valid file type.`,
        });
        return;
      }
      const file = acceptedFiles[0];
      const storage = getStorage();
      const storageRef = ref(storage, `uploads/${userId}/${new Date().getTime()}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setIsUploading(true);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload failed:', error);
          toast({ variant: 'destructive', title: 'Upload Failed' });
          setIsUploading(false);
          setUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFileUrl(downloadURL);
            onUploadComplete(downloadURL);
            setIsUploading(false);
            setUploadProgress(null);
          });
        }
      );
    },
    [onUploadComplete, toast, userId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, multiple: false });

  const handleRemove = () => {
    setFileUrl(null);
    onUploadComplete('');
  };

  if (fileUrl) {
    return (
      <div className="relative group">
        {isImage ? (
            <Image
                src={fileUrl}
                alt={label || 'Uploaded image'}
                width={400}
                height={225}
                className="rounded-md object-cover w-full aspect-video"
            />
        ) : (
            <div className="flex flex-col items-center justify-center p-4 border rounded-md aspect-video">
                <FileIcon className="h-16 w-16 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2 truncate max-w-full">{fileUrl.split('%2F').pop()?.split('?')[0] || 'File'}</p>
            </div>
        )}
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
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
        'border-2 border-dashed rounded-md aspect-video flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-primary transition-colors',
        isDragActive && 'border-primary bg-primary/10'
      )}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <>
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
          {uploadProgress !== null && <Progress value={uploadProgress} className="w-full max-w-xs mt-2" />}
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
