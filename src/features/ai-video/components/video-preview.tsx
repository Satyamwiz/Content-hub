"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Download,
  Share,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Copy,
  CheckCircle,
  Clock,
  Sparkles,
  AlertCircle,
  Loader2,
  Youtube,
} from "lucide-react";

import { GeneratedVideo } from "../video-generation-hub";
import { downloadVideoFromUrl } from "@/lib/video-utils";

interface VideoPreviewProps {
  video: GeneratedVideo | null;
  isGenerating: boolean;
  onUploadToYouTube?: (video: GeneratedVideo) => void;
}

export function VideoPreview({
  video,
  isGenerating,
  onUploadToYouTube,
}: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = async () => {
    if (video?.videoUrl) {
      try {
        await downloadVideoFromUrl(video.videoUrl, `ai-video-${video.id}.mp4`);
      } catch (error) {
        console.error("Download failed:", error);
        // Fallback: open in new tab
        window.open(video.videoUrl, "_blank");
      }
    }
  };

  const handleShare = async () => {
    if (video?.videoUrl) {
      try {
        await navigator.clipboard.writeText(video.videoUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy link:", error);
      }
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Empty state when no video
  if (!video && !isGenerating) {
    return (
      <div className="aspect-video bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="text-center space-y-3">
          <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full w-fit mx-auto">
            <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              No video selected
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
              Upload an image and enter a prompt to generate your first AI video
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Generating state
  if (isGenerating && video?.status === "generating") {
    return (
      <div className="space-y-4">
        {/* Generation Progress */}
        <div className="aspect-video bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center border border-purple-200 dark:border-purple-800">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="p-4 bg-purple-500 rounded-full">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-800 animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                Generating Video...
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                AI is creating your video
              </p>
            </div>
          </div>
        </div>

        {/* Progress Details */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Generation Progress</span>
              <Badge variant="secondary">{Math.round(video.progress)}%</Badge>
            </div>
            <Progress value={video.progress} className="h-2" />
            <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs text-blue-700 dark:text-blue-300">
              💡 This usually takes up to 2 minutes. You can
              continue using other features while we generate your video.
            </div>
          </CardContent>
        </Card>

        {/* Source Image Preview */}
        {video.imageUrl && (
          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Source Image</h4>
              <img
                src={video.imageUrl}
                alt="Source"
                className="w-full h-32 object-cover rounded-lg border"
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Failed state
  if (video?.status === "failed") {
    return (
      <div className="space-y-4">
        <div className="aspect-video bg-linear-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg flex items-center justify-center border border-red-200 dark:border-red-800">
          <div className="text-center space-y-3">
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full w-fit mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Generation Failed
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 max-w-sm">
                Something went wrong while generating your video. Please try
                again.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Completed video
  if (video?.status === "completed" && video.videoUrl) {
    return (
      <div className="space-y-4">
        {/* Video Player */}
        <div className="relative group">
          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            className="w-full aspect-video bg-black rounded-lg"
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
              {/* Play/Pause */}
              <Button
                size="sm"
                variant="secondary"
                onClick={handlePlayPause}
                className="bg-white/20 backdrop-blur text-white hover:bg-white/30"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              {/* Mute */}
              <Button
                size="sm"
                variant="secondary"
                onClick={handleMuteToggle}
                className="bg-white/20 backdrop-blur text-white hover:bg-white/30"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>

              <div className="flex-1" />

              {/* Fullscreen */}
              <Button
                size="sm"
                variant="secondary"
                onClick={handleFullscreen}
                className="bg-white/20 backdrop-blur text-white hover:bg-white/30"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          </div>

          {/* Quality Badge */}
          <div className="absolute top-4 right-4">
            <Badge
              variant="secondary"
              className="bg-black/20 backdrop-blur text-white"
            >
              {video.quality.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Video Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Generated Video</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{video.duration}s</Badge>
                <Badge variant="outline">{video.aspectRatio}</Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {video.prompt}
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={handleDownload}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>

          <Button onClick={handleShare} variant="outline">
            {copied ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? "Copied!" : "Share"}
          </Button>

          {onUploadToYouTube && (
            <Button
              onClick={() => onUploadToYouTube(video)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Youtube className="h-4 w-4 mr-2" />
              YouTube
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
