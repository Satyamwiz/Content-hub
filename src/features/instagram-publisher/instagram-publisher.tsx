"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Instagram,
  Upload,
  Image,
  Video,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  Sparkles,
  Wand2,
  LogOut,
  Link as LinkIcon,
} from "lucide-react";
import { InstagramService } from "@/services/instagram.service";
import { instagramDbService } from "@/services/instagram-db.service";
import { aiImageHelperService } from "@/services/ai-image-helper.service";
import { InstagramAuth } from "@/lib/instagram-auth";
import { InstagramAuthModal } from "@/components/instagram-auth-modal";
import { InstagramDisconnectDialog } from "@/components/instagram-disconnect-dialog";
import { PromptEnhancerButton } from "@/components/shared/prompt-enhancer";
import { toast } from "sonner";

interface InstagramPublisherProps {
  mediaUrl?: string;
  mediaType?: "image" | "video";
  initialCaption?: string;
  onPublishSuccess?: (result: any) => void;
  onPublishError?: (error: string) => void;
  clerkId?: string;
}

export function InstagramPublisher({
  mediaUrl,
  mediaType,
  initialCaption = "",
  onPublishSuccess,
  onPublishError,
  clerkId = "user123",
}: InstagramPublisherProps) {
  const [caption, setCaption] = useState(initialCaption);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"checking" | "ready" | "error" | "unauthenticated">(
    "checking"
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [authInfo, setAuthInfo] = useState<{ userId: string } | null>(null);

  // AI Helper state
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiProcessedImage, setAiProcessedImage] = useState<string>("");
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [isAIProcessed, setIsAIProcessed] = useState(false);

  const instagramService = new InstagramService();

  useEffect(() => {
    checkAuthentication();
    if (mediaUrl) {
      setPreviewUrl(mediaUrl);
    }
  }, [mediaUrl]);

  // Listen for storage events to detect auth changes from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'instagram_auth') {
        console.log('Instagram auth changed, refreshing...');
        checkAuthentication();
      }
    };

    // Listen for custom event from same tab
    const handleAuthChange = () => {
      console.log('Instagram auth changed (same tab), refreshing...');
      checkAuthentication();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('instagram-auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('instagram-auth-changed', handleAuthChange);
    };
  }, []);

  const checkAuthentication = async () => {
    try {
      setApiStatus("checking");

      const authenticated = InstagramAuth.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        setApiStatus("unauthenticated");
        setError(null);
        return;
      }

      const info = instagramService.getAuthInfo();
      setAuthInfo(info);

      const isReady = await instagramService.isReady();
      setApiStatus(isReady ? "ready" : "error");

      if (!isReady) {
        setError("Instagram API is currently unavailable. Please try again later.");
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setApiStatus("error");
      setError("Failed to verify Instagram connection. Please try reconnecting.");
    }
  };

  const handleAuthSuccess = () => {
    toast.success("Instagram account connected successfully!");
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('instagram-auth-changed'));
    checkAuthentication();
  };

  const handleDisconnectClick = () => {
    setShowDisconnectDialog(true);
  };

  const handleDisconnectConfirm = () => {
    InstagramAuth.clearCredentials();
    setIsAuthenticated(false);
    setAuthInfo(null);
    setApiStatus("unauthenticated");
    setShowDisconnectDialog(false);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('instagram-auth-changed'));
    toast.success("Instagram account disconnected successfully");
  };

  const handlePublish = async () => {
    if (!isAuthenticated) {
      setError("Please connect your Instagram account first");
      setShowAuthModal(true);
      return;
    }

    if (!previewUrl) {
      setError("No media selected for publishing");
      return;
    }

    if (!caption.trim()) {
      setError("Please add a caption for your post");
      return;
    }

    if (apiStatus !== "ready") {
      setError("Instagram API is not ready. Please check your connection.");
      return;
    }

    setIsPublishing(true);
    setError(null);
    setSuccess(null);
    setPublishProgress(0);

    try {
      setPublishProgress(25);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = mediaType === "video"
        ? await instagramService.postVideo(previewUrl, caption, true)
        : await instagramService.postPhoto(previewUrl, caption);

      setPublishProgress(75);

      if (result.success) {
        setPublishProgress(100);
        setSuccess(
          `Successfully published to Instagram! ${result.media_id ? `Media ID: ${result.media_id}` : ""
          }`
        );

        if (onPublishSuccess) {
          onPublishSuccess(result);
        }

        setTimeout(() => {
          setCaption("");
          setPreviewUrl(null);
          setIsAIProcessed(false);
        }, 2000);
      } else {
        throw new Error(result.error || "Publishing failed");
      }
    } catch (error) {
      console.error("Publishing failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to publish to Instagram. Please try again.";
      setError(errorMessage);

      if (onPublishError) {
        onPublishError(errorMessage);
      }
    } finally {
      setIsPublishing(false);
      setTimeout(() => setPublishProgress(0), 1000);
    }
  };

  const handleMediaUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const previewUrl = URL.createObjectURL(file);
        setPreviewUrl(previewUrl);

        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/instagram-upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success && result.url) {
          setPreviewUrl(result.url);
          setIsAIProcessed(false);
          console.log("Image uploaded successfully:", result.url);
        } else {
          setError(`Upload failed: ${result.error || "Unknown error"}`);
          console.error("Upload error details:", result.error);
        }
      } catch (error) {
        console.error("Upload error:", error);
        setError("Failed to upload image. Please try again.");
      }
    }
  };

  const handleAIProcessing = async () => {
    if (!previewUrl || !aiPrompt.trim()) {
      setError("Please select an image and enter a prompt for AI processing");
      return;
    }

    setIsProcessingAI(true);
    setError(null);

    try {
      console.log("Starting AI processing:", {
        prompt: aiPrompt,
        imageUrl: previewUrl,
      });

      const aiResult = await aiImageHelperService.processImage({
        prompt: aiPrompt,
        image_url: previewUrl,
      });

      if (aiResult.success && aiResult.imageBlob) {
        console.log("AI processing successful");

        const tempPreviewUrl = aiImageHelperService.blobToObjectURL(
          aiResult.imageBlob
        );

        const processedFormData = new FormData();
        processedFormData.append(
          "image",
          aiResult.imageBlob,
          "ai-processed-image.jpg"
        );

        console.log("Uploading processed image to Cloudinary...");

        const uploadResponse = await fetch("/api/instagram-upload", {
          method: "POST",
          body: processedFormData,
        });

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success && uploadResult.url) {
          setPreviewUrl(uploadResult.url);
          setAiProcessedImage(uploadResult.url);
          setIsAIProcessed(true);
          URL.revokeObjectURL(tempPreviewUrl);

          setTimeout(() => {
            toast.success(
              `AI processing completed successfully! ${aiResult.caption ? `Caption: ${aiResult.caption}` : ""
              }`
            );
            setShowAIPrompt(false);
            setAiPrompt("");
          }, 100);
        } else {
          URL.revokeObjectURL(tempPreviewUrl);
          throw new Error(
            uploadResult.error || "Failed to upload processed image"
          );
        }
      } else {
        throw new Error(
          aiResult.error || "AI processing failed - no image returned"
        );
      }
    } catch (error) {
      console.error("AI processing error:", error);
      let errorMessage = "Failed to process image with AI";

      if (error instanceof Error) {
        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("ERR_NAME_NOT_RESOLVED")
        ) {
          errorMessage =
            "AI service is currently unavailable. Please check your internet connection and try again.";
        } else if (
          error.message.includes("404") ||
          error.message.includes("Not Found")
        ) {
          errorMessage =
            "AI service endpoint not found. Please contact support.";
        } else if (
          error.message.includes("500") ||
          error.message.includes("502") ||
          error.message.includes("503")
        ) {
          errorMessage =
            "AI service is temporarily down. Please try again in a few minutes.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearSuccess = () => {
    setSuccess(null);
  };

  const isReady =
    apiStatus === "ready" &&
    isAuthenticated &&
    previewUrl &&
    caption.trim() &&
    !isProcessingAI;

  return (
    <div className="space-y-6">
      <InstagramAuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
      <InstagramDisconnectDialog
        open={showDisconnectDialog}
        onClose={() => setShowDisconnectDialog(false)}
        onConfirm={handleDisconnectConfirm}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              apiStatus === "ready"
                ? "default"
                : apiStatus === "unauthenticated"
                  ? "secondary"
                  : "destructive"
            }
          >
            {apiStatus === "ready" && <CheckCircle className="h-3 w-3 mr-1" />}
            {apiStatus === "error" && <AlertCircle className="h-3 w-3 mr-1" />}
            {apiStatus === "unauthenticated" && <LinkIcon className="h-3 w-3 mr-1" />}
            {apiStatus === "checking" && (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            )}
            {apiStatus === "ready" && "Connected"}
            {apiStatus === "error" && "API Error"}
            {apiStatus === "unauthenticated" && "Not Connected"}
            {apiStatus === "checking" && "Checking..."}
          </Badge>
          {isAuthenticated && authInfo && (
            <Badge variant="outline" className="text-xs">
              User ID: {authInfo.userId}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {!isAuthenticated ? (
            <Button onClick={() => setShowAuthModal(true)} size="sm">
              <Instagram className="h-4 w-4 mr-2" />
              Connect Instagram
            </Button>
          ) : (
            <Button
              onClick={handleDisconnectClick}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          )}
        </div>
      </div>

      {apiStatus === "unauthenticated" && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <LinkIcon className="h-4 w-4" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Instagram Account Not Connected
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please connect your Instagram account to publish posts and view analytics.
                </p>
              </div>
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="outline"
                size="sm"
              >
                <Instagram className="h-3 w-3 mr-1" />
                Connect Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {apiStatus === "error" && isAuthenticated && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Instagram API Temporarily Unavailable
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {error || "The Instagram publishing service is currently experiencing issues. Please try again later."}
                </p>
              </div>
              <Button
                onClick={checkAuthentication}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isAuthenticated && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Media Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!previewUrl ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Upload Media</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a photo or video to publish to Instagram
                  </p>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="max-w-xs mx-auto"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    {mediaType === "video" ? (
                      <video
                        key={previewUrl}
                        src={previewUrl}
                        controls
                        className="w-full rounded-lg"
                        style={{ maxHeight: "300px" }}
                      />
                    ) : (
                      <img
                        key={previewUrl}
                        src={previewUrl}
                        alt="Preview"
                        className="w-full rounded-lg"
                        style={{ maxHeight: "300px", objectFit: "cover" }}
                        onError={(e) => {
                          console.error("Image preview failed to load:", previewUrl);
                          setError("Failed to load image preview");
                        }}
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setPreviewUrl(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">
                      {mediaType === "video" ? (
                        <Video className="h-3 w-3 mr-1" />
                      ) : (
                        <Image className="h-3 w-3 mr-1" />
                      )}
                      {mediaType === "video" ? "Video" : "Image"}
                    </Badge>
                    {isAIProcessed && (
                      <Badge
                        variant="default"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Enhanced
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const fileInput = document.querySelector(
                          'input[type="file"]'
                        ) as HTMLInputElement;
                        fileInput?.click();
                      }}
                    >
                      Change Media
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAIPrompt(!showAIPrompt)}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      <Wand2 className="h-3 w-3 mr-1" />
                      AI Edit
                    </Button>
                  </div>

                  {showAIPrompt && (
                    <div className="space-y-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          AI Image Enhancement
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ai-prompt" className="text-sm">
                          Enter a prompt to generate or enhance your image:
                        </Label>
                        <Textarea
                          id="ai-prompt"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="e.g., Freshly brewed coffee, Artisan handmade ceramic mug, Beautiful sunset over mountains..."
                          rows={3}
                          className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          {aiPrompt.length}/200 characters
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleAIProcessing}
                          disabled={!aiPrompt.trim() || isProcessingAI}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {isProcessingAI ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-3 w-3 mr-1" />
                              Apply AI Magic
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAIPrompt(false);
                            setAiPrompt("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Post Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="caption">Caption</Label>
                  <PromptEnhancerButton
                    prompt={caption}
                    onPromptChange={setCaption}
                    context="instagram-caption"
                    disabled={!isAuthenticated}
                    maxLength={2200}
                    label="Enhance Caption"
                  />
                </div>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write your Instagram caption here... (AI can enhance it with hashtags & hooks)"
                  rows={4}
                  className="resize-none"
                  disabled={!isAuthenticated}
                />
                <p className="text-xs text-muted-foreground">
                  {caption.length}/2200 characters
                </p>
              </div>

              {caption.length > 2000 && (
                <div className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3 w-3" />
                  Caption is getting long. Consider shortening it.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {isProcessingAI && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin text-purple-600" />
                  Processing with AI...
                </span>
                <span className="text-sm text-muted-foreground">
                  Please wait
                </span>
              </div>
              <Progress value={undefined} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Applying AI enhancements to your image...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isPublishing && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing to Instagram...
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(publishProgress)}%
                </span>
              </div>
              <Progress value={publishProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Uploading media and publishing to Instagram...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && apiStatus !== "unauthenticated" && apiStatus !== "error" && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Error</p>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
              <Button onClick={clearError} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{success}</span>
              </div>
              <Button onClick={clearSuccess} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isAuthenticated && (
        <div className="flex justify-center">
          <Button
            onClick={handlePublish}
            disabled={!isReady || isPublishing || isProcessingAI}
            size="lg"
            className="min-w-48"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Instagram className="h-5 w-5 mr-2" />
                Publish to Instagram
              </>
            )}
          </Button>
        </div>
      )}

      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleMediaUpload}
        style={{ display: "none" }}
      />
    </div>
  );
}