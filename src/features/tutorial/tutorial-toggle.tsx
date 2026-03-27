"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HelpCircle, Book, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useTutorialStore } from "./tutorial-store";
import { useTutorial } from "./tutorial-context";

export function TutorialToggle() {
  const {
    enabled,
    dismissedGlobally,
    enableTutorials,
    dismissTutorials,
    resetTutorial,
    completedPages,
  } = useTutorialStore();

  const { startPageTutorial } = useTutorial();

  const currentPath =
    typeof window !== "undefined"
      ? window.location.pathname.split("?")[0]
      : "/dashboard";

  // Map path to tutorial page type
  const getCurrentPage = () => {
    const pathSegments = currentPath.split("/");
    const mainPath = pathSegments[1] || "dashboard";

    if (mainPath === "dashboard") return "dashboard";
    if (mainPath === "studio") return "studio";
    if (mainPath === "settings") return "settings";
    if (mainPath === "scheduler") return "scheduler";
    if (mainPath === "voiceovers") return "voiceovers";
    if (mainPath === "ai-video") return "ai-video";
    return "dashboard";
  };

  const currentPage = getCurrentPage();
  const hasCompletedCurrentPage = completedPages.includes(currentPage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => startPageTutorial(currentPage)}
          className="flex items-center gap-2"
        >
          <Book className="h-4 w-4" />
          {hasCompletedCurrentPage
            ? "Restart current page tutorial"
            : "Start page tutorial"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {enabled ? (
          <DropdownMenuItem
            onClick={() => dismissTutorials()}
            className="flex items-center gap-2"
          >
            <EyeOff className="h-4 w-4" />
            Disable all tutorials
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => enableTutorials()}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Enable tutorials
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => resetTutorial()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset all tutorials
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
