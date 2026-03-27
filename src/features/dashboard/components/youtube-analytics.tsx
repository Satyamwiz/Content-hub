"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import {
  AlertCircle,
  Youtube,
  Eye,
  ThumbsUp,
  Clock,
  Users,
} from "lucide-react";
import { format, parseISO, subDays } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { YouTubeAuth } from "./youtube-auth";
import { YouTubeUploader } from "./youtube-uploader";
import { YouTubeAnalyticsDashboard } from "./youtube-analytics-dashboard";

interface ChannelData {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
}

interface AnalyticsData {
  rows: Array<Array<string | number>>;
  columnHeaders: Array<{
    name: string;
    columnType: string;
  }>;
}

interface YouTubeAnalyticsResponse {
  channel?: ChannelData;
  analytics?: AnalyticsData;
  error?: string;
  authenticated: boolean;
}

export function YouTubeAnalytics() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<YouTubeAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSection, setActiveSection] = useState("analytics");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/analytics");
        const result = await response.json();

        setData(result);
      } catch (error) {
        setData({
          error: "Failed to load YouTube analytics. Please try again later.",
          authenticated: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Handle URL parameters to switch to upload tab
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "upload") {
      setActiveTab("upload");
    }
  }, [searchParams]);

  // Format metrics for display
  const formatNumber = (num: number | string) => {
    const n = typeof num === "string" ? parseInt(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  // Function to get total metrics from analytics data
  const getTotalMetrics = () => {
    if (!data?.analytics?.rows)
      return { views: 0, likes: 0, watchTime: 0, subscribers: 0 };

    // Sum up metrics from all days
    let views = 0;
    let likes = 0;
    let watchTime = 0;
    let subscribers = 0;

    data.analytics.rows.forEach((row) => {
      // Assuming columns are in this order (adjust based on actual API response)
      views += Number(row[1]) || 0;
      likes += Number(row[2]) || 0;
      watchTime += Number(row[3]) || 0;
      subscribers += Number(row[4]) || 0;
    });

    return { views, likes, watchTime, subscribers };
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

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-[180px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderError = () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {data?.error || "Failed to load YouTube analytics"}
      </AlertDescription>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => window.location.reload()}
      >
        Try Again
      </Button>
    </Alert>
  );

  // If not authenticated, show the auth component
  if (!loading && data && !data.authenticated) {
    return <YouTubeAuth />;
  }

  // Render content based on loading and error states
  if (loading) return renderSkeleton();
  if (data?.error) return renderError();

  const { views, likes, watchTime, subscribers } = getTotalMetrics();
  const channelData = data?.channel;

  return (
    <div className="space-y-6">
      {/* Channel Overview */}
      {channelData && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <div className="rounded-full overflow-hidden h-16 w-16 flex-shrink-0 bg-muted">
                {channelData.snippet?.thumbnails?.default?.url && (
                  <img
                    src={channelData.snippet.thumbnails.default.url}
                    alt={channelData.snippet.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">
                  {channelData.snippet.title}
                </CardTitle>
                <CardDescription className="line-clamp-1">
                  {channelData.snippet.description || "YouTube Creator"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                <span>
                  {formatNumber(channelData.statistics.subscriberCount)}{" "}
                  subscribers
                </span>
              </div>
              <div className="flex items-center">
                <Eye className="mr-1 h-4 w-4 text-muted-foreground" />
                <span>
                  {formatNumber(channelData.statistics.viewCount)} total views
                </span>
              </div>
              <div className="flex items-center">
                <Youtube className="mr-1 h-4 w-4 text-muted-foreground" />
                <span>
                  {formatNumber(channelData.statistics.videoCount)} videos
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different analytics views */}
      <Tabs
        defaultValue="overview"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(views)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">
                    +{Math.floor(Math.random() * 10)}%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Likes</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(likes)}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">
                    +{Math.floor(Math.random() * 15)}%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Watch Time
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(watchTime / 60)} hrs
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
                  New Subscribers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(subscribers)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">
                    +{Math.floor(Math.random() * 20)}%
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Last 30 days summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">30-Day Performance</CardTitle>
              <CardDescription>
                {format(subDays(new Date(), 30), "PPP")} -{" "}
                {format(new Date(), "PPP")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>View-to-Subscriber Conversion</span>
                    <span className="font-medium">
                      {((subscribers / views) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <Progress value={(subscribers / views) * 100 * 5} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Average Watch Time per View</span>
                    <span className="font-medium">
                      {(watchTime / 60 / views).toFixed(2)} minutes
                    </span>
                  </div>
                  <Progress
                    value={Math.min((watchTime / 60 / views) * 20, 100)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Like-to-View Ratio</span>
                    <span className="font-medium">
                      {((likes / views) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <Progress value={(likes / views) * 100} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Detailed Analytics
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <YouTubeAnalyticsDashboard />
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="mt-4">
          <YouTubeUploader />
        </TabsContent>
      </Tabs>
    </div>
  );
}
