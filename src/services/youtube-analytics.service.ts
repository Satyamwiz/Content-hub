import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { YouTubeTokenService } from "./youtube-token.service";

export interface YouTubeAnalyticsData {
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
  videoId?: string;
  videoTitle?: string;
  videoViews?: number;
  videoLikes?: number;
  videoComments?: number;
  rawData?: any;
}

export interface AnalyticsSummary {
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

export class YouTubeAnalyticsService {
  /**
   * Fetch and store analytics data from YouTube API
   */
  static async fetchAndStoreAnalytics(dayRange: number = 30): Promise<{
    success: boolean;
    error?: string;
    recordsStored?: number;
  }> {
    try {
      const { userId } = await auth();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      // Check if user has valid YouTube tokens
      const hasTokens = await YouTubeTokenService.hasValidTokens();
      if (!hasTokens) {
        return { success: false, error: "YouTube authentication required" };
      }

      // Get YouTube services
      const youtubeAnalytics =
        await YouTubeTokenService.getYouTubeAnalyticsService();
      const youtube = await YouTubeTokenService.getYouTubeService();

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - dayRange);

      // Fetch analytics data from YouTube
      const analyticsResp = await youtubeAnalytics.reports.query({
        ids: "channel==MINE",
        startDate: startDate.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
        metrics:
          "views,likes,comments,shares,subscribersGained,subscribersLost,estimatedMinutesWatched,averageViewDuration",
        dimensions: "day",
        sort: "day",
      });

      let recordsStored = 0;

      // Store each day's data
      if (analyticsResp.data.rows) {
        for (const row of analyticsResp.data.rows) {
          const date = new Date(row[0] as string);
          const analyticsData: YouTubeAnalyticsData = {
            date,
            views: Number(row[1]) || 0,
            likes: Number(row[2]) || 0,
            comments: Number(row[3]) || 0,
            shares: Number(row[4]) || 0,
            subscribersGained: Number(row[5]) || 0,
            subscribersLost: Number(row[6]) || 0,
            watchTimeMinutes: Number(row[7]) || 0,
            averageViewDuration: Number(row[8]) || 0,
            impressions: 0, // Not available in this API call
            clickThroughRate: 0.0, // Not available in this API call
            rawData: row,
          };

          // Store or update the record
          await prisma.youTubeAnalytics.upsert({
            where: {
              clerkId_date: {
                clerkId: userId,
                date: date,
              },
            },
            update: {
              views: analyticsData.views,
              likes: analyticsData.likes,
              comments: analyticsData.comments,
              shares: analyticsData.shares,
              subscribersGained: analyticsData.subscribersGained,
              subscribersLost: analyticsData.subscribersLost,
              watchTimeMinutes: analyticsData.watchTimeMinutes,
              averageViewDuration: analyticsData.averageViewDuration,
              impressions: analyticsData.impressions,
              clickThroughRate: analyticsData.clickThroughRate,
              rawData: analyticsData.rawData,
            },
            create: {
              clerkId: userId,
              date: analyticsData.date,
              views: analyticsData.views,
              likes: analyticsData.likes,
              comments: analyticsData.comments,
              shares: analyticsData.shares,
              subscribersGained: analyticsData.subscribersGained,
              subscribersLost: analyticsData.subscribersLost,
              watchTimeMinutes: analyticsData.watchTimeMinutes,
              averageViewDuration: analyticsData.averageViewDuration,
              impressions: analyticsData.impressions,
              clickThroughRate: analyticsData.clickThroughRate,
              rawData: analyticsData.rawData,
            },
          });

          recordsStored++;
        }
      }

      return { success: true, recordsStored };
    } catch (error) {
      console.error("Error fetching YouTube analytics:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get stored analytics data for a date range
   */
  static async getStoredAnalytics(dayRange: number = 30): Promise<{
    success: boolean;
    data?: YouTubeAnalyticsData[];
    summary?: AnalyticsSummary;
    error?: string;
  }> {
    try {
      const { userId } = await auth();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - dayRange);

      const analyticsRecords = await prisma.youTubeAnalytics.findMany({
        where: {
          clerkId: userId,
          date: {
            gte: startDate,
            lte: today,
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      // Calculate summary statistics
      const summary: AnalyticsSummary = {
        totalViews: analyticsRecords.reduce(
          (sum: number, record: any) => sum + record.views,
          0
        ),
        totalLikes: analyticsRecords.reduce(
          (sum: number, record: any) => sum + record.likes,
          0
        ),
        totalComments: analyticsRecords.reduce(
          (sum: number, record: any) => sum + record.comments,
          0
        ),
        totalSubscribersGained: analyticsRecords.reduce(
          (sum: number, record: any) => sum + record.subscribersGained,
          0
        ),
        totalWatchTimeHours: Math.round(
          analyticsRecords.reduce(
            (sum: number, record: any) => sum + record.watchTimeMinutes,
            0
          ) / 60
        ),
        averageEngagementRate: 0, // Calculate below
        dataPoints: analyticsRecords.length,
        dateRange: {
          from: startDate,
          to: today,
        },
      };

      // Calculate average engagement rate (likes + comments / views)
      if (summary.totalViews > 0) {
        summary.averageEngagementRate =
          ((summary.totalLikes + summary.totalComments) / summary.totalViews) *
          100;
      }

      const data: YouTubeAnalyticsData[] = analyticsRecords.map(
        (record: any) => ({
          date: record.date,
          views: record.views,
          likes: record.likes,
          comments: record.comments,
          shares: record.shares,
          subscribersGained: record.subscribersGained,
          subscribersLost: record.subscribersLost,
          watchTimeMinutes: record.watchTimeMinutes,
          averageViewDuration: record.averageViewDuration,
          impressions: record.impressions,
          clickThroughRate: record.clickThroughRate,
          videoId: record.videoId || undefined,
          videoTitle: record.videoTitle || undefined,
          videoViews: record.videoViews || undefined,
          videoLikes: record.videoLikes || undefined,
          videoComments: record.videoComments || undefined,
          rawData: record.rawData,
        })
      );

      return { success: true, data, summary };
    } catch (error) {
      console.error("Error getting stored analytics:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get analytics summary for dashboard cards
   */
  static async getDashboardSummary(): Promise<{
    success: boolean;
    summary?: {
      last7Days: AnalyticsSummary;
      last30Days: AnalyticsSummary;
      growth: {
        views: number;
        subscribers: number;
        engagement: number;
      };
    };
    error?: string;
  }> {
    try {
      const [last7DaysResult, last30DaysResult] = await Promise.all([
        this.getStoredAnalytics(7),
        this.getStoredAnalytics(30),
      ]);

      if (!last7DaysResult.success || !last30DaysResult.success) {
        return {
          success: false,
          error: last7DaysResult.error || last30DaysResult.error,
        };
      }

      // Calculate growth rates
      const prev7Days =
        last30DaysResult.summary!.totalViews -
        last7DaysResult.summary!.totalViews;
      const viewsGrowth =
        prev7Days > 0
          ? ((last7DaysResult.summary!.totalViews - prev7Days) / prev7Days) *
            100
          : 0;

      const prev7Subs =
        last30DaysResult.summary!.totalSubscribersGained -
        last7DaysResult.summary!.totalSubscribersGained;
      const subscribersGrowth =
        prev7Subs > 0
          ? ((last7DaysResult.summary!.totalSubscribersGained - prev7Subs) /
              prev7Subs) *
            100
          : 0;

      const prev7Engagement =
        last30DaysResult.summary!.totalLikes +
        last30DaysResult.summary!.totalComments -
        (last7DaysResult.summary!.totalLikes +
          last7DaysResult.summary!.totalComments);
      const engagementGrowth =
        prev7Engagement > 0
          ? ((last7DaysResult.summary!.totalLikes +
              last7DaysResult.summary!.totalComments -
              prev7Engagement) /
              prev7Engagement) *
            100
          : 0;

      return {
        success: true,
        summary: {
          last7Days: last7DaysResult.summary!,
          last30Days: last30DaysResult.summary!,
          growth: {
            views: Math.round(viewsGrowth * 100) / 100,
            subscribers: Math.round(subscribersGrowth * 100) / 100,
            engagement: Math.round(engagementGrowth * 100) / 100,
          },
        },
      };
    } catch (error) {
      console.error("Error getting dashboard summary:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Trigger analytics data sync
   */
  static async syncAnalytics(): Promise<{
    success: boolean;
    error?: string;
    message?: string;
  }> {
    const result = await this.fetchAndStoreAnalytics(30);

    if (result.success) {
      return {
        success: true,
        message: `Successfully synced ${result.recordsStored} days of analytics data`,
      };
    }

    return result;
  }
}

export default YouTubeAnalyticsService;
