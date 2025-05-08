import { X, Trash2, Trash } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useHistory } from "@/hooks/use-history";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onHistoryItemClick: (id: number) => void;
}

export function HistoryDrawer({ isOpen, onClose, onHistoryItemClick }: HistoryDrawerProps) {
  const { history, clearHistory, removeFromHistory } = useHistory();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low':
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case 'Moderate':
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
      case 'Severe':
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case 'Healthy':
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      default:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-heading text-2xl font-bold text-primary dark:text-secondary">
            Analysis History
          </SheetTitle>
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </SheetHeader>

        {history.length > 0 && (
          <div className="mb-4">
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full flex items-center justify-center"
              onClick={clearHistory}
            >
              <Trash className="mr-2 h-4 w-4" />
              Clear All History
            </Button>
          </div>
        )}

        <div className="overflow-y-auto h-[calc(100vh-160px)]">
          {history.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No history available yet</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id} 
                className="mb-6 leaf-card p-4 bg-gray-50 dark:bg-gray-700/30 hover:shadow-md transition-shadow relative"
              >
                <div 
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => onHistoryItemClick(item.id)}
                >
                  <img 
                    src={item.imageUrl} 
                    className="w-20 h-20 object-cover rounded-lg" 
                    alt={`${item.disease.name} plant image`} 
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">{item.disease.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(new Date(item.analyzedAt))}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className={cn(
                        "px-2 py-0.5 text-xs rounded-full",
                        getSeverityColor(item.disease.severity)
                      )}>
                        {item.disease.severity}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Delete button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(item.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default HistoryDrawer;
