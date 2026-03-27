"use client";

import React from "react";
import {
  TrendAnalysisResponse,
  formatViewCount,
  formatScore,
  DOMAIN_LABELS,
  REGION_LABELS,
} from "@/services/trend-analysis.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  Eye,
  TrendingUp,
  Calendar,
  ExternalLink,
  Youtube,
  ThumbsUp,
  Users,
  Hash,
  TrendingDown,
  Activity,
} from "lucide-react";
import { format } from "date-fns";

interface TrendResultsProps {
  data: TrendAnalysisResponse;
}

// Helper to get YouTube thumbnail
const getYoutubeThumbnail = (videoId: string, quality: "default" | "medium" | "high" | "maxres" = "medium") => {
  return `https://img.youtube.com/vi/${videoId}/${quality === "medium" ? "mqdefault" : quality === "high" ? "hqdefault" : quality === "maxres" ? "maxresdefault" : "default"}.jpg`;
};

export function TrendResults({ data }: TrendResultsProps) {
  const { domain, region, generated_at, top_topics, trending_hashtags, metadata } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp className="h-6 w-6 text-primary" />
                Trending Topics: {DOMAIN_LABELS[domain]}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2 text-base">
                <Calendar className="h-4 w-4" />
                Generated on {format(new Date(generated_at), "PPP")} • {REGION_LABELS[region]}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                {top_topics.length} Topics
              </Badge>
              {metadata?.hashtags_count && (
                <Badge variant="outline" className="text-sm px-4 py-2">
                  <Hash className="h-3 w-3 mr-1" />
                  {metadata.hashtags_count} Hashtags
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Trending Hashtags */}
      {trending_hashtags && trending_hashtags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Hash className="h-5 w-5" />
              Trending Hashtags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trending_hashtags.map((hashtag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm px-3 py-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(hashtag);
                  }}
                  title="Click to copy"
                >
                  {hashtag}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Click any hashtag to copy it to clipboard
            </p>
          </CardContent>
        </Card>
      )}

      {/* Trends List */}
      <div className="space-y-4">
        {top_topics.map((topic) => (
          <Card key={topic.rank} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 bg-muted/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Rank Badge */}
                  <div className="flex flex-col items-center gap-1 min-w-[60px]">
                    <div className={`flex items-center justify-center size-12 ${
                      topic.rank === 1 ? "bg-amber-500" :
                      topic.rank === 2 ? "bg-gray-400" :
                      topic.rank === 3 ? "bg-amber-700" :
                      "bg-primary"
                    } text-white rounded-full font-bold text-lg shadow-md`}>
                      {topic.rank}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">Rank</span>
                  </div>

                  {/* Topic Info */}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl capitalize mb-2 flex items-center gap-2">
                      {topic.topic}
                      {topic.rank <= 3 && (
                        <Trophy className={`h-5 w-5 ${
                          topic.rank === 1 ? "text-amber-500" :
                          topic.rank === 2 ? "text-gray-400" :
                          "text-amber-700"
                        }`} />
                      )}
                    </CardTitle>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Youtube className="h-4 w-4" />
                        {topic.video_count} videos analyzed
                      </span>
                      {topic.google_trends_percent && (
                        <span className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          Google Trends: {topic.google_trends_percent}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Composite Score */}
                <div className="text-right min-w-[100px]">
                  <div className="text-3xl font-bold text-primary">
                    {topic.composite_score_percent}%
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Composite Score
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Score Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Trend Score */}
                {/* <div className="space-y-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1 font-medium">
                      <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                      Trend
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {topic.trend_score_percent}%
                    </span>
                  </div>
                  <Progress value={topic.trend_score_percent} className="h-2" />
                </div> */}

                {/* View Score */}
                <div className="space-y-2 p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1 font-medium">
                      <Eye className="h-3.5 w-3.5 text-green-500" />
                      Views
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {topic.view_score_percent}%
                    </span>
                  </div>
                  <Progress value={topic.view_score_percent} className="h-2" />
                </div>

                {/* India Relevance (if applicable) */}
                {topic.india_relevance_percent !== null && (
                  <div className="space-y-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1 font-medium">
                        <Activity className="h-3.5 w-3.5 text-orange-500" />
                        Relevance
                      </span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        {topic.india_relevance_percent}%
                      </span>
                    </div>
                    <Progress value={topic.india_relevance_percent} className="h-2" />
                  </div>
                )}

                {/* Subscriber Score */}
                <div className="space-y-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="h-3.5 w-3.5 text-purple-500" />
                      Relatibility
                    </span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {topic.subscriber_score_percent}%
                    </span>
                  </div>
                  <Progress value={topic.subscriber_score_percent} className="h-2" />
                </div>
              </div>

              <Separator />

              {/* Top Video Card */}
              <div className="border-2 border-primary/20 rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted/30">
                <div className="bg-primary/10 px-4 py-2 border-b">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Top Performing Video
                  </h4>
                </div>

                <div className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Video Thumbnail */}
                    <div className="relative group cursor-pointer shrink-0" onClick={() => window.open(topic.top_video.url, "_blank")}>
                      <img
                        src={getYoutubeThumbnail(topic.top_video.videoId, "medium")}
                        alt={topic.top_video.title}
                        className="w-full md:w-48 h-32 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
                        onError={(e) => {
                          e.currentTarget.src = getYoutubeThumbnail(topic.top_video.videoId, "default");
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="bg-red-600 text-white rounded-full p-3">
                          <Youtube className="h-6 w-6" />
                        </div>
                      </div>
                    </div>

                    {/* Video Details */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div>
                        <h5 className="font-bold text-base line-clamp-2 mb-1">
                          {topic.top_video.title}
                        </h5>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Youtube className="h-3.5 w-3.5" />
                          {topic.top_video.channel}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1.5 rounded">
                          <Eye className="h-4 w-4 text-blue-500 shrink-0" />
                          <div>
                            <div className="font-bold text-xs">{formatViewCount(topic.top_video.views)}</div>
                            <div className="text-[10px] text-muted-foreground">Views</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1.5 rounded">
                          <ThumbsUp className="h-4 w-4 text-green-500 shrink-0" />
                          <div>
                            <div className="font-bold text-xs">{formatViewCount(topic.top_video.likes)}</div>
                            <div className="text-[10px] text-muted-foreground">Likes</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1.5 rounded">
                          <Users className="h-4 w-4 text-purple-500 shrink-0" />
                          <div>
                            <div className="font-bold text-xs">{formatViewCount(topic.top_video.subscribers)}</div>
                            <div className="text-[10px] text-muted-foreground">Subs</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1.5 rounded">
                          <Calendar className="h-4 w-4 text-orange-500 shrink-0" />
                          <div>
                            <div className="font-bold text-xs">
                              {format(new Date(topic.top_video.publishedAt), "MMM d")}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {format(new Date(topic.top_video.publishedAt), "yyyy")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* India Relevance Badge */}
                      {topic.top_video.india_relevance_percent !== null && (
                        <Badge variant="secondary" className="text-xs">
                          <Activity className="h-3 w-3 mr-1" />
                          {region} Relevance: {topic.top_video.india_relevance_percent}%
                        </Badge>
                      )}
                    </div>

                    {/* Watch Button */}
                    {/* <div className="flex items-center">
                      <Button
                        variant="default"
                        size="lg"
                        className="w-full md:w-auto md:h-full"
                        onClick={() => window.open(topic.top_video.url, "_blank")}
                      >
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Watch
                      </Button>
                    </div> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {top_topics.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Trends Found</h3>
            <p className="text-muted-foreground">
              No trending topics found for this domain and region combination.
              Try selecting a different domain or region.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Metadata Footer */}
      {metadata && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">{metadata.total_candidates_analyzed}</strong> candidates analyzed
              </span>
              <span className="hidden md:inline">•</span>
              <span>
                <strong className="text-foreground">{metadata.results_returned}</strong> results returned
              </span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center gap-1">
                Data from: <strong className="text-foreground">{metadata.data_sources?.join(", ")}</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}