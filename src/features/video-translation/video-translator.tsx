"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Upload,
  Video,
  Image,
  Languages,
  Download,
  Loader2,
  Play,
  Pause,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  translateVideo,
  SUPPORTED_LANGUAGES,
  getLanguageLabel,
  isIndianLanguage,
  VideoTranslationResponse,
} from "@/services/video-translation.service";

interface TranslationResult extends VideoTranslationResponse {
  originalVideoName?: string;
  selectedLanguage?: string;
  translationTime?: number;
}

export function VideoTranslator() {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const resultVideoRef = useRef<HTMLVideoElement>(null);

  const handleVideoSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedVideo(file);
        setError("");
        setResult(null);

        // Create preview
        const url = URL.createObjectURL(file);
        setVideoPreview(url);
      }
    },
    []
  );

  const handleImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedImage(file);
        setError("");

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleLanguageChange = useCallback((value: string) => {
    setSelectedLanguage(value);
    setError("");
    setResult(null);
  }, []);

  const startTranslation = async () => {
    if (!selectedVideo || !selectedLanguage) {
      setError("Please select a video file and target language");
      return;
    }

    setIsTranslating(true);
    setError("");
    setResult(null);
    setProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 1000);

    const startTime = Date.now();

    try {
      const translationResult = await translateVideo({
        video: selectedVideo,
        image: selectedImage || undefined,
        language: selectedLanguage,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!translationResult.success) {
        throw new Error(
          (translationResult as any).error || "Translation failed"
        );
      }

      const endTime = Date.now();
      const translationTime = Math.round((endTime - startTime) / 1000);

      setResult({
        ...translationResult,
        originalVideoName: selectedVideo.name,
        selectedLanguage,
        translationTime,
      });
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("Translation error:", err);
      setError(err.message || "Failed to translate video");
      setProgress(0);
    } finally {
      setIsTranslating(false);
    }
  };

  const resetTranslation = () => {
    setSelectedVideo(null);
    setSelectedImage(null);
    setSelectedLanguage("");
    setVideoPreview("");
    setImagePreview("");
    setResult(null);
    setError("");
    setProgress(0);
    setIsTranslating(false);
    setIsPlaying(false);
  };

  const downloadTranslatedVideo = () => {
    if (result?.videoUrl) {
      const link = document.createElement("a");
      link.href = result.videoUrl;
      link.download = `translated_${selectedLanguage}_${
        selectedVideo?.name || "video"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleVideoPlayback = (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
        setIsPlaying(true);
      } else {
        videoElement.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Video Translator</h1>
        <p className="text-muted-foreground">
          Translate your videos to different languages with AI-powered voice
          synthesis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Video Translation
          </CardTitle>
          <CardDescription>
            Upload your video and choose the target language for translation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video File (Required)
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">
                  Click to upload a video
                </p>
                <p className="text-sm text-gray-500">
                  Supports MP4, AVI, MOV, WMV, FLV, WebM, MKV (max 2MB/10sec)
                </p>
              </label>
            </div>
            {selectedVideo && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  Selected: {selectedVideo.name} (
                  {(selectedVideo.size / 1024 / 1024).toFixed(2)} MB)
                </div>
                {videoPreview && (
                  <div className="relative max-w-md mx-auto">
                    <video
                      ref={videoRef}
                      src={videoPreview}
                      className="w-full h-auto rounded-lg shadow-md"
                      controls
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Language Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Target Language</h3>

            <Select
              value={selectedLanguage}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent>
                {[...SUPPORTED_LANGUAGES.indian, ...SUPPORTED_LANGUAGES.foreign]
                  .sort((a, b) => a.label.localeCompare(b.label))
                  .map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {selectedLanguage && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Selected: {getLanguageLabel(selectedLanguage)}
                </Badge>
                <Badge
                  variant={
                    isIndianLanguage(selectedLanguage) ? "default" : "outline"
                  }
                >
                  {isIndianLanguage(selectedLanguage) ? "Indian" : "Foreign"}
                </Badge>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Progress */}
          {isTranslating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Translating video...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={startTranslation}
              disabled={isTranslating || !selectedVideo || !selectedLanguage}
              className="min-w-32"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  Translate Video
                </>
              )}
            </Button>

            {(selectedVideo || result) && (
              <Button variant="outline" onClick={resetTranslation}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Translation Result */}
      {result && result.success && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Translation Complete
            </CardTitle>
            <CardDescription>
              Your video has been successfully translated to{" "}
              {getLanguageLabel(result.selectedLanguage || "")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Translation Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Original:</span>
                <p className="text-gray-600">{result.originalVideoName}</p>
              </div>
              <div>
                <span className="font-medium">Language:</span>
                <p className="text-gray-600">
                  {getLanguageLabel(result.selectedLanguage || "")}
                </p>
              </div>
              <div>
                <span className="font-medium">Duration:</span>
                <p className="text-gray-600">{result.translationTime}s</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <Badge variant="default">Completed</Badge>
              </div>
            </div>

            {/* Translated Video */}
            {result.videoUrl && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Translated Video</h3>
                <div className="relative max-w-2xl mx-auto">
                  <video
                    ref={resultVideoRef}
                    src={result.videoUrl}
                    className="w-full h-auto rounded-lg shadow-md"
                    controls
                  />
                </div>

                <div className="flex justify-center gap-2">
                  <Button onClick={downloadTranslatedVideo}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Translated Video
                  </Button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {result.message && (
              <Alert>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
