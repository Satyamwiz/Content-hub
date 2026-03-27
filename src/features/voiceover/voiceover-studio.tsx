"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mic,
  Upload,
  Play,
  Download,
  Replace,
  Languages,
  Volume2,
  FileAudio,
  FileVideo,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { FileUploadZone } from "@/features/voiceover/components/file-upload-zone";
import { VoiceSettingsPanel } from "@/features/voiceover/components/voice-settings-panel";
import { MediaPlayer } from "@/features/voiceover/components/media-player";
import { OutputControls } from "@/features/voiceover/components/output-controls";
import { TutorialButton } from "@/features/tutorial/tutorial-button";

interface UploadedFile {
  file: File;
  url: string;
  type: "audio" | "video";
  duration?: number;
}

interface VoiceSettings {
  language: string;
  voiceStyle: string;
  speed: number;
  pitch: number;
}

interface GenerationResult {
  url: string;
  duration: number;
  format: string;
  size: number;
}

export function VoiceoverStudio() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    language: "en-US",
    voiceStyle: "neutral",
    speed: 1.0,
    pitch: 1.0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationResult, setGenerationResult] =
    useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("video/") ? "video" : "audio";

    setUploadedFile({
      file,
      url,
      type,
    });
    setGenerationResult(null);
    setError(null);
  };

  const handleGenerateVoiceover = async () => {
    if (!uploadedFile) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setError(null);

    try {
      // Simulate generation process with progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          // Round to integer for display
          return Math.round(prev + Math.random() * 15);
        });
      }, 200);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Mock generation result
      const mockResult: GenerationResult = {
        url: "/api/placeholder/audio/generated-voiceover.mp3",
        duration: 120, // 2 minutes
        format: "MP3",
        size: 2.5, // MB
      };

      setGenerationResult(mockResult);
    } catch (err) {
      setError("Failed to generate voiceover. Please try again.");
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generationResult) {
      // In a real app, this would download the actual generated file
      const link = document.createElement("a");
      link.href = generationResult.url;
      link.download = `voiceover-${voiceSettings.language}-${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReplaceOriginal = () => {
    if (generationResult && uploadedFile) {
      // In a real app, this would replace the original audio track
      console.log("Replacing original audio with generated voiceover");
      // Update the uploaded file with the new audio
      setUploadedFile({
        ...uploadedFile,
        url: generationResult.url,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Mic className="h-8 w-8 text-primary" />
            Voiceover Studio
          </h1>
          <p className="text-muted-foreground">
            Generate professional voiceovers and dubbing in multiple languages
          </p>
          <TutorialButton
            page="voiceovers"
            label="Voiceover Tutorial"
            className="mt-1 h-auto p-0"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Languages className="h-3 w-3" />
            Multi-language
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Volume2 className="h-3 w-3" />
            AI Voices
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                <FileAudio className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Supported Formats
                </p>
                <p className="text-lg font-bold">MP3, WAV, MP4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                <Languages className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Languages</p>
                <p className="text-lg font-bold">25+</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900">
                <Volume2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Voice Styles</p>
                <p className="text-lg font-bold">12+</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900">
                <FileVideo className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Duration</p>
                <p className="text-lg font-bold">10 min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload & Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadZone
                onFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
              />
            </CardContent>
          </Card>

          {/* Voice Settings */}
          {uploadedFile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Voice Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VoiceSettingsPanel
                  settings={voiceSettings}
                  onSettingsChange={setVoiceSettings}
                />
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          {uploadedFile && (
            <Button
              onClick={handleGenerateVoiceover}
              disabled={isGenerating}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Generate Voiceover
                </>
              )}
            </Button>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing...</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(generationProgress)}%
                    </span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Analyzing audio, generating voiceover in{" "}
                    {voiceSettings.language}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Preview & Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Player */}
          {uploadedFile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Media Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MediaPlayer
                  originalFile={uploadedFile}
                  generatedResult={generationResult}
                />
              </CardContent>
            </Card>
          )}

          {/* Output Controls */}
          {generationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Generation Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OutputControls
                  result={generationResult}
                  onDownload={handleDownload}
                  onReplace={handleReplaceOriginal}
                  voiceSettings={voiceSettings}
                />
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {!uploadedFile && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Get Started</h3>
                    <p className="text-muted-foreground">
                      Upload a video or audio file to begin generating
                      voiceovers
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Upload className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="font-medium">1. Upload</p>
                      <p className="text-muted-foreground">
                        Video or audio file
                      </p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Languages className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="font-medium">2. Configure</p>
                      <p className="text-muted-foreground">Language & voice</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <Download className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="font-medium">3. Download</p>
                      <p className="text-muted-foreground">
                        Generated voiceover
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
