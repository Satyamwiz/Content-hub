"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PromptEnhancerButton } from "@/components/shared/prompt-enhancer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { VideoGenerationRequest } from "../video-generation-hub";

interface VideoGenerationFormProps {
  onGenerate: (request: VideoGenerationRequest) => void;
  isGenerating: boolean;
}

export function VideoGenerationForm({
  onGenerate,
  isGenerating,
}: VideoGenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [duration, setDuration] = useState(5);
  const [style, setStyle] = useState("cinematic");
  const [quality, setQuality] = useState("hd");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Clear image error if exists
        if (errors.image) {
          setErrors((prev) => ({ ...prev, image: "" }));
        }
      }
    },
    [errors.image]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!prompt.trim()) {
      newErrors.prompt = "Please enter a prompt describing your video";
    } else if (prompt.length < 10) {
      newErrors.prompt = "Prompt should be at least 10 characters long";
    } else if (prompt.length > 1000) {
      newErrors.prompt = "Prompt should not exceed 500 characters";
    }

    if (!selectedImage) {
      newErrors.image = "Please upload an image to generate video from";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const request: VideoGenerationRequest = {
      prompt: prompt.trim(),
      image: selectedImage,
      duration,
      style,
      quality,
      aspectRatio,
    };

    onGenerate(request);
  };
  const canSubmit = prompt.trim() && selectedImage && !isGenerating;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prompt Input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="font-medium">Video Prompt</span>
          <Badge variant="outline" className="text-xs">
            {prompt.length}/1000
          </Badge>
        </div>
        <Textarea
          id="prompt"
          placeholder="Describe the video you want to create... e.g., 'A gentle breeze moving through the trees with birds flying in the background, cinematic slow motion'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-24 resize-none"
          maxLength={1000}
          disabled={isGenerating}
        />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {errors.prompt && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.prompt}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              💡 Be specific about motion, camera angles, and atmosphere for
              best results
            </p>
          </div>
          <PromptEnhancerButton
            prompt={prompt}
            onPromptChange={setPrompt}
            context="video-generation"
            disabled={isGenerating}
          />
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-blue-500" />
          Source Image
        </Label>

        {!selectedImage ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {isDragActive ? "Drop your image here" : "Upload an image"}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag & drop or click to browse • PNG, JPG, WebP up to 10MB
            </p>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={imagePreview!}
                  alt="Selected"
                  className="w-full h-48 object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white text-sm font-medium">
                    {selectedImage.name}
                  </p>
                  <p className="text-white/80 text-xs">
                    {(selectedImage.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {errors.image && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.image}
          </p>
        )}
      </div>

      {/* Generation Settings */}
      {/* <div className="space-y-4"></div> */}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        size="lg"
      >
        {isGenerating ? (
          <>
            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            Generating Video...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate AI Video
          </>
        )}
      </Button>
    </form>
  );
}
