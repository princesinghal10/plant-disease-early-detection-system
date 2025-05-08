import { useRef, useState, useEffect } from "react";
import { Camera, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { dataURLtoFile } from "@/lib/utils";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, base64: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      initCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const initCamera = async () => {
    try {
      setIsLoading(true);
      setCameraError(null);
      
      // First check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Media devices API not supported in this browser");
        setCameraError("Camera access is not supported by your browser. Please try another browser.");
        setIsLoading(false);
        return;
      }
      
      // Request camera access with both environment and user options
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => {
            console.error("Error playing video:", err);
            setCameraError("Error starting video stream. Please try again.");
            setIsLoading(false);
          });
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Cannot access your camera. Please check your permissions and try again.");
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) {
      console.error("No video reference available");
      return;
    }

    try {
      // Make sure the video is playing and has dimensions
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        console.error("Video dimensions not available");
        return;
      }

      const canvas = document.createElement('canvas');
      // Set dimensions explicitly from video element
      const width = videoRef.current.videoWidth;
      const height = videoRef.current.videoHeight;
      
      console.log(`Capturing photo with dimensions: ${width}x${height}`);
      
      canvas.width = width;
      canvas.height = height;
      
      const context = canvas.getContext('2d');
      if (!context) {
        console.error("Could not get canvas context");
        return;
      }
      
      // Capture the current frame from the video
      context.drawImage(videoRef.current, 0, 0, width, height);
      
      // Convert to data URL with high quality
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      // Make sure we got a valid data URL
      if (!dataUrl || dataUrl === 'data:,') {
        console.error("Failed to generate data URL from canvas");
        return;
      }
      
      // Convert data URL to File object
      const file = dataURLtoFile(dataUrl, 'camera-capture.jpg');
      
      console.log("Photo captured successfully");
      
      // First close the modal, then handle the captured image
      // This ensures the video stream is stopped before processing the image
      onClose();
      
      // Small delay to ensure modal is closed before processing image
      setTimeout(() => {
        onCapture(file, dataUrl);
      }, 100);
    } catch (error) {
      console.error("Error capturing photo:", error);
      setCameraError("Failed to capture photo. Please try again.");
    }
  };

  // Track loading state for camera initialization
  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Update loading state when camera initializes
  useEffect(() => {
    if (stream) {
      setIsLoading(false);
      setCameraError(null);
    }
  }, [stream]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-semibold text-gray-800 dark:text-gray-200">
            Take a Photo
          </DialogTitle>
          {cameraError && (
            <DialogDescription className="text-red-500">
              {cameraError}
            </DialogDescription>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
              <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-primary animate-spin mb-2"></div>
              <p>Accessing camera...</p>
            </div>
          )}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        </div>
        
        <div className="flex justify-center mt-4">
          <Button 
            className="bg-primary hover:bg-primary-dark dark:text-white text-white"
            onClick={capturePhoto}
            disabled={isLoading || !!cameraError}
          >
            <Camera className="mr-2 h-4 w-4" />
            <span>Capture</span>
          </Button>
        </div>
        
        <div className="text-xs text-center text-gray-500 mt-2">
          For best results, ensure good lighting and hold the camera steady
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CameraModal;
