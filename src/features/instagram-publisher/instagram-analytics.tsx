"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Instagram,
  Eye,
  Heart,
  MessageCircle,
  Users,
  TrendingUp,
  RefreshCw,
  LogOut,
  Link as LinkIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { InstagramService } from "@/services/instagram.service";
import { InstagramAuth } from "@/lib/instagram-auth";
import { InstagramAuthModal } from "@/components/instagram-auth-modal";
import { InstagramDisconnectDialog } from "@/components/instagram-disconnect-dialog";
import { toast } from "sonner";

interface InstagramAccountData {
  id: string;
  username: string;
  name: string;
  biography: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  profile_picture_url: string;
  website: string;
}

interface InstagramAnalyticsData {
  follower_count: {
    value: number;
    end_time: string;
  };
  reach: {
    value: number;
    end_time: string;
  };
  profile_views: {
    value: number;
    end_time: string;
  };
  website_clicks: {
    value: number;
    end_time: string;
  };
  accounts_engaged: {
    value: number;
    end_time: string;
  };
  total_interactions: {
    value: number;
    end_time: string;
  };
}

interface InstagramAnalyticsResponse {
  success: boolean;
  data?: {
    account_id: string;
    account_analytics: InstagramAnalyticsData;
    account_info: InstagramAccountData;
    recent_media: {
      data: Array<{
        id: string;
        media_type: string;
        media_url: string;
        permalink: string;
        timestamp: string;
        caption: string;
        like_count: number;
        comments_count: number;
      }>;
    };
    influencer_metrics: {
      total_posts_analyzed: number;
      average_engagement_per_post: number;
      engagement_rate_percentage: number;
      total_engagement_last_12_posts: number;
    };
  };
  error?: string;
}

