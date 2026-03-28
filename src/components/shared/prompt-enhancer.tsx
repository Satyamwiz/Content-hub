"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { enhancePromptWithAI, EnhancementContext } from "@/services/content-enhancement.service";

interface PromptEnhancerButtonProps {
  prompt: string;
  onPromptChange: (enhancedPrompt: string) => void;
  context: EnhancementContext;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  maxLength?: number;
  label?: string;
}

export function PromptEnhancerButton({
  prompt,
  onPromptChange,
  context,
  disabled = false,
  size = "sm",
  variant = "outline",
  maxLength,
  label = "Enhance with AI",
}: PromptEnhancerButtonProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter some text to enhance");
      return;
    }

    setIsEnhancing(true);
    try {
      const result = await enhancePromptWithAI({
        prompt: prompt,
        context: context,
      });

      if (result.success && result.enhanced) {
        let enhanced =
          result.enhanced.enhancedPrompt ||
          result.enhanced.enhancedTitle ||
          prompt;

        // Trim to maxLength if specified
        if (maxLength && enhanced.length > maxLength) {
          enhanced = enhanced.substring(0, maxLength).trim();
          // Try to end at a complete word
          const lastSpaceIndex = enhanced.lastIndexOf(" ");
          if (lastSpaceIndex > maxLength * 0.8) {
            enhanced = enhanced.substring(0, lastSpaceIndex).trim();
          }
        }

        onPromptChange(enhanced);
        toast.success("✨ Enhanced successfully!");
      } else {
        throw new Error(result.error || "Enhancement failed");
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to enhance";
      toast.error(errorMessage);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleEnhancePrompt}
      disabled={disabled || isEnhancing || !prompt.trim()}
      className="gap-2 shrink-0"
    >
      {isEnhancing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enhancing...
        </>
      ) : (
        <>
          <Wand2 className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
