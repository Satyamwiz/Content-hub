"use client";

import React, { useState, useCallback } from "react";
import {
  Upload,
  Eye,
  Loader2,
  Image as ImageIcon,
  Palette,
  Tag,
  Lightbulb,
  Users,
  Hash,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface ColorInfo {
  rgb: string;
  hex: string;
  percentage: number;
}

interface AnalysisData {
  labels: string[];
  objects: string[];
  colors: ColorInfo[];
  text: string;
}

interface InsightsData {
  summary: string;
  craft: string;
  marketing_copy: string;
  hashtags: string[];
  audience: string[];
  advice: string;
}

interface VisionAnalysisResult {
  success: boolean;
  uploadedUrl?: string;
  cloudinaryPublicId?: string;
  providedUrl?: string;
  analysis: {
    success: boolean;
    analysis: AnalysisData;
    insights: InsightsData;
  };
  error?: string;
}

export function VisionAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);
  const [error, setError] = useState<string>("");
  const [analysisMode, setAnalysisMode] = useState<"upload" | "url">("upload");

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setError("");
        setResult(null);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleUrlChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const url = event.target.value;
      setImageUrl(url);
      setError("");
      setResult(null);

      if (url) {
        setPreview(url);
      } else {
        setPreview("");
      }
    },
    []
  );

  const analyzeImage = async () => {
    if (!selectedFile && !imageUrl) {
      setError("Please select an image file or provide an image URL");
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      let response: Response;

      if (analysisMode === "upload" && selectedFile) {
        // Upload file mode
        const formData = new FormData();
        formData.append("image", selectedFile);

        response = await fetch("/api/vision-analysis", {
          method: "POST",
          body: formData,
        });
      } else if (analysisMode === "url" && imageUrl) {
        // URL mode
        response = await fetch("/api/vision-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image_url: imageUrl }),
        });
      } else {
        throw new Error("Invalid analysis mode or missing data");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze image");
      }

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to analyze image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setImageUrl("");
    setPreview("");
    setResult(null);
    setError("");
    setIsAnalyzing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">AI Vision Analysis</h1>
        <p className="text-muted-foreground">
          Upload an image or provide a URL to get detailed AI analysis with
          insights and marketing recommendations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Image Analysis
          </CardTitle>
          <CardDescription>
            Choose how you want to provide your image for analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={analysisMode}
            onValueChange={(value) =>
              setAnalysisMode(value as "upload" | "url")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="url">Image URL</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Click to upload an image
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPEG, PNG, GIF, WebP (max 10MB)
                  </p>
                </label>
              </div>
              {selectedFile && (
                <div className="text-sm text-gray-600">
                  Selected: {selectedFile.name} (
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div>
                <label
                  htmlFor="image-url"
                  className="block text-sm font-medium mb-2"
                >
                  Image URL
                </label>
                <input
                  type="url"
                  id="image-url"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </TabsContent>
          </Tabs>

          {preview && (
            <div className="space-y-4">
              <div className="relative max-w-md mx-auto">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-center">
            <Button
              onClick={analyzeImage}
              disabled={isAnalyzing || (!selectedFile && !imageUrl)}
              className="min-w-32"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Analyze Image
                </>
              )}
            </Button>

            {(selectedFile || imageUrl || result) && (
              <Button variant="outline" onClick={resetAnalysis}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && result.success && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Image Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Labels */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Labels
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.analysis.labels.map((label, index) => (
                    <Badge key={index} variant="secondary">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Objects */}
              {result.analysis.analysis.objects.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Objects Detected</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.analysis.objects.map((object, index) => (
                      <Badge key={index} variant="outline">
                        {object}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Dominant Colors
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {result.analysis.analysis.colors
                    .slice(0, 5)
                    .map((color, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded border"
                      >
                        <div
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="flex-1">
                          <div className="font-mono text-sm">{color.hex}</div>
                          <div className="text-xs text-gray-500">
                            {color.rgb}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {color.percentage.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Text (if any) */}
              {result.analysis.analysis.text && (
                <div>
                  <h3 className="font-semibold mb-2">Text Detected</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded">
                    {result.analysis.analysis.text}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-sm text-foreground">
                  {result.analysis.insights.summary}
                </p>
              </div>

              {/* Craft */}
              <div>
                <h3 className="font-semibold mb-2">Identified Craft</h3>
                <Badge variant="default">
                  {result.analysis.insights.craft}
                </Badge>
              </div>

              {/* Marketing Copy */}
              <div>
                <h3 className="font-semibold mb-2">Marketing Copy</h3>
                <p className="text-sm  p-3 rounded italic">
                  "{result.analysis.insights.marketing_copy}"
                </p>
                <Button
                  size="sm"
                  onClick={() =>
                    copyToClipboard(result.analysis.insights.marketing_copy)
                  }
                  className="mt-2"
                >
                  Copy to Clipboard
                </Button>
              </div>

              {/* Hashtags */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Suggested Hashtags
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {result.analysis.insights.hashtags.map((hashtag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                    >
                      {hashtag}
                    </Badge>
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    copyToClipboard(result.analysis.insights.hashtags.join(" "))
                  }
                >
                  Copy All Hashtags
                </Button>
              </div>

              {/* Target Audience */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Target Audience
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.insights.audience.map((audience, index) => (
                    <Badge key={index} variant="outline">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marketing Advice */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Marketing Advice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-line text-sm">
                  {result.analysis.insights.advice}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
