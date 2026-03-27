"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Lightbulb, 
  Target, 
  Zap, 
  Users, 
  MessageCircle,
  TrendingUp,
  Hash,
  Smile
} from "lucide-react";

export function AiTweetHelp() {
  const tweetTypes = [
    {
      type: "Question",
      icon: <MessageCircle className="h-4 w-4" />,
      description: "Engage your audience with thought-provoking questions",
      example: "What's the best productivity hack you've discovered this year?",
      engagement: "High replies, community building"
    },
    {
      type: "Tip/Advice", 
      icon: <Lightbulb className="h-4 w-4" />,
      description: "Share valuable insights and actionable advice",
      example: "Pro tip: Use the Pomodoro Technique to boost focus. 25 min work + 5 min break = magic ✨",
      engagement: "Saves, shares, bookmarks"
    },
    {
      type: "Story",
      icon: <Users className="h-4 w-4" />,
      description: "Share personal experiences and lessons learned",
      example: "I failed my first startup. Here's what I learned that made my second one successful:",
      engagement: "Emotional connection, shares"
    },
    {
      type: "Thread Starter",
      icon: <TrendingUp className="h-4 w-4" />,
      description: "Hook readers for a longer thread",
      example: "5 mistakes I made in my first year as a developer (and how to avoid them) 🧵",
      engagement: "Thread engagement, follows"
    }
  ];

  const tones = [
    {
      tone: "Professional",
      description: "Authoritative and credible",
      when: "Business insights, industry news, thought leadership"
    },
    {
      tone: "Casual", 
      description: "Friendly and approachable",
      when: "Daily observations, community building, relatable content"
    },
    {
      tone: "Humorous",
      description: "Entertaining and witty", 
      when: "Viral content, memes, light-hearted takes"
    },
    {
      tone: "Inspirational",
      description: "Motivating and uplifting",
      when: "Success stories, motivation, overcoming challenges"
    }
  ];

  const engagementTips = [
    {
      tip: "Start with a hook",
      description: "First 5 words determine if people keep reading",
      example: "This changed everything for me..."
    },
    {
      tip: "Use numbers",
      description: "Specific numbers grab attention and promise value",
      example: "3 tools that saved me 10 hours/week"
    },
    {
      tip: "Ask questions",
      description: "Questions encourage replies and boost engagement",
      example: "What's your take on this?"
    },
    {
      tip: "Share contrarian views",
      description: "Respectful disagreement sparks discussion",
      example: "Unpopular opinion: Remote work isn't for everyone"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            AI Tweet Generator Guide
          </CardTitle>
          <CardDescription>
            Master the art of creating engaging tweets with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Tweet Types */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Tweet Types & When to Use Them
            </h3>
            <div className="grid gap-3">
              {tweetTypes.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      {item.icon}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.type}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.engagement}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                        <p className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded italic">
                          "{item.example}"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tones */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Smile className="h-4 w-4" />
              Choosing the Right Tone
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {tones.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-green-500">
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <span className="font-medium">{item.tone}</span>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Best for: {item.when}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Engagement Tips */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Engagement Boosters
            </h3>
            <div className="grid gap-3">
              {engagementTips.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <span className="font-medium">{item.tip}</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 italic">
                      Example: "{item.example}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Best Practices */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Best Practices
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600 dark:text-green-400">✅ Do</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Keep it under 280 characters</li>
                  <li>• Use 1-3 relevant hashtags max</li>
                  <li>• Add strategic emojis for emotion</li>
                  <li>• Include a clear call-to-action</li>
                  <li>• Share personal experiences</li>
                  <li>• Ask engaging questions</li>
                  <li>• Use line breaks for readability</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-red-600 dark:text-red-400">❌ Don't</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Overuse hashtags (looks spammy)</li>
                  <li>• Be overly promotional</li>
                  <li>• Use complex jargon</li>
                  <li>• Post controversial content</li>
                  <li>• Make it too long or dense</li>
                  <li>• Forget to proofread</li>
                  <li>• Use too many emojis</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">
                🚀 Pro Tips for Viral Content
              </h4>
              <ul className="text-sm space-y-1 text-purple-600 dark:text-purple-400">
                <li>• Tweet during peak hours (9-10 AM, 7-9 PM in your timezone)</li>
                <li>• Use the "Generate 3 variations" feature to A/B test different approaches</li>
                <li>• Engage with replies quickly to boost algorithm visibility</li>
                <li>• Share behind-the-scenes content for authenticity</li>
                <li>• Reference current trends and events when relevant</li>
                <li>• Use the advanced settings to fine-tune for your specific audience</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}