import { useState } from "react";
import { Download, Share2, Stethoscope, Wind, Droplets, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResult } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ResultsCardProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

export function ResultsCard({ result, isLoading }: ResultsCardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("treatment");

  const handleDownloadPdf = async () => {
    if (!result) return;

    try {
      const response = await apiRequest("POST", "/api/generate-pdf", {
        analysisId: result.id
      });
      
      // Create a download link for the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `bioleaf-report-${result.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Generated",
        description: "Your report has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error generating PDF",
        description: "There was a problem creating your report",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!result) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `BioLeaf Analysis - ${result.disease.name}`,
          text: "Check out this plant disease analysis from BioLeaf",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="leaf-card bg-white dark:bg-gray-800 animate-pulse-slow">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 mb-6 py-8">
            <div className="w-4 h-4 rounded-full bg-primary animate-bounce"></div>
            <div className="w-4 h-4 rounded-full bg-secondary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-4 h-4 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <p className="text-center text-gray-700 dark:text-gray-300">Analyzing your plant image...</p>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="leaf-card bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <svg className="h-24 w-24 text-gray-400 dark:text-gray-500 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.5 9C9.5 8.17 10.17 7.5 11 7.5C11.83 7.5 12.5 8.17 12.5 9C12.5 9.83 11.83 10.5 11 10.5C10.17 10.5 9.5 9.83 9.5 9Z" fill="currentColor"/>
              <path d="M13.75 13H8.25C7.84 13 7.5 13.34 7.5 13.75C7.5 14.16 7.84 14.5 8.25 14.5H13.75C14.16 14.5 14.5 14.16 14.5 13.75C14.5 13.34 14.16 13 13.75 13Z" fill="currentColor"/>
              <path d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12ZM4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12Z" fill="currentColor"/>
            </svg>
            <h3 className="font-heading text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No Results Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">Upload a photo of your plant to get disease detection results and treatment recommendations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to render the appropriate icon based on the icon string
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'healing':
        return <Stethoscope className="text-primary dark:text-secondary mr-3 h-5 w-5" />;
      case 'air':
        return <Wind className="text-primary dark:text-secondary mr-3 h-5 w-5" />;
      case 'water_drop':
        return <Droplets className="text-primary dark:text-secondary mr-3 h-5 w-5" />;
      case 'visibility':
        return <Eye className="text-primary dark:text-secondary mr-3 h-5 w-5" />;
      default:
        return <Stethoscope className="text-primary dark:text-secondary mr-3 h-5 w-5" />;
    }
  };

  return (
    <Card className="leaf-card bg-white dark:bg-gray-800 animate-slide-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl font-semibold text-gray-800 dark:text-gray-200">Analysis Results</h3>
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={handleDownloadPdf} 
              className="bg-accent hover:bg-accent-dark text-primary dark:text-white"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={handleShare} 
              className="bg-secondary hover:bg-secondary-dark text-primary dark:text-white"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="md:w-1/3">
            <img 
              src={result.imageUrl} 
              alt="Analyzed plant" 
              className="w-full h-48 object-cover rounded-lg" 
            />
          </div>
          
          <div className="md:w-2/3">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <h4 className="font-heading font-semibold text-lg text-primary dark:text-white mb-2">
                <span className="text-base mr-1">Plant Name :  </span>  
                {result.disease.name}
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
              <span className="text-lg font-semibold mr-6">Disease : </span> 
              <span className="text-lg font-semibold"> {result.disease.description} </span>
              </p>
              <div className="mt-2 space-x-2 text-orange-600 dark:text-orange-400">
                <span className="text-lg font-semibold">Description:  </span>
                <p className=" text-sm font-medium text-justify my-1">{result.disease.severity}</p>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border-b border-gray-200 dark:border-gray-700 w-full justify-start mb-4 pb-0">
            <TabsTrigger 
              value="treatment" 
              className="text-primary dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 data-[state=active]:border-primary data-[state=active]:dark:border-secondary data-[state=active]:border-b-2 pb-3 px-4 font-medium"
            >
              Treatment
            </TabsTrigger>
            <TabsTrigger 
              value="prevention" 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 data-[state=active]:border-primary data-[state=active]:dark:border-secondary data-[state=active]:border-b-2 pb-3 px-4 font-medium"
            >
              Prevention
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="treatment" className="focus-visible:outline-none focus-visible:ring-0">
            <ul className="space-y-3">
              {result.treatmentOptions.map((option, index) => (
                <li key={index} className="flex items-start bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                  {renderIcon(option.icon)}
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200">{option.title}</h5>
                    <p className="text-gray-600 dark:text-gray-400">{option.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </TabsContent>
          
          <TabsContent value="prevention" className="focus-visible:outline-none focus-visible:ring-0">
            <ul className="space-y-3">
              {result.preventionMeasures.map((measure, index) => (
                <li key={index} className="flex items-start bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                  {renderIcon(measure.icon)}
                  <div>
                    <h5 className="font-medium text-gray-800 dark:text-gray-200">{measure.title}</h5>
                    <p className="text-gray-600 dark:text-gray-400">{measure.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ResultsCard;
