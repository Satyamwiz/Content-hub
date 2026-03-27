"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Twitter,
  Users,
  Heart,
  Repeat2,
  MessageCircle,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { TwitterAuth } from "./twitter-auth";
import { TwitterDashboardPublisher } from "./twitter-dashboard-publisher";
import { toast } from "sonner";

interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profileImageUrl?: string;
  followersCount?: number;
  followingCount?: number;
  tweetCount?: number;
  verified?: boolean;
}

interface TwitterTweetMetrics {
  impressionCount?: number;
  likeCount?: number;
  replyCount?: number;
  retweetCount?: number;
  quoteCount?: number;
  bookmarkCount?: number;
}

interface TwitterTweet {
  id: string;
  text: string;
  createdAt: string;
  authorId: string;
  metrics?: TwitterTweetMetrics;
}

interface TwitterAnalytics {
  user: TwitterUser;
  recentTweets: TwitterTweet[];
  totalEngagement: number;
  averageEngagement: number;
  topTweet?: TwitterTweet;
}

export function TwitterAnalytics() {
  const [analytics, setAnalytics] = useState<TwitterAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [isAuthenticated]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/twitter/analytics");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch analytics");
      }

      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch Twitter analytics:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch analytics";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    fetchAnalytics();
  };

  const handleAuthError = (error: string) => {
    setIsAuthenticated(false);
    setError(error);
  };

  const formatNumber = (num: number | undefined): string => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAuthRequired = () => {
    setIsAuthenticated(false);
    setAnalytics(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <TwitterAuth
          onAuthSuccess={handleAuthSuccess}
          onAuthError={handleAuthError}
        />

        {error && (
          <Card className="border-destructive">
            <CardContent className="flex items-center gap-2 p-4">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Twitter Analytics</h2>
          <p className="text-muted-foreground">
            Overview of your Twitter performance
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalytics}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 p-4">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </CardContent>
        </Card>
      )}

      {isLoading && !analytics ? (
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading Twitter analytics...</span>
          </CardContent>
        </Card>
      ) : analytics ? (
        <>
          {/* Quick Tweet Publisher */}
          <TwitterDashboardPublisher />

          {/* Account Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Followers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analytics.user.followersCount)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Following</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analytics.user.followingCount)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Tweets
                </CardTitle>
                <Twitter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analytics.user.tweetCount)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Engagement
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(analytics.averageEngagement)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Tweet */}
          {analytics.topTweet && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Tweet</CardTitle>
                <CardDescription>
                  Your best performing recent tweet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{analytics.topTweet.text}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {formatNumber(analytics.topTweet.metrics?.likeCount)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Repeat2 className="h-4 w-4" />
                    {formatNumber(analytics.topTweet.metrics?.retweetCount)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {formatNumber(analytics.topTweet.metrics?.replyCount)}
                  </div>
                  <span>•</span>
                  <span>{formatDate(analytics.topTweet.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Tweets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Tweets</CardTitle>
              <CardDescription>
                Your latest tweets and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.recentTweets.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentTweets.slice(0, 5).map((tweet, index) => (
                    <div key={tweet.id}>
                      <div className="space-y-2">
                        <p className="text-sm line-clamp-2">{tweet.text}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {formatNumber(tweet.metrics?.likeCount)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Repeat2 className="h-3 w-3" />
                            {formatNumber(tweet.metrics?.retweetCount)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {formatNumber(tweet.metrics?.replyCount)}
                          </div>
                          <span>•</span>
                          <span>{formatDate(tweet.createdAt)}</span>
                        </div>
                      </div>
                      {index <
                        analytics.recentTweets.slice(0, 5).length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recent tweets found
                </p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
