import React, { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";
import { Camera, X, Upload, Image as ImageIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fileToBase64 } from "@/lib/utils";

interface ImageUploadProps {
  onImageSelected: (file: File, base64: string) => void;
  onAnalyzeClick: () => void;
  onCameraOpen: () => void;
  selectedImage?: { file: File; base64: string } | null;
}

export function ImageUpload({ 
  onImageSelected, 
  onAnalyzeClick, 
  onCameraOpen, 
  selectedImage 
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Update preview when selectedImage prop changes
  useEffect(() => {
    if (selectedImage && selectedImage.base64) {
      setPreview(selectedImage.base64);
    }
  }, [selectedImage]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setPreview(base64);
      onImageSelected(file, base64);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const base64 = await fileToBase64(file);
      setPreview(base64);
      onImageSelected(file, base64);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Create a minimal empty image to clear the parent's state
    const emptyFile = new File([new Uint8Array(0)], 'empty.jpg', { type: 'image/jpeg' });
    onImageSelected(emptyFile, '');
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="leaf-card bg-white dark:bg-gray-800">
      <CardContent className="p-6">
        <h3 className="font-heading text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Upload Image</h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging 
              ? "border-primary dark:border-secondary" 
              : "border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-secondary"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="mb-4 relative">
              <img 
                src={preview} 
                alt="Plant preview" 
                className="max-h-64 mx-auto rounded-lg"
              />
              <Button 
                size="icon" 
                variant="destructive" 
                className="absolute top-2 right-2 rounded-full p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                Drag and drop an image here or click to browse
              </p>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button 
            className="flex-1 bg-primary hover:bg-primary-dark dark:text-white text-white"
            onClick={onCameraOpen}
          >
            <Camera className="mr-2 h-4 w-4" />
            <span>Take Photo</span>
          </Button>
          
          <Button 
            className="flex-1 bg-green-700 hover:bg-green-800 dark:bg-secondary dark:hover:bg-secondary-dark text-white"
            onClick={handleGalleryClick}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            <span>Gallery</span>
          </Button>
        </div>
        
        {preview && (
          <div className="mt-6">
            <Button 
              className="w-full bg-accent hover:bg-accent-dark text-primary dark:text-white"
              onClick={onAnalyzeClick}
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Analyze Plant</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ImageUpload;
