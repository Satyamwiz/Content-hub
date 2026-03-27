"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Sparkles,
  Clock,
  Play,
  AlertCircle,
  X,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { VideoGenerationForm } from "@/features/ai-video/components/video-generation-form";
import { VideoPreview } from "@/features/ai-video/components/video-preview";
import {
  videoGenerationService,
  VideoGenerationApiResponse,
} from "@/services/video-generation.service";
import { TutorialButton } from "@/features/tutorial/tutorial-button";

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

export function VideoGenerationHub() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<GeneratedVideo[]>([
    // Mock data for demonstration
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
  ]);

  const handleGenerateVideo = async (request: VideoGenerationRequest) => {
    if (!request.image) {
      console.error("No image provided for video generation");
      return;
    }

    setIsGenerating(true);
    let progressInterval: NodeJS.Timeout | null = null;

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
        progress: 0,
      };

      setCurrentVideo(newVideo);
      setGenerationHistory((prev) => [newVideo, ...prev]);

      // Start progress simulation - slower progress for realistic 2 minute generation
      progressInterval = setInterval(() => {
        setCurrentVideo((prev) => {
          if (prev && prev.progress < 85) {
            // Slower progress increment for 2 minute generation time
            const increment = Math.random() * 3 + 1; // 1-4% increment
            const newProgress = Math.round(prev.progress + increment); // Round to integer
            const updatedVideo = {
              ...prev,
              progress: Math.min(newProgress, 85), // Cap at 85% until API completes
            };

            // Update history as well
            setGenerationHistory((prevHistory) =>
              prevHistory.map((video) =>
                video.id === prev.id ? updatedVideo : video
              )
            );

            return updatedVideo;
          }
          return prev;
        });
      }, 3000); // Update every 3 seconds for smoother 2-minute progression

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

      // Clear progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      // Complete generation with API response
      const completedVideo: GeneratedVideo = {
        ...newVideo,
        status: "completed",
        progress: 100,
        videoUrl: apiResponse.videoUrl, // Use the Cloudinary URL
        prompt: apiResponse.prompt,
      };

      setCurrentVideo(completedVideo);
      setGenerationHistory((prev) =>
        prev.map((video) => (video.id === newVideo.id ? completedVideo : video))
      );

      toast.success("Video generated and saved to your gallery!");
    } catch (error) {
      console.error("Video generation failed:", error);

      // Clear progress interval if it exists
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      setCurrentVideo((prev) =>
        prev ? { ...prev, status: "failed", progress: 0 } : null
      );
      setGenerationHistory((prev) =>
        prev.map((video) =>
          video.id === currentVideo?.id
            ? { ...video, status: "failed" as const, progress: 0 }
            : video
        )
      );

      // Set error message for user display
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      setErrorMessage(errorMsg);

      // Clear error message after 10 seconds
      setTimeout(() => setErrorMessage(null), 10000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadToYouTube = (video: GeneratedVideo) => {
    if (video && video.videoUrl) {
      // Store the data in localStorage to pass to the upload page
      const uploadData = {
        type: "video",
        videoUrl: video.videoUrl,
        title: `AI Generated Video - ${new Date().toLocaleDateString()}`,
        description: `Generated video with prompt: ${video.prompt}`,
        tags: "AI,Generated,Video,Animation",
        prompt: video.prompt,
        timestamp: Date.now(),
        duration: video.duration,
        quality: video.quality,
        aspectRatio: video.aspectRatio,
      };

      localStorage.setItem("youtube-upload-data", JSON.stringify(uploadData));

      // Navigate to the upload tab in dashboard
      router.push("/dashboard?tab=upload");
      toast.success("Redirecting to YouTube upload...");
    } else {
      toast.error("Video not available for upload");
    }
  };

  const stats = {
    totalVideos: generationHistory.length,
    totalDuration: generationHistory.reduce(
      (sum, video) => sum + video.duration,
      0
    ),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI Video Generation
          </h1>
          <p className="text-muted-foreground">
            Transform your images and prompts into stunning AI-generated videos
          </p>
          <TutorialButton
            page="ai-video"
            label="AI Video Tutorial"
            className="mt-1 h-auto p-0"
          />
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              Generation Failed
            </p>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Create New Video
              {isGenerating && (
                <Badge variant="secondary" className="ml-auto">
                  Generating...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VideoGenerationForm
              onGenerate={handleGenerateVideo}
              isGenerating={isGenerating}
            />
          </CardContent>
        </Card>

        {/* Right Column - Video Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Video Preview
              {currentVideo?.status === "completed" && (
                <Badge variant="default" className="ml-auto">
                  Ready
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VideoPreview
              video={currentVideo}
              isGenerating={isGenerating}
              onUploadToYouTube={handleUploadToYouTube}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
