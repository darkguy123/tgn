'use client';
import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, X, CropIcon } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { Button } from './button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useStorage, useFirestore } from '@/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ReactCrop, { centerCrop, makeAspectCrop, type Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface FileUploadProps {
  onUploadComplete: (url: string, fileType: string) => void;
  userId: string;
  value?: string;
  mediaType?: string;
  label?: string;
  accept?: Record<string, string[]>;
  storagePath?: 'public' | 'private';
  className?: string;
  crop?: {
    aspect: number;
  };
}

const generateShortId = () => Math.random().toString(36).slice(2, 9);

// Helper function to get the cropped image blob
async function getCroppedBlob(image: HTMLImageElement, crop: CropType): Promise<Blob | null> {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Ensure crop dimensions are not zero
    if (crop.width === 0 || crop.height === 0) {
        return null;
    }

    canvas.width = crop.width;
    canvas.height = crop.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return null;
    }

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, "image/png", 1); // Use PNG for quality, quality factor 1
    });
}


export function FileUpload({
  onUploadComplete,
  userId,
  value,
  mediaType,
  label,
  accept = { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
  storagePath = 'public',
  className,
  crop: cropConfig,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<CropType>();
  const [isCropModalOpen, setCropModalOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<File | null>(null);

  const { toast } = useToast();
  const storage = useStorage();
  const firestore = useFirestore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        toast({ variant: 'destructive', title: 'Invalid file type selected.' });
        return;
      }
      
      const file = acceptedFiles[0];
      fileRef.current = file;

      if (cropConfig && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
        reader.readAsDataURL(file);
        setCropModalOpen(true);
      } else {
        startUpload(file);
      }
    },
    [cropConfig, toast]
  );
  
  const startUpload = (fileToUpload: File | Blob) => {
      const auth = getAuth();
      if (!auth.currentUser) {
        toast({
          variant: 'destructive',
          title: 'You must be logged in to upload files',
        });
        setError('You must be logged in to upload files.');
        return;
      }

      if (auth.currentUser.uid !== userId) {
        console.error('UID mismatch:', {
          authUid: auth.currentUser.uid,
          propUserId: userId,
        });
        toast({
          variant: 'destructive',
          title: 'Session error. Please reload.',
        });
        setError('User ID mismatch. Please refresh and try again.');
        return;
      }
      
      if (!storage || !firestore) {
        toast({ variant: 'destructive', title: 'Services not available' });
        setError('Storage or database service is not configured.');
        return;
      }

      const originalFile = fileRef.current;
      if(!originalFile) return;

      const isBlob = fileToUpload instanceof Blob && !(fileToUpload instanceof File);
      const fileExtension = isBlob
        ? 'png'
        : originalFile.name.split('.').pop() || 'bin';
      const contentType = isBlob
        ? 'image/png'
        : originalFile.type;

      const newFileName = `${generateShortId()}.${fileExtension}`;
      const filePath = `uploads/${storagePath}/${userId}/${newFileName}`;
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(
        storageRef,
        fileToUpload,
        {
          contentType,
          customMetadata: {
            ownerId: userId,
          },
        }
      );

      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      
      console.log('Starting upload for path:', filePath);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (uploadError) => {
          console.error("Upload failed with error object:", uploadError);
          console.error("Full error object:", JSON.stringify(uploadError, null, 2));
          setIsUploading(false);
          setUploadProgress(null);
          setError('Upload failed. Please try again.');
          toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload your file.' });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            const mediaCollectionRef = collection(firestore, 'users', userId, 'media');
            const mediaDocData = {
              ownerId: userId,
              fileName: originalFile.name,
              fileType: contentType,
              fileSize: fileToUpload.size,
              storagePath: filePath,
              url: downloadURL,
              createdAt: serverTimestamp(),
            };
            await addDoc(mediaCollectionRef, mediaDocData);

            onUploadComplete(downloadURL, contentType);
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
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
    disabled: isUploading,
  });

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
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

  const handleCrop = async () => {
    if (imgRef.current && crop) {
      const croppedBlob = await getCroppedBlob(imgRef.current, crop);
      if (croppedBlob) {
        setCropModalOpen(false);
        setImgSrc('');
        startUpload(croppedBlob);
      } else {
        toast({variant: 'destructive', title: 'Crop failed', description: 'Could not generate cropped image.'})
      }
    }
  }
  
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (cropConfig?.aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, cropConfig.aspect, width, height), width, height));
    }
  }

  // Preview for existing image
  if (value) {
    return (
      <div {...getRootProps()} className={cn("relative group cursor-pointer", className)}>
        <input {...getInputProps()} />
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
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
            <UploadCloud className="h-8 w-8" />
            <span className="text-sm font-medium mt-1">Change Image</span>
        </div>
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

  // Uploading state
  if (isUploading) {
    return (
      <div className={cn("w-full flex flex-col items-center justify-center border rounded-md p-4", className)}>
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm text-foreground font-semibold mt-4">Uploading...</p>
        <Progress value={uploadProgress} className="w-full max-w-xs mt-2" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className={cn("w-full flex flex-col items-center justify-center border border-destructive rounded-md p-4", className)}>
        <p className="text-sm text-destructive text-center">{error}</p>
        <Button variant="link" size="sm" onClick={() => setError(null)}>Try Again</Button>
      </div>
    );
  }
  
  // Default dropzone view
  return (
    <>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-primary transition-colors',
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

      <Dialog open={isCropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          {imgSrc && (
            <div className="flex justify-center p-4 bg-muted rounded-md">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                aspect={cropConfig?.aspect}
              >
                <img ref={imgRef} alt="Crop preview" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '70vh' }} />
              </ReactCrop>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCropModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCrop}><CropIcon className="mr-2 h-4 w-4" /> Crop & Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
