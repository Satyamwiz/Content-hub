"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  ShieldAlert,
  Zap,
  Film,
  Wand2,
} from "lucide-react";

import { GeneratedVideo } from "../store/use-video-generation-store";
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
    const progress = video.progress;
    const estimatedSecondsLeft = Math.max(
      0,
      Math.round(((100 - progress) / 100) * 84)
    );
    const minutesLeft = Math.floor(estimatedSecondsLeft / 60);
    const secondsLeft = estimatedSecondsLeft % 60;

    const steps = [
      { label: "Uploading image", icon: <Film className="h-3.5 w-3.5" />, threshold: 10 },
      { label: "Analysing prompt", icon: <Wand2 className="h-3.5 w-3.5" />, threshold: 25 },
      { label: "Generating frames", icon: <Zap className="h-3.5 w-3.5" />, threshold: 55 },
      { label: "Compositing video", icon: <Sparkles className="h-3.5 w-3.5" />, threshold: 80 },
      { label: "Finalising & saving", icon: <CheckCircle className="h-3.5 w-3.5" />, threshold: 95 },
    ];

    return (
      <div className="space-y-4">
        {/* Generation Animation */}
        <div className="aspect-video bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 dark:from-purple-950/40 dark:via-violet-950/30 dark:to-pink-950/40 rounded-lg flex items-center justify-center border border-purple-200 dark:border-purple-800 relative overflow-hidden">
          {/* Animated background pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 rounded-full border border-purple-300/40 dark:border-purple-600/30 animate-[ping_3s_ease-in-out_infinite]"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full border border-purple-200/30 dark:border-purple-700/20 animate-[ping_3s_ease-in-out_infinite_1s]"></div>
          </div>

          <div className="text-center space-y-4 z-10 px-6">
            {/* Spinning loader */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute w-20 h-20 rounded-full border-4 border-purple-200 dark:border-purple-800"></div>
              <div className="absolute w-20 h-20 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
              <div className="p-4 bg-purple-500 rounded-full shadow-lg shadow-purple-500/30">
                <Loader2 className="h-7 w-7 text-white animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
                Generating Your Video…
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-300">
                AI is crafting your video frame by frame, do not close this window
              </p>
            </div>

            {/* ETA */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-purple-500 dark:text-purple-400">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {minutesLeft > 0
                  ? `~${minutesLeft}m ${secondsLeft}s remaining`
                  : secondsLeft > 0
                    ? `~${secondsLeft}s remaining`
                    : "Finalising…"}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar Card */}
        <Card className="border-purple-100 dark:border-purple-900">
          <CardContent className="p-4 space-y-4">
            {/* Percentage header */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Generation Progress
              </span>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 font-bold tabular-nums min-w-[48px] justify-center"
              >
                {Math.round(progress)}%
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <Progress
                value={progress}
                className="h-3 bg-purple-100 dark:bg-purple-950 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500 [&>div]:transition-all [&>div]:duration-700"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Processing Steps */}
            <div className="grid grid-cols-5 gap-1 pt-1">
              {steps.map((step, idx) => {
                const done = progress >= step.threshold;
                const active =
                  progress >= (idx === 0 ? 0 : steps[idx - 1].threshold) &&
                  progress < step.threshold;
                return (
                  <div
                    key={step.label}
                    className={`flex flex-col items-center gap-1 text-center transition-all duration-500 ${done
                        ? "text-purple-600 dark:text-purple-400"
                        : active
                          ? "text-purple-500 dark:text-purple-300 animate-pulse"
                          : "text-muted-foreground/40"
                      }`}
                  >
                    <div
                      className={`p-1.5 rounded-full transition-all duration-500 ${done
                          ? "bg-purple-100 dark:bg-purple-900"
                          : active
                            ? "bg-purple-50 dark:bg-purple-950 ring-1 ring-purple-300"
                            : "bg-muted/30"
                        }`}
                    >
                      {done ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : step.icon}
                    </div>
                    <span className="text-[10px] leading-tight font-medium hidden sm:block">
                      {step.label}
                    </span>
                  </div>
                );
              })}
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
