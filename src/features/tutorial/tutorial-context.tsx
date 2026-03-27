"use client";

import React, { createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTutorialStore, TutorialPage } from "./tutorial-store";
import { tutorialSteps } from "./tutorial-steps";

interface TutorialContextType {
  startPageTutorial: (page: TutorialPage) => void;
  isPageTutorialAvailable: (page: TutorialPage) => boolean;
  hasCompletedTutorial: (page: TutorialPage) => boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

const pathToPage: Record<string, TutorialPage> = {
  "/dashboard": "dashboard",
  "/studio": "studio",
  "/settings": "settings",
  "/scheduler": "scheduler",
  "/voiceovers": "voiceovers",
  "/ai-video": "ai-video",
};

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    enabled,
    activePage,
    completedPages,
    dismissedGlobally,
    startTutorial,
  } = useTutorialStore();

  const startPageTutorial = (page: TutorialPage) => {
    startTutorial(page);
  };

  const isPageTutorialAvailable = (page: TutorialPage) => {
    return Boolean(tutorialSteps[page]?.length);
  };

  const hasCompletedTutorial = (page: TutorialPage) => {
    return completedPages.includes(page);
  };

  // Auto-start tutorial for the current page if enabled and not completed
  useEffect(() => {
    if (!enabled || dismissedGlobally || activePage) return;

    // Extract the base path (without query params)
    const basePath = pathname.split("?")[0];

    // Try to match the current path to a tutorial page
    const currentPage = pathToPage[basePath];

    // If we're on a page with a tutorial and haven't completed it yet, start it
    if (
      currentPage &&
      !completedPages.includes(currentPage) &&
      isPageTutorialAvailable(currentPage)
    ) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        startTutorial(currentPage);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [pathname, enabled, dismissedGlobally, activePage, completedPages]);

  return (
    <TutorialContext.Provider
      value={{
        startPageTutorial,
        isPageTutorialAvailable,
        hasCompletedTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
};
