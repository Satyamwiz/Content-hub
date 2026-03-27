"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Video,
  FileVideo,
  CheckCircle,
  XCircle,
  Loader2,
  Link,
  Share2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  enhanceContentWithAI,
  generateContentFromFileName,
} from "@/services/content-enhancement.service";
import { toast } from "sonner";

interface UploadedVideo {
  videoId: string;
  url: string;
}

export function YouTubeUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState<string>("private");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for uploaded content data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem("youtube-upload-data");
    if (storedData) {
      try {
        const uploadData = JSON.parse(storedData);

        // Pre-populate form fields with the stored data
        if (uploadData.title) setTitle(uploadData.title);
        if (uploadData.description) setDescription(uploadData.description);
        if (uploadData.tags) setTags(uploadData.tags);

        // Clear the stored data after using it
        localStorage.removeItem("youtube-upload-data");

        // Show notification about pre-populated content
        if (uploadData.type === "image") {
          setError(null); // Clear any existing errors
          toast.success(
            "Generated image content loaded! Please select the image file to upload."
          );
        } else if (uploadData.type === "video") {
          setError(null); // Clear any existing errors
          toast.success(
            "Generated video content loaded! Please select the video file to upload."
          );
        }
      } catch (err) {
        console.error("Failed to parse stored upload data:", err);
        localStorage.removeItem("youtube-upload-data");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);

    // Set default title from filename if not already set
    if (file && !title) {
      // Remove extension and replace dashes/underscores with spaces
      const defaultTitle = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]/g, " ");
      setTitle(defaultTitle);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);

      // Set default title from filename if not already set
      if (!title) {
        const defaultTitle = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[_-]/g, " ");
        setTitle(defaultTitle);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a video file to upload");
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    // Create progress simulation
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 500);

    try {
      const formData = new FormData();
      formData.append("video", selectedFile);
      formData.append(
        "title",
        title || selectedFile.name.replace(/\.[^/.]+$/, "")
      );
      formData.append("description", description);
      formData.append("tags", tags);
      formData.append("privacyStatus", privacy);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      if (result.success) {
        setUploadProgress(100);
        setUploadedVideo({
          videoId: result.videoId,
          url: result.url,
        });
      } else {
        throw new Error("Upload failed with unknown error");
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError((err as Error).message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTitle("");
    setDescription("");
    setTags("");
    setPrivacy("private");
    setUploadedVideo(null);
    setError(null);
    setUploadProgress(0);
    setEnhancing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Link copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err));
  };

  const handleEnhanceContent = async () => {
    if (!title && !description && !tags && !selectedFile) {
      setError("Please provide some content or select a video file to enhance");
      return;
    }

    setEnhancing(true);
    setError(null);

    try {
      let result;

      if (!title && !description && !tags && selectedFile) {
        // Generate content from filename if no existing content
        result = await generateContentFromFileName(selectedFile.name);
      } else {
        // Enhance existing content
        result = await enhanceContentWithAI({
          title,
          description,
          tags,
          videoFileName: selectedFile?.name,
        });
      }

      if (result.success) {
        setTitle(result.enhancedTitle);
        setDescription(result.enhancedDescription);
        setTags(result.enhancedTags);
      } else {
        setError(result.error || "Failed to enhance content");
      }
    } catch (err: any) {
      setError(err.message || "Failed to enhance content");
    } finally {
      setEnhancing(false);
    }
  };

  // Render uploaded video success
  if (uploadedVideo) {
    return (
      <Card className="w-full">
        <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-900/30">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <CardTitle>Video Uploaded Successfully</CardTitle>
          </div>
          <CardDescription>
            Your video has been uploaded to YouTube
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${uploadedVideo.videoId}`}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              title="Uploaded video"
            />
          </div>

          <div className="space-y-2">
            <Label>Video Link</Label>
            <div className="flex">
              <Input
                value={uploadedVideo.url}
                readOnly
                className="rounded-r-none"
              />
              <Button
                variant="outline"
                className="rounded-l-none border-l-0"
                onClick={() => copyToClipboard(uploadedVideo.url)}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetForm}>
            Upload Another Video
          </Button>
          <Button
            onClick={() => window.open(uploadedVideo.url, "_blank")}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View on YouTube
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload to YouTube
        </CardTitle>
        <CardDescription>
          Upload your video directly to your YouTube channel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File upload area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors ${
            selectedFile ? "border-primary" : "border-muted-foreground/25"
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-2">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <FileVideo className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                Change File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Video className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="font-medium">Drag and drop your video here</p>
                <p className="text-sm text-muted-foreground">
                  MP4, MOV, or AVI up to 2GB
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Video details */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Video description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="nextjs, youtube, api"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Privacy</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={privacy}
              onValueChange={(value) => value && setPrivacy(value)}
              className="justify-start"
            >
              <ToggleGroupItem value="private">Private</ToggleGroupItem>
              <ToggleGroupItem value="unlisted">Unlisted</ToggleGroupItem>
              <ToggleGroupItem value="public">Public</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* AI Enhancement Button */}
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={handleEnhanceContent}
              disabled={enhancing || uploading}
              className="w-full"
            >
              {enhancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Enhance using AI
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              AI will optimize your title, description, and tags for better
              reach
            </p>
          </div>
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              This may take a few minutes depending on your video size
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Upload Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload to YouTube
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
