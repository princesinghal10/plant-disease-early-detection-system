import { LeafIcon } from "@/components/ui/leaf-icon";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, History } from "lucide-react";

interface HeaderProps {
  onHistoryClick: () => void;
}

export function Header({ onHistoryClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <LeafIcon className="h-10 w-10 text-primary" />
          <h1 className="font-heading text-primary dark:text-secondary-light text-2xl font-bold ml-2">BioLeaf</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onHistoryClick}
            className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary"
          >
            <History className="h-5 w-5" />
            <span className="ml-1 hidden md:inline">History</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-secondary"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
