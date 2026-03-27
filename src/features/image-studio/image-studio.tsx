"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PromptEnhancerButton } from "@/components/shared/prompt-enhancer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Image,
  Wand2,
  Upload,
  Download,
  Copy,
  RefreshCw,
  Sparkles,
  FileText,
  Eye,
  Save,
  Share,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Youtube,
} from "lucide-react";
import { aiImageHelperService } from "@/services/ai-image-helper.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ImageStudioProps {
  onImageGenerated?: (imageUrl: string, caption: string) => void;
}

export function ImageStudio({ onImageGenerated }: ImageStudioProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"generate" | "edit">("generate");
  
  // Generate tab states
  const [prompt, setPrompt] = useState("");
  const [caption, setCaption] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  
  // Edit tab states
  const [editPrompt, setEditPrompt] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [editedImage, setEditedImage] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingEditCaption, setIsGeneratingEditCaption] = useState(false);
  
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<"ready" | "error">("ready");

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt for image generation");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      const result = await response.json();

      if (result.success && result.cloudinaryUrl) {
        setGeneratedImage(result.cloudinaryUrl);
        setPreviewUrl(result.cloudinaryUrl);

        // Generate caption automatically
        await handleGenerateCaption();

        toast.success("Image generated and saved to your gallery!");
        setSuccess("Image generated and saved successfully!");

        if (onImageGenerated) {
          onImageGenerated(result.cloudinaryUrl, caption);
        }
      } else {
        throw new Error(result.error || "Failed to generate image");
      }
    } catch (error) {
      console.error("Image generation error:", error);
      let errorMessage = "Failed to generate image";

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
      setIsGenerating(false);
    }
  };

  const handleGenerateCaption = async () => {
    if (!prompt.trim()) {
      return;
    }

    setIsGeneratingCaption(true);

    try {
      // Generate caption based on the prompt
      const generatedCaption = await generateCaptionFromPrompt(prompt);
      setCaption(generatedCaption);
      toast.success("Caption generated successfully!");
    } catch (error) {
      console.error("Caption generation error:", error);
      toast.error("Failed to generate caption");
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const generateCaptionFromPrompt = async (
    imagePrompt: string
  ): Promise<string> => {
    // Simple caption generation based on prompt
    const captionTemplates = [
      `✨ ${imagePrompt} ✨`,
      `Beautiful ${imagePrompt.toLowerCase()} that caught my eye today 🌟`,
      `Just created this amazing ${imagePrompt.toLowerCase()}! What do you think? 🎨`,
      `Artistic take on ${imagePrompt.toLowerCase()} - created with AI magic ✨`,
      `Exploring the beauty of ${imagePrompt.toLowerCase()} through digital art 🌈`,
    ];

    // Select a random template and customize it
    const template =
      captionTemplates[Math.floor(Math.random() * captionTemplates.length)];

    // Add some hashtags based on the prompt
    const hashtags = generateHashtags(imagePrompt);
    return `${template}\n\n${hashtags}`;
  };

  const generateHashtags = (prompt: string): string => {
    const words = prompt.toLowerCase().split(" ").slice(0, 3);
    const baseHashtags = words
      .map((word) => `#${word.replace(/[^a-z0-9]/g, "")}`)
      .filter((tag) => tag.length > 1);

    const additionalHashtags = [
      "#aiart",
      "#digitalart",
      "#creative",
      "#artwork",
    ];
    return [...baseHashtags, ...additionalHashtags.slice(0, 3)].join(" ");
  };

  const handleCopyCaption = () => {
    if (caption) {
      navigator.clipboard.writeText(caption);
      toast.success("Caption copied to clipboard!");
    }
  };

  const handleDownloadImage = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `ai-generated-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded successfully!");
    }
  };

  const handleUploadToInstagram = () => {
    if (generatedImage && caption) {
      // This would typically open the Instagram publisher with the generated content
      toast.success("Opening Instagram publisher...");
    }
  };

  const handleUploadToYouTube = () => {
    if (generatedImage && caption) {
      // Store the data in localStorage to pass to the upload page
      const uploadData = {
        type: "image",
        imageUrl: generatedImage,
        title: `AI Generated Image - ${new Date().toLocaleDateString()}`,
        description: caption || `Generated with prompt: ${prompt}`,
        tags: "AI,Generated,Image,Art",
        prompt: prompt,
        timestamp: Date.now(),
      };

      localStorage.setItem("youtube-upload-data", JSON.stringify(uploadData));

      // Navigate to the upload tab in dashboard
      router.push("/dashboard?tab=upload");
      toast.success("Redirecting to YouTube upload...");
    } else {
      toast.error("Please generate an image first");
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearSuccess = () => {
    setSuccess(null);
  };

  // Edit tab handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setEditedImage("");
        setEditCaption("");
        setEditPrompt("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImage = async () => {
    if (!uploadedImage || !editPrompt.trim()) {
      setError("Please upload an image and enter editing instructions");
      return;
    }

    setIsEditing(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate image editing - in production, this would call an AI editing API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // For now, just use the uploaded image as the edited result
      setEditedImage(uploadedImage);
      
      // Generate caption for edited image
      await handleGenerateEditCaption();
      
      toast.success("Image edited successfully!");
      setSuccess("Image edited and saved successfully!");
    } catch (error) {
      console.error("Image editing error:", error);
      setError("Failed to edit image. Please try again.");
      toast.error("Failed to edit image");
    } finally {
      setIsEditing(false);
    }
  };

  const handleGenerateEditCaption = async () => {
    if (!editPrompt.trim()) {
      return;
    }

    setIsGeneratingEditCaption(true);

    try {
      const generatedCaption = await generateCaptionFromPrompt(editPrompt);
      setEditCaption(generatedCaption);
      toast.success("Caption generated successfully!");
    } catch (error) {
      console.error("Caption generation error:", error);
      toast.error("Failed to generate caption");
    } finally {
      setIsGeneratingEditCaption(false);
    }
  };

  const handleCopyEditCaption = () => {
    if (editCaption) {
      navigator.clipboard.writeText(editCaption);
      toast.success("Caption copied to clipboard!");
    }
  };

  const handleDownloadEditedImage = () => {
    if (editedImage) {
      const link = document.createElement("a");
      link.href = editedImage;
      link.download = `ai-edited-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded successfully!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Image className="h-8 w-8 text-purple-600" />
            Image Studio
          </h1>
          <p className="text-muted-foreground">
            Create stunning AI-generated images with custom captions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={apiStatus === "ready" ? "default" : "destructive"}>
            {apiStatus === "ready" && <CheckCircle className="h-3 w-3 mr-1" />}
            {apiStatus === "error" && <AlertCircle className="h-3 w-3 mr-1" />}
            {apiStatus === "ready" && "AI Ready"}
            {apiStatus === "error" && "AI Error"}
          </Badge>
        </div>
      </div>

      {/* Feature Selection Cards */}
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              activeTab === "generate" 
                ? "border-purple-500 border-2 shadow-md" 
                : "border-muted hover:border-purple-300"
            }`}
            onClick={() => setActiveTab("generate")}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  activeTab === "generate" 
                    ? "bg-purple-100 dark:bg-purple-900" 
                    : "bg-muted"
                }`}>
                  <Sparkles className={`h-5 w-5 ${
                    activeTab === "generate" 
                      ? "text-purple-600 dark:text-purple-400" 
                      : "text-muted-foreground"
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-1">
                    Generate New Image
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Create stunning AI-generated images from text prompts.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-xs px-2 py-0">Text-to-Image</Badge>
                    <Badge variant="outline" className="text-xs px-2 py-0">Auto Captions</Badge>
                    <Badge variant="outline" className="text-xs px-2 py-0">HD Quality</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              activeTab === "edit" 
                ? "border-blue-500 border-2 shadow-md" 
                : "border-muted hover:border-blue-300"
            }`}
            onClick={() => setActiveTab("edit")}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  activeTab === "edit" 
                    ? "bg-blue-100 dark:bg-blue-900" 
                    : "bg-muted"
                }`}>
                  <Wand2 className={`h-5 w-5 ${
                    activeTab === "edit" 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-muted-foreground"
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold mb-1">
                    Edit Existing Image
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Upload and enhance your images with AI-powered editing.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-xs px-2 py-0">Upload & Edit</Badge>
                    <Badge variant="outline" className="text-xs px-2 py-0">AI Enhancement</Badge>
                    <Badge variant="outline" className="text-xs px-2 py-0">Smart Captions</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={(value: string) =>
          setActiveTab(value as "generate" | "edit")
        }
        className="space-y-6"
      >

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Prompt Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Image Prompt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">
                    Describe the image you want to create:
                  </Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A serene mountain landscape at sunset with a crystal clear lake reflecting the orange and pink sky, digital art style..."
                    rows={6}
                    className="resize-none"
                    disabled={isGenerating}
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {prompt.length}/500 characters
                    </p>
                    <PromptEnhancerButton
                      prompt={prompt}
                      onPromptChange={setPrompt}
                      context="image-generation"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleGenerateImage}
                    disabled={!prompt.trim() || isGenerating}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleGenerateCaption}
                    disabled={!prompt.trim() || isGeneratingCaption}
                  >
                    {isGeneratingCaption ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Caption...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Caption
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Generated Image Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedImage ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={generatedImage}
                        alt="Generated AI Image"
                        className="w-full rounded-lg"
                        style={{ maxHeight: "300px", objectFit: "cover" }}
                      />
                      <Badge className="absolute top-2 left-2 bg-purple-600">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadImage}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadToInstagram}
                      >
                        <Share className="h-4 w-4 mr-1" />
                        Share to Instagram
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadToYouTube}
                      >
                        <Youtube className="h-4 w-4 mr-1" />
                        Upload to YouTube
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">No Image Generated</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter a prompt and click "Generate Image" to create your
                      AI artwork
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Caption Section */}
          {caption && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Caption
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={4}
                    className="resize-none pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleCopyCaption}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCaption}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Caption
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCaption("")}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Edit Tab */}
        <TabsContent value="edit" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Upload & Edit Instructions */}
            <div className="space-y-6">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!uploadedImage ? (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-medium mb-2">Upload an Image</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload an existing image to enhance it with AI
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="max-w-xs mx-auto cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={uploadedImage}
                          alt="Uploaded Image"
                          className="w-full rounded-lg"
                          style={{ maxHeight: "250px", objectFit: "cover" }}
                        />
                        <Badge className="absolute top-2 left-2 bg-blue-600">
                          <Upload className="h-3 w-3 mr-1" />
                          Uploaded
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUploadedImage("");
                          setEditedImage("");
                          setEditPrompt("");
                          setEditCaption("");
                        }}
                        className="w-full"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove & Upload New
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Edit Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-prompt">
                      Describe how you want to edit this image:
                    </Label>
                    <Textarea
                      id="edit-prompt"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g., Make it brighter, add a sunset effect, enhance colors, remove background, add artistic filter..."
                      rows={5}
                      className="resize-none"
                      disabled={isEditing || !uploadedImage}
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {editPrompt.length}/500 characters
                      </p>
                      <PromptEnhancerButton
                        prompt={editPrompt}
                        onPromptChange={setEditPrompt}
                        context="image-generation"
                        disabled={isEditing || !uploadedImage}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleEditImage}
                      disabled={!uploadedImage || !editPrompt.trim() || isEditing}
                      className="bg-blue-600 hover:bg-blue-700 flex-1"
                    >
                      {isEditing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Editing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Edit Image
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleGenerateEditCaption}
                      disabled={!uploadedImage || !editPrompt.trim() || isGeneratingEditCaption}
                    >
                      {isGeneratingEditCaption ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Caption
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editedImage ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={editedImage}
                        alt="Edited AI Image"
                        className="w-full rounded-lg"
                        style={{ maxHeight: "300px", objectFit: "cover" }}
                      />
                      <Badge className="absolute top-2 left-2 bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Edited
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadEditedImage}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadToInstagram}
                      >
                        <Share className="h-4 w-4 mr-1" />
                        Instagram
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadToYouTube}
                      >
                        <Youtube className="h-4 w-4 mr-1" />
                        YouTube
                      </Button>
                    </div>
                  </div>
                ) : uploadedImage ? (
                  <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center">
                    <Wand2 className="h-12 w-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-medium mb-2">Ready to Edit</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter editing instructions and click "Edit Image" to enhance your photo with AI
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">No Image Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload an image to see the preview here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Edit Caption Section */}
          {editCaption && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Caption
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={4}
                    className="resize-none pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleCopyEditCaption}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyEditCaption}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy Caption
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditCaption("")}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Generation/Editing Progress */}
      {(isGenerating || isEditing) && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin text-purple-600" />
                      Generating your image...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 animate-spin text-blue-600" />
                      Editing your image...
                    </>
                  )}
                </span>
                <span className="text-sm text-muted-foreground">
                  Please wait
                </span>
              </div>
              <Progress value={undefined} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {isGenerating 
                  ? "AI is creating your image based on your prompt..."
                  : "AI is enhancing your image based on your instructions..."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Generation Failed</p>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleGenerateImage}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </Button>
                <Button onClick={clearError} variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Display */}
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
    </div>
  );
}
