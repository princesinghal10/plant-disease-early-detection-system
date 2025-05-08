import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { HistoryItem } from "../lib/types";

interface HistoryContextType {
  history: HistoryItem[];
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  removeFromHistory: (id: number) => void;
  getHistoryItem: (id: number) => HistoryItem | undefined;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }): JSX.Element {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const savedHistory = localStorage.getItem("history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  const addToHistory = (item: HistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeFromHistory = (id: number) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const getHistoryItem = (id: number) => {
    return history.find(item => item.id === id);
  };

  return (
    <HistoryContext.Provider value={{ 
      history, 
      addToHistory, 
      clearHistory, 
      removeFromHistory,
      getHistoryItem 
    }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}