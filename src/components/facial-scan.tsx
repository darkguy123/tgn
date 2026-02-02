'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Camera, Check, Loader2, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface FacialScanProps {
  onComplete: (results: {
    faceScanFrontUrl: string;
    faceScanLeftUrl: string;
    faceScanRightUrl: string;
    faceScanSmileUrl: string;
  }) => void;
  onCancel: () => void;
}

type ScanStep = 'permission' | 'front' | 'left' | 'right' | 'smile' | 'saving';

const steps: Exclude<ScanStep, 'permission' | 'saving'>[] = ['front', 'left', 'right', 'smile'];

const instructionMap: Record<Exclude<ScanStep, 'permission' | 'saving'>, string> = {
    front: 'Position your face in the center of the frame.',
    left: 'Slowly turn your head to your left.',
    right: 'Great. Now, turn your head to your right.',
    smile: 'Perfect. Finally, face forward and smile!',
};


export function FacialScan({ onComplete, onCancel }: FacialScanProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [feedbackText, setFeedbackText] = useState('Requesting camera access...');
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        setFeedbackText(instructionMap[steps[0]]);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setFeedbackText('Camera access is required for verification.');
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to continue.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleCapture = () => {
    // Simulate capture
    if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        setFeedbackText(instructionMap[steps[currentStepIndex + 1]]);
    } else {
        setFeedbackText('Processing...');
        setTimeout(() => {
            // In a real app, these URLs would come from uploading the captured frames to storage.
            onComplete({
                faceScanFrontUrl: 'https://placehold.co/400x400/blue/white?text=Front',
                faceScanLeftUrl: 'https://placehold.co/400x400/green/white?text=Left',
                faceScanRightUrl: 'https://placehold.co/400x400/orange/white?text=Right',
                faceScanSmileUrl: 'https://placehold.co/400x400/purple/white?text=Smile',
            });
        }, 2000);
    }
  };
  
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const isSaving = feedbackText === 'Processing...';

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold">Facial Verification</h1>
        <p className="text-muted-foreground">{feedbackText}</p>
      </div>

      <div className="my-8 relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-8 border-muted overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay muted playsInline />
        </div>
        <div className="absolute inset-0 rounded-full" style={{
            background: `radial-gradient(circle, transparent 65%, hsla(var(--background), 0.8) 80%)`,
        }}/>
      </div>

      {hasCameraPermission === false && (
         <Alert variant="destructive" className="max-w-md">
            <AlertTitle>Camera Required</AlertTitle>
            <AlertDescription>
                Could not access your camera. Please check your browser permissions and try again.
            </AlertDescription>
         </Alert>
      )}
      
      {hasCameraPermission === true && (
        <div className="flex flex-col items-center gap-4 max-w-md w-full">
            <Progress value={isSaving ? 100 : progress} className="w-full h-2" />
            {!isSaving ? (
                <Button size="lg" className="rounded-full h-16 w-16" onClick={handleCapture}>
                    <Camera className="h-8 w-8" />
                </Button>
            ) : (
                <div className="flex items-center gap-2 text-primary">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Analyzing...</span>
                </div>
            )}
        </div>
      )}

      <div className="absolute top-4 left-4">
        <Button variant="ghost" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
      </div>
    </div>
  );
}
