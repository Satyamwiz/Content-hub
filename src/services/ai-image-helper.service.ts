export interface AIImageHelperResponse {
  success: boolean;
  imageBlob?: Blob;
  caption?: string;
  error?: string;
}

export interface AIImageHelperRequest {
  prompt: string;
  image_url?: string;
}

export interface AIGenerateImageRequest {
  prompt: string;
}

export interface AIGenerateImageResponse {
  success: boolean;
  imageBlob?: Blob;
  error?: string;
}

export class AIImageHelperService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      (typeof process !== "undefined" && process.env?.AI_API_URL) ||
      "https://apiimage-441399025512.europe-west1.run.app";
  }

  async processImage(
    request: AIImageHelperRequest
  ): Promise<AIImageHelperResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/create_artisan_post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      console.log(
        "AI API Response status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API Error response:", errorText);
        throw new Error(
          `AI Artisan Post API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      // Get the caption from response headers if available
      const caption = response.headers.get("X-Caption") || undefined;
      const contentType = response.headers.get("Content-Type");

      // Convert the response to a blob (raw image bytes)
      const imageBlob = await response.blob();

      // Validate that we received a valid image
      if (imageBlob.size === 0) {
        throw new Error("AI service returned empty image");
      }

      if (!imageBlob.type.startsWith("image/")) {
        throw new Error(
          `AI service returned invalid content type: ${imageBlob.type}`
        );
      }

      return {
        success: true,
        imageBlob: imageBlob,
        caption: caption,
      };
    } catch (error) {
      console.error("AI Artisan Post error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Create object URL from blob for preview
  blobToObjectURL(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  // Helper method to create a blob from image bytes (for compatibility)
  createImageBlob(
    imageBytes: ArrayBuffer,
    mimeType: string = "image/jpeg"
  ): Blob {
    return new Blob([imageBytes], { type: mimeType });
  }

  // Configure the API base URL at runtime
  setApiUrl(url: string): void {
    this.baseUrl = url;
  }

  // Get the current API URL
  getApiUrl(): string {
    return this.baseUrl;
  }

  // Generate a new image from a text prompt
  async generateImage(
    request: AIGenerateImageRequest
  ): Promise<AIGenerateImageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate_image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Image generation API error:", errorText);
        throw new Error(
          `Image generation failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      // Convert the response to a blob (raw image bytes)
      const imageBlob = await response.blob();

      // Validate that we received a valid image
      if (imageBlob.size === 0) {
        throw new Error("AI service returned empty image");
      }

      if (!imageBlob.type.startsWith("image/")) {
        throw new Error(
          `AI service returned invalid content type: ${imageBlob.type}`
        );
      }

      return {
        success: true,
        imageBlob: imageBlob,
      };
    } catch (error) {
      console.error("Image generation error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

// Export singleton instance
export const aiImageHelperService = new AIImageHelperService();
