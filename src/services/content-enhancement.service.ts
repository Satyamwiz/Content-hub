// Gemini AI Content Enhancement Service

interface ContentEnhancementRequest {
  title: string;
  description: string;
  tags: string;
  videoFileName?: string;
  context?: string;
}

interface ContentEnhancementResponse {
  success: boolean;
  enhancedTitle: string;
  enhancedDescription: string;
  enhancedTags: string;
  error?: string;
}

export type EnhancementContext =
  | "image-generation"
  | "video-generation"
  | "content-creation"
  | "instagram-caption"
  | "reel-script"
  | "voiceover-script"
  | "poem"
  | "youtube-title"
  | "youtube-description";

interface PromptEnhancementRequest {
  prompt: string;
  context: EnhancementContext;
}

interface PromptEnhancementResponse {
  success: boolean;
  enhanced?: {
    enhancedPrompt?: string;
    enhancedTitle?: string;
  };
  error?: string;
}

/**
 * Enhance YouTube video content using Gemini AI
 * @param content - Original title, description, and tags
 * @returns Enhanced content optimized for YouTube
 */
export async function enhanceContentWithAI(
  content: ContentEnhancementRequest
): Promise<ContentEnhancementResponse> {
  try {
    const response = await fetch("/api/enhance-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to enhance content");
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Content enhancement error:", error);
    return {
      success: false,
      enhancedTitle: content.title,
      enhancedDescription: content.description,
      enhancedTags: content.tags,
      error: error.message || "Failed to enhance content",
    };
  }
}

/**
 * Generate content suggestions based on video file name only
 * @param fileName - Video file name
 * @returns AI-generated content suggestions
 */
export async function generateContentFromFileName(
  fileName: string
): Promise<ContentEnhancementResponse> {
  const baseTitle = fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return enhanceContentWithAI({
    title: baseTitle,
    description: "",
    tags: "",
    videoFileName: fileName,
    context: "generate_from_filename",
  });
}

/**
 * Enhance prompts for different AI generation contexts
 * Uses platform-specific system prompts for each context
 * @param request - Prompt and context information
 * @returns Enhanced prompt optimized for the specific platform/use case
 */
export async function enhancePromptWithAI(
  request: PromptEnhancementRequest
): Promise<PromptEnhancementResponse> {
  try {
    const response = await fetch("/api/enhance-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: request.prompt,
        description: "",
        tags: "",
        context: "enhance_prompt",
        promptContext: request.context,
        // No enhancementPrompt — let the server use its built-in system prompts
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Prompt enhancement error:", error);

    let errorMessage = "Failed to enhance prompt";

    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message.includes("401")) {
        errorMessage =
          "Authentication failed. Please check your API configuration.";
      } else if (error.message.includes("429")) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      } else if (error.message.includes("500")) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Generate a Gemini-powered caption for an image
 * @param prompt - The image prompt or description
 * @param platform - Target platform for caption style
 * @returns AI-generated caption
 */
export async function generateCaptionWithAI(
  prompt: string,
  platform: "instagram" | "general" = "instagram"
): Promise<string> {
  try {
    const result = await enhancePromptWithAI({
      prompt: `Generate a ${platform === "instagram" ? "compelling Instagram" : "engaging"} caption for an image described as: "${prompt}". Include relevant hashtags.`,
      context: platform === "instagram" ? "instagram-caption" : "content-creation",
    });

    if (result.success && result.enhanced) {
      return result.enhanced.enhancedPrompt || result.enhanced.enhancedTitle || prompt;
    }

    throw new Error(result.error || "Failed to generate caption");
  } catch (error) {
    console.error("Caption generation error:", error);
    // Return a fallback template caption
    return `✨ ${prompt} ✨\n\n#aiart #digitalcreative #contentcreator`;
  }
}
