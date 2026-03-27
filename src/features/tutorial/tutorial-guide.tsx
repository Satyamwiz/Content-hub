"use client";

import React, { useState, useEffect, useRef } from "react";
import { animate } from "motion";
import { useTutorialStore } from "./tutorial-store";
import { tutorialSteps } from "./tutorial-steps";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";

export function TutorialGuide() {
  const {
    activePage,
    currentStep,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
  } = useTutorialStore();

  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [animating, setAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Get steps for current page
  const steps = activePage ? tutorialSteps[activePage] : [];
  const currentStepData = steps[currentStep];

  // Position the tooltip relative to the target element
  useEffect(() => {
    if (!activePage || !currentStepData) return;

    const positionTooltip = () => {
      setAnimating(true);

      if (
        !currentStepData.elementSelector ||
        currentStepData.placement === "center"
      ) {
        // Center in the viewport
        setPosition({
          top: window.innerHeight / 2 - 150,
          left: window.innerWidth / 2 - 200,
        });
        return;
      }

      // Find the target element
      let targetElement = null;
      try {
        targetElement = currentStepData.elementSelector
          ? document.querySelector(currentStepData.elementSelector)
          : null;
      } catch (error) {
        console.warn(
          `Invalid selector: ${currentStepData.elementSelector}`,
          error
        );
      }

      if (!targetElement && currentStepData.elementSelector) {
        console.warn(`Element not found: ${currentStepData.elementSelector}`);
        // Default to center placement if element not found
        setPosition({
          top: window.innerHeight / 2 - 150,
          left: window.innerWidth / 2 - 200,
        });
        return;
      }

      const rect = targetElement ? targetElement.getBoundingClientRect() : null;
      if (!rect) {
        // If we somehow don't have a rect, center the tooltip
        setPosition({
          top: window.innerHeight / 2 - 150,
          left: window.innerWidth / 2 - 200,
        });
        return;
      }
      const tooltipWidth = 400;
      const tooltipHeight = 200;
      const margin = 20;

      let top = 0;
      let left = 0;

      // Position based on placement
      switch (currentStepData.placement) {
        case "top":
          top = rect.top - tooltipHeight - margin;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + margin;
          break;
        case "bottom":
          top = rect.bottom + margin;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - margin;
          break;
      }

      // Ensure tooltip stays within viewport
      top = Math.max(
        20,
        Math.min(window.innerHeight - tooltipHeight - 20, top)
      );
      left = Math.max(
        20,
        Math.min(window.innerWidth - tooltipWidth - 20, left)
      );

      setPosition({ top, left });

      // Highlight the element with an overlay
      if (overlayRef.current && targetElement && rect) {
        const overlay = overlayRef.current;
        overlay.style.top = `${rect.top}px`;
        overlay.style.left = `${rect.left}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        overlay.style.display = "block";

        // Animate the highlight
        // animate(
        //   overlay,
        //   { scale: [0.95, 1], opacity: [0, 1] },
        //   { duration: 0.3, easing: [0.4, 0, 0.2, 1] }
        // );
      } else if (overlayRef.current) {
        // Hide the overlay if no element to highlight
        overlayRef.current.style.display = "none";
      }
    };

    positionTooltip();

    // Also position on window resize
    window.addEventListener("resize", positionTooltip);
    return () => window.removeEventListener("resize", positionTooltip);
  }, [activePage, currentStep, currentStepData]);

  // Animate tooltip entry
  //   useEffect(() => {
  //     if (tooltipRef.current && animating) {
  //       animate(
  //         tooltipRef.current,
  //         // { opacity: [0, 1], y: [10, 0] },
  //         { duration: 0.3, easing: [0.4, 0, 0.2, 1] }
  //       ).then(() => setAnimating(false));
  //     }
  //   }, [position, animating]);

  // Handle next/back/skip
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      nextStep();
    } else {
      completeTutorial();
    }
  };

  const handleBack = () => {
    prevStep();
  };

  if (!activePage || !currentStepData) {
    return null;
  }

  return (
    <>
      {/* Dimmed background */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => skipTutorial()}
      />

      {/* Element highlight overlay */}
      <div
        ref={overlayRef}
        className="fixed z-50 pointer-events-none rounded-md ring-2 ring-primary ring-offset-2"
        style={{ display: currentStepData.elementSelector ? "block" : "none" }}
      />

      {/* Tutorial tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 w-[400px] shadow-xl"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                {currentStepData.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => skipTutorial()}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {currentStepData.content}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between pt-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <span className="text-xs text-muted-foreground">
                {currentStep + 1} of {steps.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => skipTutorial()}
              >
                Skip
              </Button>

              <Button variant="default" size="sm" onClick={handleNext}>
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  "Got it!"
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
