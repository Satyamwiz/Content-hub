"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Share,
  Instagram,
  Facebook,
  Twitter,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  media: File[];
  mode: "poem" | "reel";
}

export function ReelPreview({
  open,
  onOpenChange,
  content,
  media,
  mode,
}: ReelPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareOption, setShareOption] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
  };

  const handleDownload = () => {
    console.log("Downloading reel...");
    // Handle download logic
  };

  const handleShare = (platform: string) => {
    setShareOption(platform);
    console.log(`Sharing to ${platform}...`);
    // Handle platform-specific sharing
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://yourapp.com/reel/generated-123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "poem" ? "Poem Reel Preview" : "Reel Preview"}
            <Badge variant="outline" className="ml-auto">
              {mode === "poem" ? "Poetry" : "Standard"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview Player */}
          <div className="lg:col-span-2">
            <div className="relative">
              {/* Video Player */}
              <div
                className={cn(
                  "relative bg-black rounded-lg overflow-hidden aspect-[9/16] max-w-sm mx-auto",
                  isFullscreen && "fixed inset-0 z-50 max-w-none aspect-auto"
                )}
              >
                {/* Video Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {media.length > 0 ? (
                    media[0].type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(media[0])}
                        alt="Reel content"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(media[0])}
                        className="w-full h-full object-cover"
                        muted={isMuted}
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <div className="text-white text-center p-6">
                        <h3 className="text-lg font-bold mb-4">
                          {mode === "poem"
                            ? "Generated Poem Reel"
                            : "Generated Reel"}
                        </h3>
                        <div className="text-sm leading-relaxed">
                          {content.slice(0, 150)}
                          {content.length > 150 && "..."}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Overlay Text for Poems */}
                {mode === "poem" && content && (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="text-center text-white drop-shadow-lg">
                      <div className="text-lg font-serif leading-relaxed">
                        {content
                          .split("\n")
                          .slice(0, 4)
                          .map((line, index) => (
                            <div key={index} className="mb-1">
                              {line}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                  <Progress value={progress} className="h-1" />
                </div>

                {/* Controls Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={handlePlayPause}
                    className="rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>
                </div>

                {/* Top Controls */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <VolumeX className="h-3 w-3" />
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    <Maximize className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Mobile Preview Info */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>Preview as it would appear on mobile</p>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <span>Duration: ~15s</span>
                  <span>•</span>
                  <span>Format: 9:16</span>
                  <span>•</span>
                  <span>Quality: HD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel - Actions */}
          <div className="space-y-4">
            {/* Download Options */}
            <div className="space-y-3">
              <h3 className="font-medium">Download</h3>
              <div className="space-y-2">
                <Button
                  onClick={handleDownload}
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download HD Video
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download GIF
                </Button>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              <h3 className="font-medium">Share Directly</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => handleShare("instagram")}
                  className="w-full justify-start"
                  disabled={shareOption === "instagram"}
                >
                  <Instagram className="h-4 w-4 mr-2" />
                  {shareOption === "instagram"
                    ? "Sharing..."
                    : "Share to Instagram"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare("facebook")}
                  className="w-full justify-start"
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Share to Facebook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare("twitter")}
                  className="w-full justify-start"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Share to Twitter
                </Button>
              </div>
            </div>

            {/* Copy Link */}
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="w-full justify-start"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Share Link
                  </>
                )}
              </Button>
            </div>

            {/* Reel Stats */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Reel Details</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>
                    {mode === "poem" ? "Poetry Reel" : "Standard Reel"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Text Length:</span>
                  <span>{content.length} characters</span>
                </div>
                <div className="flex justify-between">
                  <span>Media Files:</span>
                  <span>{media.length} file(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline">Edit Reel</Button>
          <Button onClick={() => handleShare("instagram")}>
            <Share className="h-4 w-4 mr-2" />
            Publish Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
