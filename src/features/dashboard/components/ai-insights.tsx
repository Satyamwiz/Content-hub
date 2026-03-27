"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Lightbulb,
  Clock,
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
} from "lucide-react";

const insights = [
  {
    title: "Optimal Posting Time",
    description:
      "Your audience is most active between 2-4 PM on weekdays and 10 AM-12 PM on weekends",
    tip: "Schedule your high-priority content during these peak engagement windows",
    icon: Clock,
    highlight: "2-4 PM weekdays",
    color: "blue",
  },
  {
    title: "Content Performance",
    description:
      "Carousel posts receive 2.4x more engagement compared to single image posts",
    tip: "Create multi-slide carousels with storytelling elements to maximize reach",
    icon: BarChart3,
    highlight: "2.4x engagement",
    color: "green",
  },
  {
    title: "Hashtag Strategy",
    description:
      "Posts with 5-7 relevant hashtags perform 35% better than those with more",
    tip: "Focus on quality over quantity - use targeted, niche-specific hashtags",
    icon: Target,
    highlight: "5-7 hashtags",
    color: "purple",
  },
  {
    title: "Content Type Mix",
    description:
      "Educational content generates 40% higher save rates than promotional posts",
    tip: "Follow the 80/20 rule: 80% value-driven content, 20% promotional",
    icon: Lightbulb,
    highlight: "40% higher saves",
    color: "orange",
  },
  {
    title: "Posting Frequency",
    description:
      "Accounts posting 4-5 times per week see 23% better follower growth",
    tip: "Maintain consistent posting schedule rather than sporadic high-volume posting",
    icon: Calendar,
    highlight: "4-5 posts/week",
    color: "pink",
  },
  {
    title: "Engagement Pattern",
    description:
      "Stories posted within 2 hours of feed posts increase overall reach by 18%",
    tip: "Use Stories to amplify your feed content and drive traffic to main posts",
    icon: TrendingUp,
    highlight: "18% reach boost",
    color: "cyan",
  },
];

const colorClasses = {
  blue: {
    border: "border-l-blue-500",
    icon: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
    metric: "text-blue-600 dark:text-blue-400",
  },
  green: {
    border: "border-l-green-500",
    icon: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
    metric: "text-green-600 dark:text-green-400",
  },
  purple: {
    border: "border-l-purple-500",
    icon: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950",
    text: "text-purple-700 dark:text-purple-300",
    metric: "text-purple-600 dark:text-purple-400",
  },
  orange: {
    border: "border-l-orange-500",
    icon: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950",
    text: "text-orange-700 dark:text-orange-300",
    metric: "text-orange-600 dark:text-orange-400",
  },
  pink: {
    border: "border-l-pink-500",
    icon: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950",
    text: "text-pink-700 dark:text-pink-300",
    metric: "text-pink-600 dark:text-pink-400",
  },
  cyan: {
    border: "border-l-cyan-500",
    icon: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-950",
    text: "text-cyan-700 dark:text-cyan-300",
    metric: "text-cyan-600 dark:text-cyan-400",
  },
};

export function AIInsights() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">AI-Powered Insights</h3>
          <p className="text-sm text-muted-foreground">
            Data-driven recommendations to optimize your content strategy
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          Live data
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight, index) => {
          const colors =
            colorClasses[insight.color as keyof typeof colorClasses];
          return (
            <Card
              key={index}
              className={`${colors.border} border-l-4 transition-all hover:shadow-md`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <insight.icon className={`h-5 w-5 ${colors.icon}`} />
                  <CardTitle className="text-sm font-medium">
                    {insight.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insight.description}
                </p>

                <div className={`rounded-lg p-3 ${colors.bg}`}>
                  <p className={`text-xs ${colors.text} leading-relaxed`}>
                    💡 <strong>Tip:</strong> {insight.tip}
                  </p>
                </div>

                {insight.highlight && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      Key Metric:
                    </span>
                    <span className={`text-xs font-semibold ${colors.metric}`}>
                      {insight.highlight}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
