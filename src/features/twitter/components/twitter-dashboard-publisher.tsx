"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Twitter,
  Loader2,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  Image as ImageIcon,
  X,
  Sparkles,
} from "lucide-react";
import { TwitterAuth } from "./twitter-auth";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";

interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profileImageUrl?: string;
}

interface PublishResult {
  id: string;
  text: string;
  url: string;
}

export function TwitterDashboardPublisher({}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<TwitterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [text, setText] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(
    null
  );
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const maxLength = 280;
  const remainingChars = maxLength - text.length;

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/twitter/check-auth");
      const data = await response.json();

      if (data.authenticated && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to check Twitter auth status:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (user: TwitterUser) => {
    setIsAuthenticated(true);
    setUser(user);
  };

  const handleAuthError = (error: string) => {
    setIsAuthenticated(false);
    setUser(null);
    toast.error(error);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    if (imageFiles.length > 0) {
      setMediaFiles((prev) => [...prev, ...imageFiles].slice(0, 4)); // Max 4 images
      toast.success(
        `Added ${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""}`
      );
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 4,
    maxSize: 5 * 1024 * 1024, // 5MB per file
  });

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const generateAITweet = async () => {
    if (!text.trim()) {
      toast.error("Please enter a topic or idea for the AI to work with");
      return;
    }

    try {
      setIsGeneratingAI(true);

      const response = await fetch("/api/ai/generate-tweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: text.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate tweet");
      }

      if (data.tweet) {
        setText(data.tweet);
        toast.success("AI tweet generated successfully!");
      } else {
        throw new Error("No tweet generated");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate AI tweet";
      toast.error(errorMessage);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handlePublish = async () => {
    if (!isAuthenticated) {
      toast.error("Please connect your Twitter account first");
      return;
    }

    if (!text.trim()) {
      toast.error("Please enter some text for your tweet");
      return;
    }

    if (text.length > maxLength) {
      toast.error(
        `Tweet is too long. Maximum ${maxLength} characters allowed.`
      );
      return;
    }

    try {
      setIsPublishing(true);
      setPublishResult(null);

      console.log("🐦 Publishing tweet:", text.substring(0, 50) + "...");

      // Upload media files if any
      let mediaUrls: string[] = [];
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        mediaFiles.forEach((file, index) => {
          formData.append(`media_${index}`, file);
        });

        const uploadResponse = await fetch("/api/upload-media", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadResponse.ok && uploadData.urls) {
          mediaUrls = uploadData.urls;
        }
      }

      const response = await fetch("/api/twitter/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to publish tweet");
      }

      if (data.success && data.tweet) {
        setPublishResult(data.tweet);
        toast.success("Tweet published successfully!");
        setText(""); // Reset form
        setMediaFiles([]); // Clear media files
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("❌ Publish error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to publish tweet";
      toast.error(errorMessage);

      // If authentication error, trigger re-auth
      if (
        errorMessage.includes("authentication") ||
        errorMessage.includes("Unauthorized")
      ) {
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Checking Twitter connection...</span>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitter className="h-5 w-5 text-blue-500" />
              Twitter Publisher
            </CardTitle>
            <CardDescription>
              Connect your Twitter account to start publishing tweets
            </CardDescription>
          </CardHeader>
        </Card>
        <TwitterAuth
          onAuthSuccess={handleAuthSuccess}
          onAuthError={handleAuthError}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Twitter className="h-5 w-5 text-blue-500" />
          Twitter Publisher
        </CardTitle>
        <CardDescription>
          Connected as @{user?.username} • Share your thoughts on Twitter
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tweet Text */}
        <div className="space-y-2">
          <Textarea
            placeholder="What's happening? (or enter a topic for AI to help)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={maxLength}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  remainingChars < 0
                    ? "destructive"
                    : remainingChars < 20
                    ? "secondary"
                    : "outline"
                }
              >
                {remainingChars} characters remaining
              </Badge>
              {mediaFiles.length > 0 && (
                <Badge variant="outline">
                  {mediaFiles.length} image{mediaFiles.length > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateAITweet}
                disabled={isGeneratingAI || !text.trim()}
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Enhance
                  </>
                )}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isPublishing || !text.trim() || remainingChars < 0}
                size="sm"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Twitter className="mr-2 h-4 w-4" />
                    Tweet
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Media Upload */}
        <div className="space-y-2">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
          >
            <input {...getInputProps()} />
            <ImageIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? "Drop images here..."
                : "Drag & drop images here, or click to select"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Up to 4 images, 5MB each
            </p>
          </div>

          {/* Media Preview */}
          {mediaFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Success Result */}
        {publishResult && (
          <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Tweet Published!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-7 text-xs border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
                >
                  <a
                    href={publishResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    View Tweet
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
