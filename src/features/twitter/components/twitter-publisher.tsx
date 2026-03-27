"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Twitter, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Copy,
  Wand2,
  HelpCircle
} from "lucide-react";
import { TwitterAuth } from "./twitter-auth";
import { AiTweetHelp } from "./ai-tweet-help";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface TwitterPublisherProps {
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  initialText?: string;
  onPublishSuccess?: (result: { id: string; text: string; url: string }) => void;
  onPublishError?: (error: string) => void;
  clerkId?: string;
}

interface PublishResult {
  id: string;
  text: string;
  url: string;
}

export function TwitterPublisher({
  mediaUrl,
  mediaType,
  initialText = "",
  onPublishSuccess,
  onPublishError,
}: TwitterPublisherProps) {
  const [text, setText] = useState(initialText);
  const [mediaUrls, setMediaUrls] = useState<string[]>(mediaUrl ? [mediaUrl] : []);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  
  // AI Generation States
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTweets, setGeneratedTweets] = useState<any[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  
  // AI Configuration States
  const [tweetType, setTweetType] = useState("general");
  const [tone, setTone] = useState("professional");
  const [targetAudience, setTargetAudience] = useState("general");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [callToAction, setCallToAction] = useState(false);
  const [generateMultiple, setGenerateMultiple] = useState(false);
  
  // Prompt Suggestions
  const [promptSuggestions, setPromptSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const maxLength = 280;
  const remainingChars = maxLength - text.length;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // For demo purposes, we'll just show the file names
    // In production, you'd upload these to your media storage
    acceptedFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      setMediaUrls(prev => [...prev.slice(0, 3), url]); // Max 4 media items
      toast.success(`Added ${file.name}`);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
    },
    maxFiles: 4,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text for your tweet");
      return;
    }

    if (text.length > maxLength) {
      toast.error(`Tweet is too long. Maximum ${maxLength} characters allowed.`);
      return;
    }

    try {
      setIsPublishing(true);
      setPublishResult(null);

      const response = await fetch('/api/twitter/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish tweet');
      }

      if (data.success && data.tweet) {
        setPublishResult(data.tweet);
        toast.success("Tweet published successfully!");
        onPublishSuccess?.(data.tweet);
        
        // Reset form
        setText("");
        setMediaUrls([]);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Publish error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish tweet';
      toast.error(errorMessage);
      onPublishError?.(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleAuthError = (error: string) => {
    setIsAuthenticated(false);
    toast.error(error);
  };

  const generateTweet = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt for AI generation");
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratedTweets([]);

      const response = await fetch('/api/ai/generate-tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          tweetType,
          tone,
          targetAudience,
          includeHashtags,
          includeEmojis,
          callToAction,
          generateMultiple
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tweet');
      }

      if (data.multiple && data.tweets) {
        setGeneratedTweets(data.tweets);
        toast.success(`Generated ${data.tweets.length} tweet variations!`);
      } else if (data.tweet) {
        setGeneratedTweets([{
          tweet: data.tweet,
          approach: 'Generated Tweet',
          length: data.originalLength
        }]);
        toast.success("Tweet generated successfully!");
      }
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate tweet';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const useTweet = (tweetText: string) => {
    setText(tweetText);
    toast.success("Tweet added to composer!");
  };

  const copyTweet = (tweetText: string) => {
    navigator.clipboard.writeText(tweetText);
    toast.success("Tweet copied to clipboard!");
  };

  const loadPromptSuggestions = async (category: string = 'general') => {
    try {
      setIsLoadingSuggestions(true);
      
      const response = await fetch('/api/ai/suggest-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          userContext: `Target audience: ${targetAudience}, Tone: ${tone}`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load suggestions');
      }

      setPromptSuggestions(data.suggestions || []);
      setShowSuggestions(true);
      
    } catch (error) {
      console.error('Suggestions error:', error);
      toast.error('Failed to load prompt suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const usePromptSuggestion = (prompt: string) => {
    setAiPrompt(prompt);
    setShowSuggestions(false);
    toast.success("Prompt added! Click generate to create your tweet.");
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
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
        
        <TwitterAuth onAuthSuccess={handleAuthSuccess} onAuthError={handleAuthError} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Twitter className="h-5 w-5 text-blue-500" />
              Compose Tweet
            </div>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Help
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>AI Tweet Generator Guide</DialogTitle>
                  </DialogHeader>
                  <AiTweetHelp />
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAiPanel(!showAiPanel)}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                AI Assistant
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Share your thoughts with the world or use AI to craft the perfect tweet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Generation Panel */}
          {showAiPanel && (
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  AI Tweet Generator
                </CardTitle>
                <CardDescription>
                  Describe what you want to tweet about and let AI craft the perfect message
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="simple" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="simple">Simple</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="simple" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ai-prompt">What do you want to tweet about?</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadPromptSuggestions('general')}
                          disabled={isLoadingSuggestions}
                          className="text-xs"
                        >
                          {isLoadingSuggestions ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Sparkles className="h-3 w-3 mr-1" />
                          )}
                          Get Ideas
                        </Button>
                      </div>
                      <Textarea
                        id="ai-prompt"
                        placeholder="e.g., 'Share a productivity tip for developers' or 'Announce my new project launch'"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="min-h-[80px]"
                      />
                      
                      {/* Prompt Suggestions */}
                      {showSuggestions && promptSuggestions.length > 0 && (
                        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium">💡 Prompt Ideas</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSuggestions(false)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="grid gap-2 max-h-48 overflow-y-auto">
                              {promptSuggestions.slice(0, 6).map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="p-2 rounded border bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  onClick={() => usePromptSuggestion(suggestion.prompt)}
                                >
                                  <p className="text-sm font-medium">{suggestion.prompt}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {suggestion.reason}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={generateTweet}
                        disabled={isGenerating || !aiPrompt.trim()}
                        className="flex items-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Generate Tweet
                          </>
                        )}
                      </Button>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="multiple-tweets"
                          checked={generateMultiple}
                          onCheckedChange={setGenerateMultiple}
                        />
                        <Label htmlFor="multiple-tweets" className="text-sm">
                          Generate 3 variations
                        </Label>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ai-prompt-advanced">What do you want to tweet about?</Label>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadPromptSuggestions('business')}
                            disabled={isLoadingSuggestions}
                            className="text-xs"
                          >
                            Business
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadPromptSuggestions('tech')}
                            disabled={isLoadingSuggestions}
                            className="text-xs"
                          >
                            Tech
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadPromptSuggestions('personal')}
                            disabled={isLoadingSuggestions}
                            className="text-xs"
                          >
                            Personal
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        id="ai-prompt-advanced"
                        placeholder="Describe your tweet idea in detail..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="min-h-[80px]"
                      />
                      
                      {/* Advanced Prompt Suggestions */}
                      {showSuggestions && promptSuggestions.length > 0 && (
                        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium">💡 Prompt Ideas</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSuggestions(false)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="grid gap-2 max-h-48 overflow-y-auto">
                              {promptSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="p-2 rounded border bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  onClick={() => usePromptSuggestion(suggestion.prompt)}
                                >
                                  <p className="text-sm font-medium">{suggestion.prompt}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Expected: {suggestion.engagement}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {suggestion.reason}
                                  </p>
                                  {suggestion.example && (
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">
                                      Example: {suggestion.example}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tweet Type</Label>
                        <Select value={tweetType} onValueChange={setTweetType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="question">Question</SelectItem>
                            <SelectItem value="tip">Tip/Advice</SelectItem>
                            <SelectItem value="story">Story</SelectItem>
                            <SelectItem value="quote">Quote</SelectItem>
                            <SelectItem value="announcement">Announcement</SelectItem>
                            <SelectItem value="thread">Thread Starter</SelectItem>
                            <SelectItem value="poll">Poll</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Tone</Label>
                        <Select value={tone} onValueChange={setTone}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="humorous">Humorous</SelectItem>
                            <SelectItem value="inspirational">Inspirational</SelectItem>
                            <SelectItem value="educational">Educational</SelectItem>
                            <SelectItem value="personal">Personal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Target Audience</Label>
                        <Select value={targetAudience} onValueChange={setTargetAudience}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
                            <SelectItem value="developers">Developers</SelectItem>
                            <SelectItem value="marketers">Marketers</SelectItem>
                            <SelectItem value="creators">Creators</SelectItem>
                            <SelectItem value="students">Students</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="hashtags"
                          checked={includeHashtags}
                          onCheckedChange={setIncludeHashtags}
                        />
                        <Label htmlFor="hashtags">Include Hashtags</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="emojis"
                          checked={includeEmojis}
                          onCheckedChange={setIncludeEmojis}
                        />
                        <Label htmlFor="emojis">Include Emojis</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="cta"
                          checked={callToAction}
                          onCheckedChange={setCallToAction}
                        />
                        <Label htmlFor="cta">Call to Action</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="multiple-advanced"
                          checked={generateMultiple}
                          onCheckedChange={setGenerateMultiple}
                        />
                        <Label htmlFor="multiple-advanced">Generate 3 variations</Label>
                      </div>
                    </div>
                    
                    <Button
                      onClick={generateTweet}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className="w-full flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate Tweet
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
                
                {/* Generated Tweets Display */}
                {generatedTweets.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <Label className="text-sm font-medium">Generated Tweets:</Label>
                    {generatedTweets.map((tweet, index) => (
                      <Card key={index} className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm flex-1">{tweet.tweet}</p>
                              <Badge variant="outline" className="text-xs">
                                {tweet.length} chars
                              </Badge>
                            </div>
                            {tweet.approach && (
                              <p className="text-xs text-muted-foreground">
                                Approach: {tweet.approach}
                              </p>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => useTweet(tweet.tweet)}
                                className="flex items-center gap-1"
                              >
                                <RefreshCw className="h-3 w-3" />
                                Use This
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyTweet(tweet.tweet)}
                                className="flex items-center gap-1"
                              >
                                <Copy className="h-3 w-3" />
                                Copy
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {/* Tweet Text */}
          <div className="space-y-2">
            <Textarea
              placeholder="What's happening?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={maxLength}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={remainingChars < 0 ? "destructive" : remainingChars < 20 ? "secondary" : "outline"}
                >
                  {remainingChars} characters remaining
                </Badge>
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
            >
              <input {...getInputProps()} />
              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? "Drop media files here..."
                  : "Drag & drop media files here, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Images and videos up to 50MB (max 4 files)
              </p>
            </div>

            {/* Media Preview */}
            {mediaUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {mediaUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      {url.startsWith('blob:') ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ) : (
                        <img
                          src={url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
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

          <Separator />

          {/* Publish Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {mediaUrls.length > 0 && (
                <span>{mediaUrls.length} media file{mediaUrls.length > 1 ? 's' : ''} attached</span>
              )}
            </div>
            <Button
              onClick={handlePublish}
              disabled={isPublishing || !text.trim() || remainingChars < 0}
              className="min-w-[120px]"
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
        </CardContent>
      </Card>

      {/* Success Result */}
      {publishResult && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-green-800 dark:text-green-200">
                  Tweet Published Successfully!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {publishResult.text}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
                >
                  <a
                    href={publishResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    View on Twitter
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}