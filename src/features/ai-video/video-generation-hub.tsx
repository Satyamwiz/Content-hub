"use client";

import React from "react";
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
import { TutorialButton } from "@/features/tutorial/tutorial-button";
import { useVideoGenerationStore, GeneratedVideo } from "@/features/ai-video/store/use-video-generation-store";

export function VideoGenerationHub() {
  const router = useRouter();
  
  const {
    isGenerating,
    currentVideo,
    errorMessage,
    generationHistory,
    setErrorMessage,
    generateVideo,
  } = useVideoGenerationStore();

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
              onGenerate={generateVideo}
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
