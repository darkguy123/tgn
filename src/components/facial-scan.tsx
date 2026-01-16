'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Camera, Check, Loader2, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface FacialScanProps {
  onComplete: () => void;
  onCancel: () => void;
}

type ScanStep = 'permission' | 'front' | 'left' | 'right' | 'saving' | 'completed';

const HeadScanIcon = ({ direction, progress }: { direction: 'front' | 'left' | 'right'; progress: number }) => {
    const rotation = {
      front: 0,
      left: -30,
      right: 30,
    };
  
    return (
      <div className="relative h-48 w-48">
        <svg viewBox="0 0 100 100" className="h-full w-full text-muted-foreground/30 drop-shadow-lg">
          {/* Head Outline */}
          <path d="M 50,10 A 40,45 0 1,1 50,90 A 40,45 0 1,1 50,10 Z" fill="hsl(var(--muted))" />
          {/* Face Elements */}
          <g style={{ transform: `rotateY(${rotation[direction]}deg)`, transformOrigin: '50% 50%', transition: 'transform 0.5s ease' }}>
            <circle cx="50" cy="50" r="40" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" className="opacity-0" />
            {/* Eye brows */}
            <path d="M 35 38 Q 40 33, 45 38" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 55 38 Q 60 33, 65 38" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="40" cy="45" r="2" fill="hsl(var(--foreground))" />
            <circle cx="60" cy="45" r="2" fill="hsl(var(--foreground))" />
            {/* Nose */}
            <path d="M 50 48 L 48 60 L 52 60 Z" fill="hsl(var(--foreground))" opacity="0.5" />
            {/* Mouth */}
            <path d="M 40 70 Q 50 75, 60 70" stroke="hsl(var(--foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        </svg>
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="50"
            cy="50"
            r="48"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            fill="none"
            strokeDasharray={2 * Math.PI * 48}
            strokeDashoffset={(2 * Math.PI * 48) * (1 - progress / 100)}
            className="transition-all duration-500"
          />
        </svg>
      </div>
    );
  };

export function FacialScan({ onComplete, onCancel }: FacialScanProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scanStep, setScanStep] = useState<ScanStep>('permission');
  const [feedbackText, setFeedbackText] = useState('Requesting camera access...');
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        setFeedbackText('Position your face in the center.');
        setScanStep('front');
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
    setFeedbackText('Great!');
    setTimeout(() => {
      if (scanStep === 'front') {
        setScanStep('left');
        setFeedbackText('Now, slowly turn your head to the left.');
      } else if (scanStep === 'left') {
        setScanStep('right');
        setFeedbackText('Excellent. Now, turn your head to the right.');
      } else if (scanStep === 'right') {
        setScanStep('saving');
        setFeedbackText('Processing...');
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }, 1500);
  };
  
  const progress = scanStep === 'front' ? 33 : scanStep === 'left' ? 66 : scanStep === 'right' ? 100 : 0;
  const direction = scanStep === 'left' ? 'left' : scanStep === 'right' ? 'right' : 'front';

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
            <Progress value={progress} className="w-full h-2" />
            {scanStep !== 'saving' && scanStep !== 'permission' && (
                <Button size="lg" className="rounded-full h-16 w-16" onClick={handleCapture}>
                    <Camera className="h-8 w-8" />
                </Button>
            )}
             {scanStep === 'saving' && (
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
