"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTutorial } from "./tutorial-context";
import { TutorialPage } from "./tutorial-store";

interface TutorialButtonProps {
  page: TutorialPage;
  showIcon?: boolean;
  label?: string;
  className?: string;
  [key: string]: any; // Allow any other props to pass through
}

export function TutorialButton({
  page,
  showIcon = true,
  label = "Tutorial",
  className,
  ...props
}: TutorialButtonProps) {
  const { startPageTutorial, isPageTutorialAvailable, hasCompletedTutorial } = useTutorial();
  
  // Don't render if no tutorial is available for this page
  if (!isPageTutorialAvailable(page)) {
    return null;
  }
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => startPageTutorial(page)}
      className={cn(
        "gap-1.5",
        hasCompletedTutorial(page) ? "text-muted-foreground" : "text-primary",
        className
      )}
      {...props}
    >
      {showIcon && <HelpCircle className="h-4 w-4" />}
      {label}
      {hasCompletedTutorial(page) && (
        <span className="text-xs text-muted-foreground">(viewed)</span>
      )}
    </Button>
  );
}