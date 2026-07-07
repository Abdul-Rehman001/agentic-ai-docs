"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProgressContextType {
  completedModules: string[];
  toggleModule: (slug: string) => void;
  isCompleted: (slug: string) => boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from local storage on mount
    const stored = localStorage.getItem('agentic-ai-progress');
    if (stored) {
      try {
        setCompletedModules(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse progress");
      }
    }
    setIsLoaded(true);
  }, []);

  const toggleModule = (slug: string) => {
    setCompletedModules((prev) => {
      const isDone = prev.includes(slug);
      const updated = isDone ? prev.filter(m => m !== slug) : [...prev, slug];
      localStorage.setItem('agentic-ai-progress', JSON.stringify(updated));
      return updated;
    });
  };

  const isCompleted = (slug: string) => completedModules.includes(slug);

  // We must always wrap children in the Provider, even during SSR/initial hydration
  return (
    <ProgressContext.Provider value={{ completedModules, toggleModule, isCompleted }}>
      <div className={isLoaded ? "contents" : "invisible"}>
        {children}
      </div>
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