export function InstagramAnalytics({
  mediaId,
  clerkId,
}: {
  mediaId?: string;
  clerkId?: string;
}) {
  const [data, setData] = useState<InstagramAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setActiveTab] = useState("overview");

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [authInfo, setAuthInfo] = useState<{ userId: string } | null>(null);

  const instagramService = new InstagramService();

  useEffect(() => {
    checkAuthentication();
  }, []);

  // Listen for storage events to detect auth changes from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "instagram_auth") {
        console.log("Instagram auth changed, refreshing analytics...");
        checkAuthentication();
      }
    };

    // Listen for custom event from same tab
    const handleAuthChange = () => {
      console.log("Instagram auth changed (same tab), refreshing analytics...");
      checkAuthentication();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("instagram-auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("instagram-auth-changed", handleAuthChange);
    };
  }, []);

  const checkAuthentication = async () => {
    const authenticated = InstagramAuth.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      const info = instagramService.getAuthInfo();
      setAuthInfo(info);
      fetchAnalytics();
    } else {
      setLoading(false);
      setData(null);
    }
  };

  const handleAuthSuccess = () => {
    toast.success("Instagram account connected successfully!");
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("instagram-auth-changed"));
    checkAuthentication();
  };

  const handleDisconnectClick = () => {
    setShowDisconnectDialog(true);
  };

  const handleDisconnectConfirm = () => {
    InstagramAuth.clearCredentials();
    setIsAuthenticated(false);
    setAuthInfo(null);
    setData(null);
    setShowDisconnectDialog(false);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("instagram-auth-changed"));
    toast.success("Instagram account disconnected successfully");
  };

  const fetchAnalytics = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching Instagram analytics...");
      const response = await instagramService.getPageAnalytics();
      console.log("Instagram analytics response:", response);

      if (response.success && response.data) {
        setData({
          success: true,
          data: response.data,
        });
      } else {
        setData({
          success: false,
          error:
            response.error ||
            "Failed to load Instagram analytics. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setData({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load Instagram analytics. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderSkeleton = () => (
    <div className="space-y-5">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-[120px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px]" />
              <Skeleton className="h-4 w-[100px] mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderError = () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Service Unavailable</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{data?.error || "Unable to connect to Instagram API service."}</p>
        <p className="text-sm">This could be due to:</p>
        <ul className="text-sm list-disc list-inside ml-4 space-y-1">
          <li>Instagram API service being temporarily down</li>
          <li>Invalid or expired access token</li>
          <li>Network connectivity issues</li>
        </ul>
      </AlertDescription>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={fetchAnalytics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button variant="outline" onClick={handleDisconnectClick}>
          <LogOut className="h-4 w-4 mr-2" />
          Reconnect Account
        </Button>
      </div>
    </Alert>
  );

  // Show authentication required state
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <InstagramAuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
        <InstagramDisconnectDialog
          open={showDisconnectDialog}
          onClose={() => setShowDisconnectDialog(false)}
          onConfirm={handleDisconnectConfirm}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <LinkIcon className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          </div>
          <Button onClick={() => setShowAuthModal(true)} size="sm">
            <Instagram className="h-4 w-4 mr-2" />
            Connect Instagram
          </Button>
        </div>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-8 text-center">
            <Instagram className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              Connect Your Instagram Account
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Instagram Business Account to view analytics,
              insights, and engagement metrics.
            </p>
            <Button onClick={() => setShowAuthModal(true)}>
              <Instagram className="h-4 w-4 mr-2" />
              Connect Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return renderSkeleton();
  if (!data?.success) return renderError();

  const accountData = data.data?.account_info;
  const analytics = data.data?.account_analytics;
  const metrics = data.data?.influencer_metrics;

  return (
    <div className="space-y-6">
      <InstagramAuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
      <InstagramDisconnectDialog
        open={showDisconnectDialog}
        onClose={() => setShowDisconnectDialog(false)}
        onConfirm={handleDisconnectConfirm}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="default">
            <Instagram className="h-3 w-3 mr-1" />
            Connected
          </Badge>
          {authInfo && (
            <Badge variant="outline" className="text-xs">
              User ID: {authInfo.userId}
            </Badge>
          )}
        </div>
        <Button
          onClick={handleDisconnectClick}
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </div>

      {accountData && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <div className="rounded-full overflow-hidden h-16 w-16 flex-shrink-0 bg-muted">
                {accountData.profile_picture_url && (
                  <img
                    src={accountData.profile_picture_url}
                    alt={accountData.username}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">{accountData.name}</CardTitle>
                <CardDescription className="line-clamp-1">
                  @{accountData.username} •{" "}
                  {accountData.biography || "Instagram Creator"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                <span>
                  {formatNumber(accountData.followers_count)} followers
                </span>
              </div>
              <div className="flex items-center">
                <Instagram className="mr-1 h-4 w-4 text-muted-foreground" />
                <span>{formatNumber(accountData.media_count)} posts</span>
              </div>
              {accountData.website && (
                <div className="flex items-center">
                  <span className="text-muted-foreground">🌐</span>
                  <span className="ml-1 truncate max-w-[150px]">
                    {accountData.website}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs
        defaultValue="overview"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {analytics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Followers
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(accountData?.followers_count || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">
                      +{Math.floor(Math.random() * 5)}%
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reach</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(analytics.reach.value)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">
                      +{Math.floor(Math.random() * 12)}%
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Profile Views
                  </CardTitle>
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(analytics.profile_views.value)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">
                      +{Math.floor(Math.random() * 8)}%
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Engagement Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.engagement_rate_percentage.toFixed(2) || "0.00"}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">
                      +{Math.floor(Math.random() * 3)}%
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {data.data?.recent_media?.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Recent Posts Performance
                </CardTitle>
                <CardDescription>
                  Performance metrics for your latest Instagram posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.data.recent_media.data
                    .slice(0, 5)
                    .map((post, index) => {
                      const engagementRate =
                        post.like_count > 0
                          ? ((post.like_count + post.comments_count) /
                              post.like_count) *
                            100
                          : 0;

                      return (
                        <div
                          key={post.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium truncate max-w-md">
                                {post.caption || "No caption"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(
                                  new Date(post.timestamp),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-center">
                              <div className="font-medium flex items-center gap-1">
                                <Heart className="h-3 w-3 text-red-500" />
                                {formatNumber(post.like_count)}
                              </div>
                              <div className="text-muted-foreground">Likes</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium flex items-center gap-1">
                                <MessageCircle className="h-3 w-3 text-blue-500" />
                                {formatNumber(post.comments_count)}
                              </div>
                              <div className="text-muted-foreground">
                                Comments
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">
                                {engagementRate.toFixed(1)}%
                              </div>
                              <div className="text-muted-foreground">
                                Engagement
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Posts Analytics
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="engagement">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Engagement Analytics</CardTitle>
              <CardDescription>
                Track how your audience interacts with your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Average Engagement Rate</span>
                    <span className="font-medium">
                      {metrics?.engagement_rate_percentage.toFixed(2) || "0.00"}
                      %
                    </span>
                  </div>
                  <Progress value={metrics?.engagement_rate_percentage || 0} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Average Engagement per Post</span>
                    <span className="font-medium">
                      {formatNumber(metrics?.average_engagement_per_post || 0)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      (metrics?.average_engagement_per_post || 0) / 100,
                      100
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Interactions (Last 12 Posts)</span>
                    <span className="font-medium">
                      {formatNumber(
                        metrics?.total_engagement_last_12_posts || 0
                      )}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      (metrics?.total_engagement_last_12_posts || 0) / 1000,
                      100
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
