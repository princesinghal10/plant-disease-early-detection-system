import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AnalysisResult } from "@/lib/types";
import { useHistory } from "@/hooks/use-history";
import { useToast } from "@/hooks/use-toast";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ImageUpload from "@/components/image-upload";
import CameraModal from "@/components/camera-modal";
import ResultsCard from "@/components/results-card";
import HistoryDrawer from "@/components/history-drawer";
import { CheckCircle } from "lucide-react";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<{ file: File; base64: string } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  
  const { history, addToHistory, getHistoryItem } = useHistory();
  const { toast } = useToast();

  const analysisMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest("POST", "/api/analyze", { image: imageData });
      return await response.json();
    },
    onSuccess: (data: AnalysisResult) => {
      setAnalysisResult(data);
      addToHistory({
        id: data.id,
        imageUrl: data.imageUrl,
        disease: data.disease,
        analyzedAt: data.analyzedAt
      });

      toast({
        title: "Analysis Complete",
        description: `Detected: ${data.disease.name}`,
      });
    },
    onError: (error) => {
      // Get the detailed error message if available
      let errorMessage = "There was an error analyzing your image.";
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      } else if (typeof error === 'object' && error !== null) {
        // Handle API errors that might be in a different format
        const apiError = error as any;
        if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.data?.message) {
          errorMessage = apiError.data.message;
        }
      }
      
      toast({
        title: "Analysis Failed",
        description: `${errorMessage} Please try again.`,
        variant: "destructive",
      });
      console.error("Analysis error:", error);
      
      // Clear the selected image to allow for a new attempt
      setSelectedImage(null);
    },
  });

  const handleImageSelected = (file: File, base64: string) => {
    console.log(`Image selected: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    // If we receive an empty file or empty base64, it means we're clearing the image
    if (file.size === 0 || !base64) {
      console.log("Clearing selected image");
      setSelectedImage(null);
      return;
    }
    
    // Validate the image data before setting
    if (file.size < 100) { // Very small file, likely an error
      console.error("Received very small file");
      toast({
        title: "Image Error",
        description: "Failed to process the captured image. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    if (!base64.startsWith('data:')) {
      console.error("Invalid base64 image data");
      toast({
        title: "Image Error",
        description: "Invalid image format. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Set the selected image in state - this will be passed to ImageUpload component
    setSelectedImage({ file, base64 });
    
    // Notify user that image was successfully captured
    toast({
      title: "Image Ready",
      description: "Image captured successfully. Click 'Analyze Plant' to proceed.",
    });
  };

  const handleAnalyzeClick = () => {
    if (selectedImage) {
      analysisMutation.mutate(selectedImage.base64);
    }
  };

  const handleHistoryItemClick = (id: number) => {
    const item = getHistoryItem(id);
    if (item) {
      // Retrieve the full analysis from the API
      apiRequest("GET", `/api/history/${id}`)
        .then(res => res.json())
        .then((data: AnalysisResult) => {
          setAnalysisResult(data);
          setHistoryOpen(false);
        })
        .catch(error => {
          console.error("Error fetching history item:", error);
          toast({
            title: "Error",
            description: "Could not retrieve analysis history",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight dark:bg-bgDark text-textDark dark:text-textLight">
      <Header onHistoryClick={() => setHistoryOpen(true)} />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl flex-grow">
        <main className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Upload Section */}
          <section className="lg:w-1/2 space-y-6">
            {/* Intro Text */}
            <div className="animate-slide-in">
              <h2 className="font-heading text-3xl font-bold text-primary dark:text-secondary-light mb-2">
                Plant Disease Detection
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Upload or capture an image of your plant to identify diseases and get treatment recommendations.
              </p>
            </div>

            {/* Image Upload Card */}
            <ImageUpload 
              onImageSelected={handleImageSelected} 
              onAnalyzeClick={handleAnalyzeClick}
              onCameraOpen={() => setCameraOpen(true)}
              selectedImage={selectedImage}
            />
            
            {/* Tips & Instructions */}
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-6 animate-slide-in">
              <h3 className="font-heading text-lg font-semibold mb-3 text-primary dark:text-secondary-light">
                Tips for Better Results
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <CheckCircle className="text-green-600 dark:text-green-400 mr-2 mt-0.5 h-5 w-5" />
                  <span>Ensure good lighting for clear images</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-600 dark:text-green-400 mr-2 mt-0.5 h-5 w-5" />
                  <span>Focus on affected areas of the plant</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-600 dark:text-green-400 mr-2 mt-0.5 h-5 w-5" />
                  <span>Include both healthy and diseased parts for comparison</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-green-600 dark:text-green-400 mr-2 mt-0.5 h-5 w-5" />
                  <span>Avoid shadows or glare on the leaves</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Right Side - Results Section */}
          <section className="lg:w-1/2 space-y-6">
            <ResultsCard 
              result={analysisResult} 
              isLoading={analysisMutation.isPending}
            />
          </section>
        </main>
      </div>
      
      <Footer />
      
      {/* Camera Modal */}
      <CameraModal 
        isOpen={cameraOpen} 
        onClose={() => setCameraOpen(false)}
        onCapture={handleImageSelected}
      />
      
      {/* History Drawer */}
      <HistoryDrawer 
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onHistoryItemClick={handleHistoryItemClick}
      />
    </div>
  );
}
