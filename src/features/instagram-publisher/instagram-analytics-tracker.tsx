"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Calendar,
  Target,
  Activity,
  RefreshCw,
} from "lucide-react";
import { instagramDbService } from "@/services/instagram-db.service";
import { InstagramService } from "@/services/instagram.service";

interface AnalyticsData {
  date: string;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saved: number;
  views: number;
  engagementRate: number;
}

interface PostPerformance {
  mediaId: string;
  caption: string;
  timestamp: string;
  reach: number;
  likes: number;
  comments: number;
  engagementRate: number;
  performance: 'high' | 'medium' | 'low';
}

interface InstagramAnalyticsTrackerProps {
  clerkId: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export function InstagramAnalyticsTracker({ clerkId }: InstagramAnalyticsTrackerProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [postPerformance, setPostPerformance] = useState<PostPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const instagramService = new InstagramService();

  useEffect(() => {
    loadAnalyticsData();
  }, [clerkId, timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const posts = await instagramDbService.getInstagramPostsByUser(clerkId, 100);

      // Process posts for analytics
      const processedData: AnalyticsData[] = [];
      const performanceData: PostPerformance[] = [];

      posts.forEach(post => {
        const date = new Date(post.timestamp).toISOString().split('T')[0];
        const engagementRate = post.reach > 0
          ? ((post.likes + post.comments + post.shares + post.saved) / post.reach) * 100
          : 0;

        processedData.push({
          date,
          reach: post.reach,
          likes: post.likes,
          comments: post.comments,
          shares: post.shares,
          saved: post.saved,
          views: post.views,
          engagementRate,
        });

        // Calculate performance level
        let performance: 'high' | 'medium' | 'low' = 'low';
        if (engagementRate > 5) performance = 'high';
        else if (engagementRate > 2) performance = 'medium';

        performanceData.push({
          mediaId: post.mediaId,
          caption: post.caption || 'No caption',
          timestamp: post.timestamp.toISOString(),
          reach: post.reach,
          likes: post.likes,
          comments: post.comments,
          engagementRate,
          performance,
        });
      });

      // Group by date and aggregate
      const groupedData = processedData.reduce((acc, curr) => {
        const existing = acc.find(item => item.date === curr.date);
        if (existing) {
          existing.reach += curr.reach;
          existing.likes += curr.likes;
          existing.comments += curr.comments;
          existing.shares += curr.shares;
          existing.saved += curr.saved;
          existing.views += curr.views;
          existing.engagementRate = (existing.engagementRate + curr.engagementRate) / 2;
        } else {
          acc.push({ ...curr });
        }
        return acc;
      }, [] as AnalyticsData[]);

      // Sort by date
      groupedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setAnalyticsData(groupedData);
      setPostPerformance(performanceData.sort((a, b) => b.engagementRate - a.engagementRate));
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'high':
        return <Badge variant="default" className="bg-green-600">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="destructive">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTotalStats = () => {
    if (analyticsData.length === 0) return null;

    const total = analyticsData.reduce((acc, curr) => ({
      reach: acc.reach + curr.reach,
      likes: acc.likes + curr.likes,
      comments: acc.comments + curr.comments,
      shares: acc.shares + curr.shares,
      saved: acc.saved + curr.saved,
      views: acc.views + curr.views,
    }), { reach: 0, likes: 0, comments: 0, shares: 0, saved: 0, views: 0 });

    const avgEngagement = analyticsData.reduce((sum, curr) => sum + curr.engagementRate, 0) / analyticsData.length;

    return { ...total, avgEngagement };
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Tracker</h1>
          <p className="text-muted-foreground">
            Track your Instagram performance over time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button onClick={loadAnalyticsData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Eye className="h-5 w-5 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{formatNumber(stats.reach)}</div>
              <div className="text-sm text-muted-foreground">Total Reach</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-5 w-5 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold">{formatNumber(stats.likes)}</div>
              <div className="text-sm text-muted-foreground">Total Likes</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-5 w-5 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{formatNumber(stats.comments)}</div>
              <div className="text-sm text-muted-foreground">Total Comments</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Share className="h-5 w-5 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{formatNumber(stats.shares)}</div>
              <div className="text-sm text-muted-foreground">Total Shares</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Bookmark className="h-5 w-5 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{formatNumber(stats.saved)}</div>
              <div className="text-sm text-muted-foreground">Total Saves</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{stats.avgEngagement.toFixed(2)}%</div>
              <div className="text-sm text-muted-foreground">Avg Engagement</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          {analyticsData.length > 0 ? (
            <>
              {/* Engagement Rate Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Rate Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDate}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => formatDate(value as string)}
                          formatter={(value: number) => [`${value.toFixed(2)}%`, 'Engagement Rate']}
                        />
                        <Line
                          type="monotone"
                          dataKey="engagementRate"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={{ fill: '#8884d8' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Reach vs Engagement */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reach Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={formatDate} />
                          <YAxis tickFormatter={formatNumber} />
                          <Tooltip
                            labelFormatter={(value) => formatDate(value as string)}
                            formatter={(value: number) => [formatNumber(value), 'Reach']}
                          />
                          <Bar dataKey="reach" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interactions Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.slice(-5)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickFormatter={formatDate} />
                          <YAxis tickFormatter={formatNumber} />
                          <Tooltip
                            labelFormatter={(value) => formatDate(value as string)}
                            formatter={(value: number, name: string) => [
                              formatNumber(value),
                              name.charAt(0).toUpperCase() + name.slice(1)
                            ]}
                          />
                          <Bar dataKey="likes" fill="#ff7c7c" />
                          <Bar dataKey="comments" fill="#ffc658" />
                          <Bar dataKey="shares" fill="#8dd1e1" />
                          <Bar dataKey="saved" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No analytics data available</h3>
                <p className="text-sm text-muted-foreground">
                  Analytics data will appear here once you start publishing posts to Instagram.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          {postPerformance.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {postPerformance.slice(0, 10).map((post, index) => (
                    <div key={post.mediaId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium truncate max-w-md">
                            {post.caption}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(post.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{formatNumber(post.reach)}</div>
                          <div className="text-muted-foreground">Reach</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{post.engagementRate.toFixed(2)}%</div>
                          <div className="text-muted-foreground">Engagement</div>
                        </div>
                        <div>
                          {getPerformanceBadge(post.performance)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No post performance data</h3>
                <p className="text-sm text-muted-foreground">
                  Performance rankings will appear here as you publish more posts.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}