"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Video,
  FileText,
  Wand2,
  Play,
  Upload,
  Save,
  Share,
} from "lucide-react";
import { TextEditor } from "@/features/reel-creation/components/text-editor";
import { VideoCanvas } from "@/features/reel-creation/components/video-canvas";
import { EditingToolbar } from "@/features/reel-creation/components/editing-toolbar";
import { ReelPreview } from "@/features/reel-creation/components/reel-preview";
import { TutorialButton } from "@/features/tutorial/tutorial-button";

export function ReelCreation() {
  const [activeMode, setActiveMode] = useState<"poem" | "reel">("poem");
  const [poemText, setPoemText] = useState("");
  const [reelScript, setReelScript] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleGenerateReel = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsGenerating(false);
    setIsPreviewOpen(true);
  };

  const handleUploadToInstagram = () => {
    console.log("Uploading to Instagram...");
    // Handle Instagram upload
  };

  const handleSaveDraft = () => {
    console.log("Saving draft...");
    // Handle save draft
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reel Creator</h1>
          <p className="text-muted-foreground">
            Create engaging reels from poems and scripts
          </p>
          <TutorialButton
            page="studio"
            label="Studio Tutorial"
            className="mt-1 h-auto p-0"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <Play className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleUploadToInstagram}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Mode Tabs */}
      <Tabs
        value={activeMode}
        onValueChange={(value) => setActiveMode(value as "poem" | "reel")}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="poem" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Poem Mode
          </TabsTrigger>
          <TabsTrigger value="reel" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Reel Mode
          </TabsTrigger>
        </TabsList>

        {/* Poem Mode */}
        <TabsContent value="poem" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Text Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Poem Editor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TextEditor
                  value={poemText}
                  onChange={setPoemText}
                  placeholder="Write your poem here...
                  
Lines of verse that dance and flow,
Through words that make emotions glow.
Each stanza tells a story true,
Of moments old and visions new..."
                  mode="poem"
                />
              </CardContent>
            </Card>

            {/* Right Column - Video Canvas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Visual Canvas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoCanvas
                  selectedMedia={selectedMedia}
                  onMediaChange={setSelectedMedia}
                  mode="poem"
                />
              </CardContent>
            </Card>
          </div>

          {/* Editing Toolbar */}
          <EditingToolbar mode="poem" />

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGenerateReel}
              disabled={!poemText.trim() || isGenerating}
              className="flex items-center gap-2"
            >
              <Wand2 className="h-5 w-5" />
              {isGenerating ? "Generating Poem Reel..." : "Generate Poem Reel"}
            </Button>
          </div>
        </TabsContent>

        {/* Reel Mode */}
        <TabsContent value="reel" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Script Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Script Editor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TextEditor
                  value={reelScript}
                  onChange={setReelScript}
                  placeholder="Write your reel script here...
                  
Hook: Start with something attention-grabbing
Main Content: Your key message or story
Call to Action: What do you want viewers to do?"
                  mode="reel"
                />
              </CardContent>
            </Card>

            {/* Right Column - Video Canvas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Canvas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoCanvas
                  selectedMedia={selectedMedia}
                  onMediaChange={setSelectedMedia}
                  mode="reel"
                />
              </CardContent>
            </Card>
          </div>

          {/* Editing Toolbar */}
          <EditingToolbar mode="reel" />

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGenerateReel}
              disabled={!reelScript.trim() || isGenerating}
              className="flex items-center gap-2"
            >
              <Wand2 className="h-5 w-5" />
              {isGenerating ? "Generating Reel..." : "Generate Reel"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      <ReelPreview
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        content={activeMode === "poem" ? poemText : reelScript}
        media={selectedMedia}
        mode={activeMode}
      />
    </div>
  );
}
