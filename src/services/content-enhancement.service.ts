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

interface PromptEnhancementRequest {
  prompt: string;
  context: "image-generation" | "video-generation" | "content-creation";
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
 * @param request - Prompt and context information
 * @returns Enhanced prompt optimized for the specific use case
 */
export async function enhancePromptWithAI(
  request: PromptEnhancementRequest
): Promise<PromptEnhancementResponse> {
  try {
    const contextPrompts = {
      "image-generation": `You are an expert prompt engineer for AI image generation. Enhance this prompt to create more detailed, visually compelling, and technically precise descriptions for AI image generation. Focus on:

- Visual details (lighting, composition, colors, style)
- Artistic techniques and mediums  
- Mood and atmosphere
- Technical camera settings if applicable
- Art styles and influences

Original prompt: "${request.prompt}"

Provide an enhanced version that will generate better AI images. Respond with only the enhanced prompt in this JSON format:
{
  "enhancedPrompt": "enhanced prompt here"
}`,

      "video-generation": `You are an expert prompt engineer for AI video generation. Enhance this prompt to create more dynamic, cinematic, and engaging descriptions for AI video generation. Focus on:

- Camera movements and angles
- Scene dynamics and transitions  
- Visual storytelling elements
- Lighting and cinematography
- Action sequences and timing
- Style and genre elements

Original prompt: "${request.prompt}"

Provide an enhanced version that will generate better AI videos. Respond with only the enhanced prompt in this JSON format:
{
  "enhancedPrompt": "enhanced prompt here"
}`,

      "content-creation": `You are an expert content creator and copywriter. Enhance this prompt to be more engaging, clear, and effective. Focus on:

- Clarity and specificity
- Emotional engagement
- Call-to-action elements
- Target audience appeal
- Brand voice consistency
- SEO and discoverability

Original prompt: "${request.prompt}"

Provide an enhanced version that will be more effective for content creation. Respond with only the enhanced prompt in this JSON format:
{
  "enhancedPrompt": "enhanced prompt here"
}`,
    };

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
        enhancementPrompt: contextPrompts[request.context],
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
