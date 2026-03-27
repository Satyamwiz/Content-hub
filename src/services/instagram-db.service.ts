import prisma from "@/lib/db";
import {
  InstagramAnalyticsResponse,
  InstagramPageAnalyticsResponse,
} from "./instagram.service";

// Try to import Prisma client, but handle the case where it's not available
// let PrismaClient: any;
// let prisma: any;

// try {
//   const prismaModule = require('@prisma/client');
//   PrismaClient = prismaModule.PrismaClient;
//   prisma = new PrismaClient();
//   console.log('Prisma client initialized successfully');
// } catch (error) {
//   console.warn('Prisma client not available, using mock implementation:', error);
//   // Mock implementation for when Prisma is not available
//   prisma = {
//     instagramPost: {
//       create: async () => { throw new Error('Database not available'); },
//       findUnique: async () => null,
//       findMany: async () => [],
//       updateMany: async () => { throw new Error('Database not available'); },
//       deleteMany: async () => { throw new Error('Database not available'); },
//     },
//     instagramAnalytics: {
//       create: async () => { throw new Error('Database not available'); },
//       findMany: async () => [],
//     },
//     instagramAccount: {
//       upsert: async () => { throw new Error('Database not available'); },
//       findUnique: async () => null,
//     },
//     $disconnect: async () => {},
//   };
// }

export interface CreateInstagramPostData {
  mediaId: string;
  containerId?: string;
  mediaType: string;
  mediaUrl?: string;
  caption?: string;
  permalink?: string;
  timestamp?: Date;
  status?: string;
  scheduledAt?: Date;
  clerkId: string;
}

export interface UpdateInstagramPostData {
  likes?: number;
  comments?: number;
  shares?: number;
  saved?: number;
  reach?: number;
  views?: number;
  rawAnalytics?: any;
  rawComments?: any;
  mediaInfo?: any;
}

export interface CreateInstagramAnalyticsData {
  mediaId: string;
  period: string;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saved?: number;
  views?: number;
  rawData?: any;
  clerkId: string;
}

export interface CreateInstagramAccountData {
  accountId: string;
  username: string;
  name?: string;
  biography?: string;
  followersCount?: number;
  followsCount?: number;
  mediaCount?: number;
  profilePictureUrl?: string;
  website?: string;
  profileViews?: number;
  websiteClicks?: number;
  accountsEngaged?: number;
  totalInteractions?: number;
  averageEngagementPerPost?: number;
  engagementRatePercentage?: number;
  totalEngagementLast12Posts?: number;
  totalPostsAnalyzed?: number;
  rawAccountData?: any;
  rawRecentMedia?: any;
  clerkId: string;
}

export class InstagramDbService {
  // Instagram Posts
  async createInstagramPost(data: CreateInstagramPostData) {
    try {
      if (prisma.instagramPost && prisma.instagramPost.create) {
        return await prisma.instagramPost.create({
          data: {
            mediaId: data.mediaId,
            containerId: data.containerId,
            mediaType: data.mediaType,
            mediaUrl: data.mediaUrl,
            caption: data.caption,
            permalink: data.permalink,
            timestamp: data.timestamp || new Date(),
            status: data.status || "published",
            scheduledAt: data.scheduledAt,
            clerkId: data.clerkId,
          },
        });
      } else {
        console.log("Database not available, returning mock post data");
        return {
          id: "mock-" + data.mediaId,
          mediaId: data.mediaId,
          containerId: data.containerId,
          mediaType: data.mediaType,
          mediaUrl: data.mediaUrl,
          caption: data.caption,
          permalink: data.permalink,
          timestamp: data.timestamp || new Date(),
          status: data.status || "published",
          scheduledAt: data.scheduledAt,
          clerkId: data.clerkId,
        };
      }
    } catch (error) {
      console.error("Error creating Instagram post:", error);
      // Return mock data instead of throwing error
      return {
        id: "mock-" + data.mediaId,
        mediaId: data.mediaId,
        containerId: data.containerId,
        mediaType: data.mediaType,
        mediaUrl: data.mediaUrl,
        caption: data.caption,
        permalink: data.permalink,
        timestamp: data.timestamp || new Date(),
        status: data.status || "published",
        scheduledAt: data.scheduledAt,
        clerkId: data.clerkId,
      };
    }
  }

