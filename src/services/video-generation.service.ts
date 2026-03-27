const API_BASE_URL =
  "https://video-generation-orchestrator-441399025512.europe-west4.run.app";

export interface VideoGenerationApiResponse {
  message: string;
  video_url: string;
  video_uri: string;
  prompt: string;
}

export interface VideoGenerationApiRequest {
  image: File;
  prompt: string;
}

export class VideoGenerationService {
  private static instance: VideoGenerationService;

  private constructor() {}

  public static getInstance(): VideoGenerationService {
    if (!VideoGenerationService.instance) {
      VideoGenerationService.instance = new VideoGenerationService();
    }
    return VideoGenerationService.instance;
  }

  async generateVideo(
    request: VideoGenerationApiRequest
  ): Promise<VideoGenerationApiResponse> {
    try {
      console.log("🚀 Starting video generation with fetch...");

      const formData = new FormData();
      formData.append("image", request.image);
      formData.append("prompt", request.prompt);

      console.log("📝 Request details:", {
        prompt: request.prompt,
        imageSize: request.image.size,
        imageName: request.image.name,
      });

      // Use fetch with proper timeout handling for long requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout

      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use default error message
        }

        if (response.status === 413) {
          throw new Error("File too large. Please try with a smaller image.");
        }

        if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      console.log("✅ Video generation successful:", {
        message: data.message,
        video_url: data.video_url ? "✓" : "✗",
        video_uri: data.video_uri ? "✓" : "✗",
      });

      return data;
    } catch (error) {
      console.error("❌ Video generation failed:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error(
            "Request timed out. Video generation is taking longer than expected. Please try again."
          );
        }

        if (error.message.includes("fetch")) {
          throw new Error(
            "Network error. Please check your connection and try again."
          );
        }

        throw error;
      }

      throw new Error("An unexpected error occurred during video generation.");
    }
  }
}

export const videoGenerationService = VideoGenerationService.getInstance();
