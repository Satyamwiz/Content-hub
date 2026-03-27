"use client";

import React from "react";
import { TutorialProvider } from "./tutorial-context";
import { TutorialGuide } from "./tutorial-guide";
import { useTutorialStore } from "./tutorial-store";

export function TutorialWrapper({ children }: { children: React.ReactNode }) {
  const { activePage } = useTutorialStore();

  return (
    <TutorialProvider>
      {/* Regular app content */}
      {children}

      {/* Tutorial overlay, only shown when active */}
      {activePage && <TutorialGuide />}
    </TutorialProvider>
  );
}
