import { create } from "zustand";
import { toast } from "sonner";

export interface VideoGenerationRequest {
  prompt: string;
  image: File | null;
  duration: number;
  style: string;
  quality: string;
  aspectRatio: string;
}

export interface GeneratedVideo {
  id: string;
  prompt: string;
  imageUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  style: string;
  quality: string;
  aspectRatio: string;
  createdAt: Date;
  status: "generating" | "completed" | "failed";
  progress: number;
}

interface VideoGenerationState {
  isGenerating: boolean;
  currentVideo: GeneratedVideo | null;
  errorMessage: string | null;
  generationHistory: GeneratedVideo[];
  setErrorMessage: (msg: string | null) => void;
  generateVideo: (request: VideoGenerationRequest) => Promise<void>;
}

// Initial mock data for demonstration
const initialHistory: GeneratedVideo[] = [
  {
    id: "1",
    prompt: "A majestic sunset over mountains with birds flying",
    imageUrl: "/placeholder-landscape.jpg",
    videoUrl: "/sample-video-1.mp4",
    thumbnailUrl: "/placeholder-landscape.jpg",
    duration: 5,
    style: "cinematic",
    quality: "hd",
    aspectRatio: "16:9",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "completed",
    progress: 100,
  },
  {
    id: "2",
    prompt: "Ocean waves crashing on a rocky shore",
    imageUrl: "/placeholder-ocean.jpg",
    videoUrl: "/sample-video-2.mp4",
    thumbnailUrl: "/placeholder-ocean.jpg",
    duration: 8,
    style: "natural",
    quality: "4k",
    aspectRatio: "16:9",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "completed",
    progress: 100,
  },
];

export const useVideoGenerationStore = create<VideoGenerationState>((set, get) => {
  let progressInterval: NodeJS.Timeout | null = null;

  return {
    isGenerating: false,
    currentVideo: null,
    errorMessage: null,
    generationHistory: initialHistory,
    setErrorMessage: (msg) => set({ errorMessage: msg }),

    generateVideo: async (request: VideoGenerationRequest) => {
      if (!request.image) {
        console.error("No image provided for video generation");
        return;
      }

      set({ isGenerating: true });

      // Helper to schedule a single randomised tick, then schedule the next
      const scheduleNextTick = (videoId: string) => {
        // Random delay: 2.6-3.6 seconds per tick, giving ~1m 20s to 1m 50s for 0→95%
        const delay = Math.random() * 1000 + 2600;
        progressInterval = setTimeout(() => {
          const state = get();
          
          if (state.currentVideo && state.currentVideo.id === videoId && state.currentVideo.progress < 95) {
            // Random increment: 1-5% per tick
            const increment = Math.random() * 4 + 1;
            const newProgress = Math.min(
              parseFloat((state.currentVideo.progress + increment).toFixed(1)),
              95
            );
            
            const updatedVideo = { ...state.currentVideo, progress: newProgress };

            set((s) => ({
              currentVideo: updatedVideo,
              generationHistory: s.generationHistory.map((v) =>
                v.id === videoId ? updatedVideo : v
              ),
            }));

            // Schedule next tick only if still generating
            scheduleNextTick(videoId);
          }
        }, delay);
      };

      try {
        // Create new video entry with generating status
        const newVideo: GeneratedVideo = {
          id: Date.now().toString(),
          prompt: request.prompt,
          imageUrl: URL.createObjectURL(request.image),
          videoUrl: "",
          thumbnailUrl: URL.createObjectURL(request.image),
          duration: request.duration,
          style: request.style,
          quality: request.quality,
          aspectRatio: request.aspectRatio,
          createdAt: new Date(),
          status: "generating",
          progress: 5, // Start at 5% so the bar is immediately visible
        };

        set((s) => ({
          currentVideo: newVideo,
          generationHistory: [newVideo, ...s.generationHistory],
        }));

        // Kick off the randomised slow progress ticks
        scheduleNextTick(newVideo.id);

        // Call the new API that handles Cloudinary upload
        const formData = new FormData();
        formData.append("image", request.image);
        formData.append("prompt", request.prompt);

        const response = await fetch("/api/generate-video", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate video");
        }

        const apiResponse = await response.json();

        // Clear progress timeout
        if (progressInterval) {
          clearTimeout(progressInterval);
        }

        // Jump to 100% before showing the video
        set((s) => ({
          currentVideo: s.currentVideo ? { ...s.currentVideo, progress: 100 } : null,
          generationHistory: s.generationHistory.map((v) =>
            v.id === newVideo.id ? { ...v, progress: 100 } : v
          ),
        }));

        // Wait a moment so user can see it hit 100%
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Complete generation with API response
        const completedVideo: GeneratedVideo = {
          ...newVideo,
          status: "completed",
          progress: 100,
          videoUrl: apiResponse.videoUrl, // Use the Cloudinary URL
          prompt: apiResponse.prompt,
        };

        set((s) => ({
          currentVideo: completedVideo,
          generationHistory: s.generationHistory.map((video) =>
            video.id === newVideo.id ? completedVideo : video
          ),
        }));

        toast.success("Video generated and saved to your gallery!");
      } catch (error) {
        console.error("Video generation failed:", error);

        // Clear progress timeout if it exists
        if (progressInterval) {
          clearTimeout(progressInterval);
        }

        set((s) => ({
          currentVideo: s.currentVideo ? { ...s.currentVideo, status: "failed", progress: 0 } : null,
          generationHistory: s.generationHistory.map((video) =>
            video.id === s.currentVideo?.id
              ? { ...video, status: "failed" as const, progress: 0 }
              : video
          ),
        }));

        // Set error message for user display
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error occurred";
        set({ errorMessage: errorMsg });

        // Clear error message after 10 seconds
        setTimeout(() => set({ errorMessage: null }), 10000);
      } finally {
        set({ isGenerating: false });
      }
    },
  };
});
