"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { enhancePromptWithAI } from "@/services/content-enhancement.service";

interface PromptEnhancerButtonProps {
  prompt: string;
  onPromptChange: (enhancedPrompt: string) => void;
  context: "image-generation" | "video-generation" | "content-creation";
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export function PromptEnhancerButton({
  prompt,
  onPromptChange,
  context,
  disabled = false,
  size = "sm",
  variant = "outline",
}: PromptEnhancerButtonProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to enhance");
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

        // Limit to 500 characters
        if (enhanced.length > 500) {
          enhanced = enhanced.substring(0, 500).trim();
          // Try to end at a complete word
          const lastSpaceIndex = enhanced.lastIndexOf(" ");
          if (lastSpaceIndex > 400) {
            // Only cut at word boundary if it's not too short
            enhanced = enhanced.substring(0, lastSpaceIndex).trim();
          }
        }

        onPromptChange(enhanced);
        toast.success("Prompt enhanced successfully!");
      } else {
        throw new Error(result.error || "Enhancement failed");
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to enhance prompt";
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
      className="gap-2"
    >
      {isEnhancing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enhancing...
        </>
      ) : (
        <>
          <Wand2 className="h-4 w-4" />
          Enhance with AI
        </>
      )}
    </Button>
  );
}
