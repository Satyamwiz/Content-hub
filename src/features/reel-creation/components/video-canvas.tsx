"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Image as ImageIcon,
  Video as VideoIcon,
  Wand2,
  Palette,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoCanvasProps {
  selectedMedia: File[];
  onMediaChange: (files: File[]) => void;
  mode: "poem" | "reel";
}

const aiBackgrounds = [
  {
    id: "gradient-sunset",
    name: "Gradient Sunset",
    description: "Warm orange and pink gradients",
    preview: "linear-gradient(135deg, #ff6b6b, #ffd93d)",
  },
  {
    id: "nature-forest",
    name: "Mystical Forest",
    description: "Deep green with light rays",
    preview: "linear-gradient(135deg, #134e5e, #71b280)",
  },
  {
    id: "cosmic-space",
    name: "Cosmic Space",
    description: "Deep purple with stars",
    preview: "linear-gradient(135deg, #667eea, #764ba2)",
  },
  {
    id: "ocean-waves",
    name: "Ocean Waves",
    description: "Blue ocean with foam",
    preview: "linear-gradient(135deg, #74b9ff, #0984e3)",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    description: "Warm golden light",
    preview: "linear-gradient(135deg, #f7971e, #ffd200)",
  },
  {
    id: "minimalist-white",
    name: "Clean White",
    description: "Simple white background",
    preview: "linear-gradient(135deg, #ffffff, #f8f9fa)",
  },
];

export function VideoCanvas({
  selectedMedia,
  onMediaChange,
  mode,
}: VideoCanvasProps) {
  const [selectedBackground, setSelectedBackground] = useState<string>("");
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("9:16"); // Default to Instagram Reel format
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onMediaChange([...selectedMedia, ...acceptedFiles]);
    },
    [selectedMedia, onMediaChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".mov", ".avi", ".webm"],
    },
    multiple: true,
    maxFiles: 10,
  });

  const removeMedia = (index: number) => {
    onMediaChange(selectedMedia.filter((_, i) => i !== index));
  };

  const handleGenerateAIBackground = async () => {
    setIsGeneratingBg(true);
    // Simulate AI background generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSelectedBackground("ai-generated");
    setIsGeneratingBg(false);
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "9:16":
        return "aspect-[9/16]";
      case "16:9":
        return "aspect-[16/9]";
      case "1:1":
        return "aspect-square";
      case "4:5":
        return "aspect-[4/5]";
      default:
        return "aspect-[9/16]";
    }
  };

  const getBackgroundStyle = () => {
    if (!selectedBackground) return {};

    const bg = aiBackgrounds.find((bg) => bg.id === selectedBackground);
    if (bg) {
      return { background: bg.preview };
    }

    if (selectedBackground === "ai-generated") {
      return {
        background: "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
      };
    }

    return {};
  };

  return (
    <div className="space-y-4">
      {/* Canvas Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={aspectRatio} onValueChange={setAspectRatio}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="9:16">9:16 (Reel)</SelectItem>
            <SelectItem value="1:1">1:1 (Square)</SelectItem>
            <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
            <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateAIBackground}
          disabled={isGeneratingBg}
          className="flex items-center gap-2"
        >
          <Wand2 className={cn("h-4 w-4", isGeneratingBg && "animate-spin")} />
          {isGeneratingBg ? "Generating..." : "AI Background"}
        </Button>

        <Badge variant="outline" className="text-xs">
          {mode === "poem" ? "Poetry Canvas" : "Reel Canvas"}
        </Badge>
      </div>

      {/* Main Canvas */}
      <div className="relative">
        <div
          className={cn(
            "w-full max-w-sm mx-auto border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden",
            getAspectRatioClass(),
            selectedMedia.length === 0 && !selectedBackground && "bg-muted/20"
          )}
          style={getBackgroundStyle()}
        >
          {selectedMedia.length === 0 && !selectedBackground ? (
            // Upload Area
            <div
              {...getRootProps()}
              className={cn(
                "h-full flex flex-col items-center justify-center cursor-pointer transition-colors p-6",
                isDragActive
                  ? "bg-primary/5 border-primary"
                  : "hover:bg-muted/40"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mb-3 text-muted-foreground" />
              <p className="text-sm text-center text-muted-foreground mb-2">
                {isDragActive
                  ? "Drop your media here..."
                  : "Drag & drop media or click to select"}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Supports images and videos
              </p>
            </div>
          ) : (
            // Canvas Content
            <div className="relative h-full">
              {/* Background */}
              {selectedBackground && (
                <div
                  className="absolute inset-0"
                  style={getBackgroundStyle()}
                />
              )}

              {/* Media Content */}
              {selectedMedia.length > 0 && (
                <div className="relative h-full flex items-center justify-center p-4">
                  {selectedMedia[0].type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(selectedMedia[0])}
                      alt="Canvas content"
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(selectedMedia[0])}
                      className="max-w-full max-h-full object-contain rounded"
                      controls={false}
                      muted={isMuted}
                      autoPlay={isPlaying}
                      loop
                    />
                  )}
                </div>
              )}

              {/* Canvas Overlay Text (for poems) */}
              {mode === "poem" && (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="text-center text-white font-serif">
                    <p className="text-lg font-medium drop-shadow-lg">
                      Your poem will appear here
                    </p>
                  </div>
                </div>
              )}

              {/* Video Controls */}
              {selectedMedia.length > 0 &&
                selectedMedia[0].type.startsWith("video/") && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
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
                  </div>
                )}

              {/* Canvas Actions */}
              <div className="absolute top-2 right-2">
                <Button size="sm" variant="secondary">
                  <Maximize className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Background Selection */}
      {selectedMedia.length === 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            AI Background Themes
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {aiBackgrounds.map((bg) => (
              <div
                key={bg.id}
                className={cn(
                  "p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm",
                  selectedBackground === bg.id && "border-primary bg-primary/5"
                )}
                onClick={() => setSelectedBackground(bg.id)}
              >
                <div
                  className="w-full h-8 rounded mb-2"
                  style={{ background: bg.preview }}
                />
                <div className="text-xs font-medium">{bg.name}</div>
                <div className="text-xs text-muted-foreground">
                  {bg.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Files List */}
      {selectedMedia.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Media</h4>
          <div className="space-y-2">
            {selectedMedia.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 border rounded-lg"
              >
                <div className="flex-shrink-0">
                  {file.type.startsWith("image/") ? (
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                  ) : (
                    <VideoIcon className="h-4 w-4 text-purple-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeMedia(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload More Button */}
      {selectedMedia.length > 0 && (
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/20 transition-colors"
        >
          <input {...getInputProps()} />
          <Upload className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Add more media</p>
        </div>
      )}
    </div>
  );
}