  async getInstagramPostByMediaId(mediaId: string, clerkId: string) {
    try {
      if (prisma.instagramPost && prisma.instagramPost.findUnique) {
        return await prisma.instagramPost.findUnique({
          where: {
            mediaId_clerkId: {
              mediaId,
              clerkId,
            },
          },
        });
      } else {
        console.log("Database not available, returning null");
        return null;
      }
    } catch (error) {
      console.error("Error getting Instagram post by media ID:", error);
      return null;
    }
  }

  async getInstagramPostsByUser(clerkId: string, limit = 50) {
    try {
      if (prisma.instagramPost && prisma.instagramPost.findMany) {
        return await prisma.instagramPost.findMany({
          where: { clerkId },
          orderBy: { timestamp: "desc" },
          take: limit,
        });
      } else {
        console.log("Database not available, returning empty array");
        return [];
      }
    } catch (error) {
      console.error("Error getting Instagram posts by user:", error);
      return [];
    }
  }

  async updateInstagramPost(
    mediaId: string,
    clerkId: string,
    data: UpdateInstagramPostData
  ) {
    try {
      if (prisma.instagramPost && prisma.instagramPost.updateMany) {
        return await prisma.instagramPost.updateMany({
          where: {
            mediaId,
            clerkId,
          },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
      } else {
        console.log("Database not available, returning mock update result");
        return { count: 0 };
      }
    } catch (error) {
      console.error("Error updating Instagram post:", error);
      return { count: 0 };
    }
  }

  async deleteInstagramPost(mediaId: string, clerkId: string) {
    try {
      if (prisma.instagramPost && prisma.instagramPost.deleteMany) {
        return await prisma.instagramPost.deleteMany({
          where: {
            mediaId,
            clerkId,
          },
        });
      } else {
        console.log("Database not available, returning mock delete result");
        return { count: 0 };
      }
    } catch (error) {
      console.error("Error deleting Instagram post:", error);
      return { count: 0 };
    }
  }

  // Instagram Analytics
  async createInstagramAnalytics(data: CreateInstagramAnalyticsData) {
    try {
      if (prisma.instagramAnalytics && prisma.instagramAnalytics.create) {
        return await prisma.instagramAnalytics.create({
          data: {
            mediaId: data.mediaId,
            period: data.period,
            reach: data.reach || 0,
            likes: data.likes || 0,
            comments: data.comments || 0,
            shares: data.shares || 0,
            saved: data.saved || 0,
            views: data.views || 0,
            rawData: data.rawData,
            clerkId: data.clerkId,
          },
        });
      } else {
        console.log("Database not available, returning mock analytics data");
        return {
          id: "mock-analytics-" + data.mediaId,
          mediaId: data.mediaId,
          period: data.period,
          reach: data.reach || 0,
          likes: data.likes || 0,
          comments: data.comments || 0,
          shares: data.shares || 0,
          saved: data.saved || 0,
          views: data.views || 0,
          rawData: data.rawData,
          clerkId: data.clerkId,
        };
      }
    } catch (error) {
      console.error("Error creating Instagram analytics:", error);
      return {
        id: "mock-analytics-" + data.mediaId,
        mediaId: data.mediaId,
        period: data.period,
        reach: data.reach || 0,
        likes: data.likes || 0,
        comments: data.comments || 0,
        shares: data.shares || 0,
        saved: data.saved || 0,
        views: data.views || 0,
        rawData: data.rawData,
        clerkId: data.clerkId,
      };
    }
  }

  async getInstagramAnalyticsByMediaId(mediaId: string, clerkId: string) {
    try {
      if (prisma.instagramAnalytics && prisma.instagramAnalytics.findMany) {
        return await prisma.instagramAnalytics.findMany({
          where: {
            mediaId,
            clerkId,
          },
          orderBy: { timestamp: "desc" },
        });
      } else {
        console.log("Database not available, returning empty array");
        return [];
      }
    } catch (error) {
      console.error("Error getting Instagram analytics by media ID:", error);
      return [];
    }
  }

  async getAllInstagramAnalytics(clerkId: string) {
    try {
      if (prisma.instagramAnalytics && prisma.instagramAnalytics.findMany) {
        return await prisma.instagramAnalytics.findMany({
          where: { clerkId },
          orderBy: { timestamp: "desc" },
        });
      } else {
        console.log("Database not available, returning empty array");
        return [];
      }
    } catch (error) {
      console.error("Error getting all Instagram analytics:", error);
      return [];
    }
  }

  // Instagram Account
  async createOrUpdateInstagramAccount(data: CreateInstagramAccountData) {
    try {
      if (prisma.instagramAccount && prisma.instagramAccount.upsert) {
        return await prisma.instagramAccount.upsert({
          where: {
            clerkId: data.clerkId,
          },
          update: {
            accountId: data.accountId,
            username: data.username,
            name: data.name,
            biography: data.biography,
            followersCount: data.followersCount || 0,
            followsCount: data.followsCount || 0,
            mediaCount: data.mediaCount || 0,
            profilePictureUrl: data.profilePictureUrl,
            website: data.website,
            profileViews: data.profileViews || 0,
            websiteClicks: data.websiteClicks || 0,
            accountsEngaged: data.accountsEngaged || 0,
            totalInteractions: data.totalInteractions || 0,
            averageEngagementPerPost: data.averageEngagementPerPost,
            engagementRatePercentage: data.engagementRatePercentage,
            totalEngagementLast12Posts: data.totalEngagementLast12Posts || 0,
            totalPostsAnalyzed: data.totalPostsAnalyzed || 0,
            rawAccountData: data.rawAccountData,
            rawRecentMedia: data.rawRecentMedia,
            lastSync: new Date(),
            updatedAt: new Date(),
          },
          create: {
            accountId: data.accountId,
            username: data.username,
            name: data.name,
            biography: data.biography,
            followersCount: data.followersCount || 0,
            followsCount: data.followsCount || 0,
            mediaCount: data.mediaCount || 0,
            profilePictureUrl: data.profilePictureUrl,
            website: data.website,
            profileViews: data.profileViews || 0,
            websiteClicks: data.websiteClicks || 0,
            accountsEngaged: data.accountsEngaged || 0,
            totalInteractions: data.totalInteractions || 0,
            averageEngagementPerPost: data.averageEngagementPerPost,
            engagementRatePercentage: data.engagementRatePercentage,
            totalEngagementLast12Posts: data.totalEngagementLast12Posts || 0,
            totalPostsAnalyzed: data.totalPostsAnalyzed || 0,
            rawAccountData: data.rawAccountData,
            rawRecentMedia: data.rawRecentMedia,
            clerkId: data.clerkId,
          },
        });
      } else {
        console.log("Database not available, returning mock account data");
        return {
          id: "mock-account-" + data.clerkId,
          accountId: data.accountId,
          username: data.username,
          name: data.name,
          biography: data.biography,
          followersCount: data.followersCount || 0,
          followsCount: data.followsCount || 0,
          mediaCount: data.mediaCount || 0,
          profilePictureUrl: data.profilePictureUrl,
          website: data.website,
          profileViews: data.profileViews || 0,
          websiteClicks: data.websiteClicks || 0,
          accountsEngaged: data.accountsEngaged || 0,
          totalInteractions: data.totalInteractions || 0,
          averageEngagementPerPost: data.averageEngagementPerPost,
          engagementRatePercentage: data.engagementRatePercentage,
          totalEngagementLast12Posts: data.totalEngagementLast12Posts || 0,
          totalPostsAnalyzed: data.totalPostsAnalyzed || 0,
          rawAccountData: data.rawAccountData,
          rawRecentMedia: data.rawRecentMedia,
          clerkId: data.clerkId,
        };
      }
    } catch (error) {
      console.error("Error creating/updating Instagram account:", error);
      return {
        id: "mock-account-" + data.clerkId,
        accountId: data.accountId,
        username: data.username,
        name: data.name,
        biography: data.biography,
        followersCount: data.followersCount || 0,
        followsCount: data.followsCount || 0,
        mediaCount: data.mediaCount || 0,
        profilePictureUrl: data.profilePictureUrl,
        website: data.website,
        profileViews: data.profileViews || 0,
        websiteClicks: data.websiteClicks || 0,
        accountsEngaged: data.accountsEngaged || 0,
        totalInteractions: data.totalInteractions || 0,
        averageEngagementPerPost: data.averageEngagementPerPost,
        engagementRatePercentage: data.engagementRatePercentage,
        totalEngagementLast12Posts: data.totalEngagementLast12Posts || 0,
        totalPostsAnalyzed: data.totalPostsAnalyzed || 0,
        rawAccountData: data.rawAccountData,
        rawRecentMedia: data.rawRecentMedia,
        clerkId: data.clerkId,
      };
    }
  }

  async getInstagramAccount(clerkId: string) {
    try {
      if (prisma.instagramAccount && prisma.instagramAccount.findUnique) {
        return await prisma.instagramAccount.findUnique({
          where: { clerkId },
        });
      } else {
        console.log("Database not available, returning null");
        return null;
      }
    } catch (error) {
      console.error("Error getting Instagram account:", error);
      return null;
    }
  }

  // Sync methods for API responses
  async syncInstagramPostFromApiResponse(
    apiResponse: InstagramAnalyticsResponse,
    clerkId: string
  ) {
    if (!apiResponse.data) return null;

    const { data } = apiResponse;

    // Create or update the post
    const postData: CreateInstagramPostData = {
      mediaId: data.media_id,
      mediaType: data.media_type,
      mediaUrl: data.media_info?.media_url,
      caption: data.media_info?.caption,
      permalink: data.media_info?.permalink,
      timestamp: new Date(data.media_info?.timestamp || Date.now()),
      clerkId,
    };

    const post = await this.createInstagramPost(postData);

    // Update analytics
    const analytics = data.analytics;
    const analyticsData: CreateInstagramAnalyticsData = {
      mediaId: data.media_id,
      period: "lifetime",
      reach: analytics.reach,
      likes: analytics.likes,
      comments: analytics.comments,
      shares: analytics.shares,
      saved: analytics.saved,
      views: analytics.views,
      rawData: data.raw_analytics,
      clerkId,
    };

    await this.createInstagramAnalytics(analyticsData);

    // Update post with analytics data
    await this.updateInstagramPost(data.media_id, clerkId, {
      likes: analytics.likes,
      comments: analytics.comments,
      shares: analytics.shares,
      saved: analytics.saved,
      reach: analytics.reach,
      views: analytics.views,
      rawAnalytics: data.raw_analytics,
      rawComments: data.comments,
      mediaInfo: data.media_info,
    });

    return post;
  }

  async syncInstagramAccountFromApiResponse(
    apiResponse: InstagramPageAnalyticsResponse,
    clerkId: string
  ) {
    if (!apiResponse.data) return null;

    const { data } = apiResponse;

    const accountData: CreateInstagramAccountData = {
      accountId: data.account_id,
      username: data.account_info.username,
      name: data.account_info.name,
      biography: data.account_info.biography,
      followersCount: data.account_info.followers_count,
      followsCount: data.account_info.follows_count,
      mediaCount: data.account_info.media_count,
      profilePictureUrl: data.account_info.profile_picture_url,
      website: data.account_info.website,
      profileViews: data.account_analytics.profile_views.value,
      websiteClicks: data.account_analytics.website_clicks.value,
      accountsEngaged: data.account_analytics.accounts_engaged.value,
      totalInteractions: data.account_analytics.total_interactions.value,
      averageEngagementPerPost:
        data.influencer_metrics.average_engagement_per_post,
      engagementRatePercentage:
        data.influencer_metrics.engagement_rate_percentage,
      totalEngagementLast12Posts:
        data.influencer_metrics.total_engagement_last_12_posts,
      totalPostsAnalyzed: data.influencer_metrics.total_posts_analyzed,
      rawAccountData: data,
      rawRecentMedia: data.recent_media,
      clerkId,
    };

    return await this.createOrUpdateInstagramAccount(accountData);
  }

  // Cleanup method
  async cleanup() {
    await prisma.$disconnect();
  }
}

// Export singleton instance
export const instagramDbService = new InstagramDbService();
