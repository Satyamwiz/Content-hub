"use client";

import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Type,
  Wand2,
  Copy,
  RotateCcw,
  Save,
  BookOpen,
  Lightbulb,
  Clock,
} from "lucide-react";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  mode: "poem" | "reel";
}

const poemTemplates = [
  {
    title: "Motivational",
    content: `Rise like the morning sun,
Bright and full of hope.
Today is yours to conquer,
Tomorrow's yours to scope.

Dream big, act bold,
Let passion be your guide.
Success awaits those who dare,
To let their light shine wide.`,
  },
  {
    title: "Love",
    content: `In quiet moments shared,
Two hearts beat as one.
Love's gentle whisper echoes,
Until the day is done.

Through seasons that may change,
Our bond remains so true.
In every breath I take,
I find my way to you.`,
  },
  {
    title: "Nature",
    content: `Beneath the starlit sky,
The earth in slumber lies.
While moonbeams dance on water,
And gentle breezes sigh.

The forest holds its secrets,
In every leaf and stone.
Nature's song surrounds us,
We're never truly alone.`,
  },
];

const reelHooks = [
  "Did you know that...",
  "Here's something that will blow your mind:",
  "This changed everything for me:",
  "You've been doing this wrong your whole life:",
  "The secret that nobody talks about:",
  "This one trick will save you hours:",
  "What if I told you...",
  "Stop everything and listen to this:",
];

const aiPrompts = {
  poem: [
    "Write a poem about overcoming challenges",
    "Create a motivational poem about pursuing dreams",
    "Compose a poem about finding inner peace",
    "Write about the beauty of simple moments",
    "Create a poem about gratitude and thankfulness",
  ],
  reel: [
    "Write a script about productivity tips",
    "Create content about self-improvement",
    "Write about social media strategy tips",
    "Create a script about morning routines",
    "Write about building confidence",
  ],
};

export function TextEditor({
  value,
  onChange,
  placeholder,
  mode,
}: TextEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const words = value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
    setReadingTime(Math.ceil(words.length / 200)); // Average reading speed
  }, [value]);

  const handleTemplateSelect = (template: (typeof poemTemplates)[0]) => {
    onChange(template.content);
  };

  const handleHookSelect = (hook: string) => {
    const currentText = value;
    const newText = currentText ? `${hook}\n\n${currentText}` : hook;
    onChange(newText);
  };

  const handleAIGenerate = async (prompt: string) => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const aiGeneratedContent =
      mode === "poem"
        ? `Generated poem based on: "${prompt}"

Stars align in perfect harmony,
As dreams take flight on wings of hope.
Each moment holds unlimited possibility,
When we learn to courageously cope.

Through challenges that test our will,
We discover strength we never knew.
The journey shapes our character still,
Making us better through and through.`
        : `Generated script for: "${prompt}"

Hook: Here's the game-changing insight everyone needs to hear!

Main Content:
Most people struggle with this because they're missing one crucial element. Let me break it down for you in 3 simple steps:

1. First, you need to understand the foundation
2. Then, you apply this specific technique
3. Finally, you track your progress consistently

Call to Action:
Try this today and let me know how it works for you! Follow for more tips like this.`;

    onChange(aiGeneratedContent);
    setIsGenerating(false);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(value);
  };

  const handleClearText = () => {
    onChange("");
  };

  return (
    <div className="space-y-4">
      {/* Editor Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {mode === "poem" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Templates
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h4 className="font-medium">Poem Templates</h4>
                {poemTemplates.map((template, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="font-medium text-sm">{template.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {template.content.split("\n")[0]}...
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {mode === "reel" && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Hooks
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h4 className="font-medium">Attention-Grabbing Hooks</h4>
                <div className="space-y-2">
                  {reelHooks.map((hook, index) => (
                    <div
                      key={index}
                      className="p-2 border rounded cursor-pointer hover:bg-accent transition-colors text-sm"
                      onClick={() => handleHookSelect(hook)}
                    >
                      {hook}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Wand2 className="h-4 w-4" />
              AI Generate
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <h4 className="font-medium">AI Prompts</h4>
              <div className="space-y-2">
                {aiPrompts[mode].map((prompt, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded cursor-pointer hover:bg-accent transition-colors text-sm"
                    onClick={() => handleAIGenerate(prompt)}
                  >
                    {prompt}
                  </div>
                ))}
              </div>
              {isGenerating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wand2 className="h-4 w-4 animate-spin" />
                  Generating content...
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyText}
          disabled={!value}
        >
          <Copy className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearText}
          disabled={!value}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Text Editor */}
      <div className="space-y-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[400px] resize-none font-mono text-sm leading-relaxed"
        />
      </div>

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Type className="h-4 w-4" />
          <span>{wordCount} words</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{readingTime} min read</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {value.length} characters
        </Badge>
        {mode === "reel" && (
          <Badge
            variant={value.length > 500 ? "destructive" : "secondary"}
            className="text-xs"
          >
            {value.length > 500 ? "Too long for reel" : "Good length"}
          </Badge>
        )}
      </div>

      {/* Writing Tips */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <h5 className="font-medium text-sm mb-2">
          {mode === "poem" ? "Poem Writing Tips:" : "Reel Script Tips:"}
        </h5>
        <ul className="text-xs text-muted-foreground space-y-1">
          {mode === "poem" ? (
            <>
              <li>• Use vivid imagery and sensory details</li>
              <li>• Consider rhythm and flow between lines</li>
              <li>• End with a powerful, memorable conclusion</li>
            </>
          ) : (
            <>
              <li>• Start with a strong hook in the first 3 seconds</li>
              <li>• Keep sentences short and punchy</li>
              <li>• Include a clear call-to-action at the end</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
