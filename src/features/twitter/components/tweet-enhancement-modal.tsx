"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Sparkles, 
  Copy, 
  RefreshCw,
  Zap,
  Heart,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";

interface TweetEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalTweet: string;
  onSelectEnhancedTweet: (enhancedTweet: string) => void;
}

interface EnhancedTweets {
  clean_version: string;
  viral_version: string;
  creative_version: string;
  reasoning: string;
}

const toneOptions = [
  { value: "professional", label: "Professional", icon: "💼", description: "Authoritative and credible" },
  { value: "funny", label: "Funny / Witty", icon: "😄", description: "Humorous and entertaining" },
  { value: "emotional", label: "Emotional / Relatable", icon: "❤️", description: "Heartfelt and connecting" },
  { value: "bold", label: "Bold / Opinionated", icon: "🔥", description: "Strong and confident" },
  { value: "minimalist", label: "Minimalist / Clean", icon: "✨", description: "Simple and clear" },
  { value: "promotional", label: "Promotional / Marketing", icon: "📢", description: "Engaging and persuasive" },
  { value: "storytelling", label: "Storytelling / Conversational", icon: "📖", description: "Narrative and personal" },
];

export function TweetEnhancementModal({ 
  isOpen, 
  onClose, 
  originalTweet, 
  onSelectEnhancedTweet 
}: TweetEnhancementModalProps) {
  const [selectedTone, setSelectedTone] = useState<string>("");
  const [customTone, setCustomTone] = useState<string>("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedTweets, setEnhancedTweets] = useState<EnhancedTweets | null>(null);

  const handleEnhance = async () => {
    const toneToUse = selectedTone === "custom" ? customTone.trim() : selectedTone;
    
    if (!toneToUse) {
      toast.error("Please select a tone or describe how you want your tweet to sound");
      return;
    }

    try {
      setIsEnhancing(true);
      setEnhancedTweets(null);

      const response = await fetch('/api/ai/enhance-tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tweetText: originalTweet,
          preferredTone: toneToUse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance tweet');
      }

      if (data.success) {
        setEnhancedTweets({
          clean_version: data.clean_version,
          viral_version: data.viral_version,
          creative_version: data.creative_version,
          reasoning: data.reasoning,
        });
        toast.success("Tweet enhanced successfully!");
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to enhance tweet';
      toast.error(errorMessage);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSelectTweet = (tweetText: string) => {
    onSelectEnhancedTweet(tweetText);
    toast.success("Enhanced tweet selected!");
    onClose();
  };

  const copyTweet = (tweetText: string) => {
    navigator.clipboard.writeText(tweetText);
    toast.success("Tweet copied to clipboard!");
  };

  const handleClose = () => {
    setSelectedTone("");
    setCustomTone("");
    setEnhancedTweets(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Enhance Your Tweet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Tweet */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Original Tweet</Label>
            <Card className="border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
              <CardContent className="p-3">
                <p className="text-sm">{originalTweet}</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  {originalTweet.length} characters
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Tone Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">How would you like your tweet to sound?</Label>
            
            <RadioGroup value={selectedTone} onValueChange={setSelectedTone}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {toneOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label 
                      htmlFor={option.value} 
                      className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{option.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
                
                {/* Custom Option */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="font-medium text-sm">
                      Or describe it in your own words...
                    </Label>
                  </div>
                  {selectedTone === "custom" && (
                    <Textarea
                      placeholder="e.g., 'Make it sound like a tech startup founder announcing a breakthrough'"
                      value={customTone}
                      onChange={(e) => setCustomTone(e.target.value)}
                      className="mt-2"
                      rows={2}
                    />
                  )}
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Enhance Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleEnhance}
              disabled={isEnhancing || (!selectedTone || (selectedTone === "custom" && !customTone.trim()))}
              className="min-w-[200px]"
              size="lg"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Enhance Tweet
                </>
              )}
            </Button>
          </div>

          {/* Enhanced Tweets */}
          {enhancedTweets && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Enhanced Versions</Label>
                  <Badge variant="secondary" className="text-xs">
                    {enhancedTweets.reasoning}
                  </Badge>
                </div>

                <div className="grid gap-4">
                  {/* Clean Version */}
                  <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm text-green-800 dark:text-green-200">
                              Clean Version
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {enhancedTweets.clean_version.length} chars
                            </Badge>
                          </div>
                          <p className="text-sm mb-3">{enhancedTweets.clean_version}</p>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            Safe and polished for professional audiences
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyTweet(enhancedTweets.clean_version)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSelectTweet(enhancedTweets.clean_version)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Use
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Viral Version */}
                  <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-sm text-orange-800 dark:text-orange-200">
                              Viral Version
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {enhancedTweets.viral_version.length} chars
                            </Badge>
                          </div>
                          <p className="text-sm mb-3">{enhancedTweets.viral_version}</p>
                          <p className="text-xs text-orange-700 dark:text-orange-300">
                            Catchy and platform-optimized for maximum engagement
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyTweet(enhancedTweets.viral_version)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSelectTweet(enhancedTweets.viral_version)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Use
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Creative Version */}
                  <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-sm text-purple-800 dark:text-purple-200">
                              Creative Version
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {enhancedTweets.creative_version.length} chars
                            </Badge>
                          </div>
                          <p className="text-sm mb-3">{enhancedTweets.creative_version}</p>
                          <p className="text-xs text-purple-700 dark:text-purple-300">
                            Experimental and bold for standing out
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyTweet(enhancedTweets.creative_version)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSelectTweet(enhancedTweets.creative_version)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Use
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}