"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsSyncStatus } from "@/components/analytics/sync-status";
import { useYouTubeAnalytics } from "@/hooks/use-youtube-analytics";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Eye,
  ThumbsUp,
  MessageCircle,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface AnalyticsSummary {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalSubscribersGained: number;
  totalWatchTimeHours: number;
  averageEngagementRate: number;
  dataPoints: number;
  dateRange: {
    from: Date;
    to: Date;
  };
}

interface DashboardSummary {
  last7Days: AnalyticsSummary;
  last30Days: AnalyticsSummary;
  growth: {
    views: number;
    subscribers: number;
    engagement: number;
  };
}

interface YouTubeAnalyticsData {
  date: Date;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  subscribersGained: number;
  subscribersLost: number;
  watchTimeMinutes: number;
  averageViewDuration: number;
  impressions: number;
  clickThroughRate: number;
}

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  likes: {
    label: "Likes",
    color: "hsl(var(--chart-2))",
  },
  comments: {
    label: "Comments",
    color: "hsl(var(--chart-3))",
  },
  subscribers: {
    label: "Subscribers",
    color: "hsl(var(--chart-4))",
  },
  watchTime: {
    label: "Watch Time (min)",
    color: "hsl(var(--chart-5))",
  },
};

export function YouTubeAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<7 | 30>(30);

  const {
    data: analyticsData,
    summary,
    dashboardSummary,
    loading,
    syncing,
    error,
    lastSync,
    syncData,
    refresh,
    formatNumber,
  } = useYouTubeAnalytics({
    days: timeRange,
    autoSync: false,
  });

  // Handle sync with toast notifications
  const handleSync = async () => {
    const result = await syncData();
    if (result.success) {
      toast.success(result.message || "Analytics synced successfully");
    } else {
      toast.error(result.error || "Failed to sync analytics");
    }
  };

  // Format data for charts
  const chartData = analyticsData.map((item) => ({
    ...item,
    dateLabel: format(item.date, "MMM dd"),
  }));

  // Format growth percentage
  const formatGrowth = (growth: number) => {
    const isPositive = growth > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? "text-green-600" : "text-red-600";

    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">
          {Math.abs(growth).toFixed(1)}%
        </span>
      </div>
    );
  };

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            YouTube Analytics
          </h2>
          <p className="text-muted-foreground">
            Track your channel&apos;s performance and engagement metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant={timeRange === 7 ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(7)}
            >
              7 days
            </Button>
            <Button
              variant={timeRange === 30 ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(30)}
            >
              30 days
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing..." : "Sync Data"}
          </Button>
        </div>
      </div>

      {/* Sync Status */}
      <AnalyticsSyncStatus
        loading={loading}
        syncing={syncing}
        lastSync={lastSync}
        error={error}
        onSync={handleSync}
        dataPoints={summary?.dataPoints}
      />

      {/* Summary Cards */}
      {dashboardSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(dashboardSummary.last7Days.totalViews)}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">Last 7 days</p>
                {formatGrowth(dashboardSummary.growth.views)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                +
                {formatNumber(
                  dashboardSummary.last7Days.totalSubscribersGained
                )}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">Last 7 days</p>
                {formatGrowth(dashboardSummary.growth.subscribers)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Engagement Rate
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardSummary.last7Days.averageEngagementRate.toFixed(1)}%
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">Last 7 days</p>
                {formatGrowth(dashboardSummary.growth.engagement)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardSummary.last7Days.totalWatchTimeHours}h
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {analyticsData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Views Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Views Over Time</CardTitle>
              <CardDescription>
                Daily view count for the last {timeRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="dateLabel"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatNumber}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      formatNumber(Number(value)),
                      name,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="var(--color-views)"
                    fill="var(--color-views)"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>
                Likes and comments over the last {timeRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="dateLabel"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatNumber}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      formatNumber(Number(value)),
                      name,
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="likes"
                    stroke="var(--color-likes)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="comments"
                    stroke="var(--color-comments)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Subscriber Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Growth</CardTitle>
              <CardDescription>
                Daily subscriber gains for the last {timeRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="dateLabel"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatNumber}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      formatNumber(Number(value)),
                      name,
                    ]}
                  />
                  <Bar
                    dataKey="subscribersGained"
                    fill="var(--color-subscribers)"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Watch Time */}
          <Card>
            <CardHeader>
              <CardTitle>Watch Time</CardTitle>
              <CardDescription>
                Daily watch time in minutes for the last {timeRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="dateLabel"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatNumber}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      formatNumber(Number(value)),
                      name,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="watchTimeMinutes"
                    stroke="var(--color-watchTime)"
                    fill="var(--color-watchTime)"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Data State */}
      {!loading && analyticsData.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              We haven&apos;t collected any analytics data yet. Click the sync
              button to fetch your latest YouTube analytics.
            </p>
            <Button onClick={handleSync} disabled={syncing}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync Analytics Data"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
