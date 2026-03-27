"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Replace,
  Share,
  Copy,
  FileAudio,
  Clock,
  HardDrive,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
} from "lucide-react";

interface GenerationResult {
  url: string;
  duration: number;
  format: string;
  size: number;
}

interface VoiceSettings {
  language: string;
  voiceStyle: string;
  speed: number;
  pitch: number;
}

interface OutputControlsProps {
  result: GenerationResult;
  onDownload: () => void;
  onReplace: () => void;
  voiceSettings: VoiceSettings;
}

export function OutputControls({
  result,
  onDownload,
  onReplace,
  voiceSettings,
}: OutputControlsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // Simulate download progress
    const progressInterval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 100);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setDownloadProgress(100);
      onDownload();
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 500);
    }
  };

  const handleReplace = async () => {
    setIsReplacing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onReplace();
    } finally {
      setIsReplacing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(result.url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getLanguageName = (code: string) => {
    const languages: Record<string, string> = {
      "en-US": "English (US)",
      "en-GB": "English (UK)",
      "hi-IN": "Hindi",
      "ta-IN": "Tamil",
      "te-IN": "Telugu",
      "kn-IN": "Kannada",
      "ml-IN": "Malayalam",
      "bn-IN": "Bengali",
      "gu-IN": "Gujarati",
      "mr-IN": "Marathi",
      "pa-IN": "Punjabi",
      "es-ES": "Spanish",
      "fr-FR": "French",
      "de-DE": "German",
      "it-IT": "Italian",
      "pt-BR": "Portuguese",
      "ru-RU": "Russian",
      "ja-JP": "Japanese",
      "ko-KR": "Korean",
      "zh-CN": "Chinese",
      "ar-SA": "Arabic",
      "tr-TR": "Turkish",
      "nl-NL": "Dutch",
      "sv-SE": "Swedish",
      "pl-PL": "Polish",
    };
    return languages[code] || code;
  };

  return (
    <div className="space-y-6">
      {/* Generation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Status
                </p>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileAudio className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Format</p>
                <p className="font-medium">{result.format}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{formatTime(result.duration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <HardDrive className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-medium">{result.size} MB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice Settings Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Generation Settings</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Language</p>
                <Badge variant="outline" className="mt-1">
                  {getLanguageName(voiceSettings.language)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Voice Style</p>
                <Badge variant="outline" className="mt-1">
                  {voiceSettings.voiceStyle}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Speed</p>
                <Badge variant="outline" className="mt-1">
                  {voiceSettings.speed}x
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pitch</p>
                <Badge variant="outline" className="mt-1">
                  {voiceSettings.pitch > 1
                    ? "+"
                    : voiceSettings.pitch < 1
                    ? "-"
                    : ""}
                  {Math.round((voiceSettings.pitch - 1) * 100)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Progress */}
      {isDownloading && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Downloading...
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(downloadProgress)}%
                </span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="h-12 text-base"
          size="lg"
        >
          {isDownloading ? (
            <>
              <Download className="h-5 w-5 mr-2 animate-pulse" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-5 w-5 mr-2" />
              Download Voiceover
            </>
          )}
        </Button>

        {/* Replace Button */}
        <Button
          onClick={handleReplace}
          disabled={isReplacing}
          variant="outline"
          className="h-12 text-base"
          size="lg"
        >
          {isReplacing ? (
            <>
              <Replace className="h-5 w-5 mr-2 animate-spin" />
              Replacing...
            </>
          ) : (
            <>
              <Replace className="h-5 w-5 mr-2" />
              Replace Original
            </>
          )}
        </Button>
      </div>

      {/* Additional Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
          className="flex items-center gap-2"
        >
          {copySuccess ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Link
            </>
          )}
        </Button>

        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Share className="h-4 w-4" />
          Share
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(result.url, "_blank")}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Open in New Tab
        </Button>
      </div>

      {/* Success Message */}
      <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                Voiceover Generated Successfully!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your voiceover has been generated in{" "}
                {getLanguageName(voiceSettings.language)} with{" "}
                {voiceSettings.voiceStyle} voice style. You can download it or
                replace the original audio track.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              💡 Pro Tips
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>
                • Download the file before closing the browser to avoid losing
                your work
              </li>
              <li>
                • Use "Replace Original" to update your video with the new
                voiceover
              </li>
              <li>
                • Try different voice styles and speeds to find the perfect
                match
              </li>
              <li>
                • The generated voiceover will match the timing of your original
                content
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
