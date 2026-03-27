import { google } from "googleapis";
import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export interface YouTubeTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type?: string;
  scope?: string;
}

export class YouTubeTokenService {
  /**
   * Save YouTube tokens to the database for the current user
   */
  static async saveTokens(tokens: YouTubeTokens): Promise<void> {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    await prisma.user.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        youtubeAccessToken: tokens.access_token,
        youtubeRefreshToken: tokens.refresh_token || null,
        youtubeTokenExpiry: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
        youtubeTokenType: tokens.token_type || null,
        youtubeScope: tokens.scope || null,
      },
      update: {
        youtubeAccessToken: tokens.access_token,
        youtubeRefreshToken: tokens.refresh_token || null,
        youtubeTokenExpiry: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
        youtubeTokenType: tokens.token_type || null,
        youtubeScope: tokens.scope || null,
      },
    });

    // After saving tokens, attempt to fetch channel statistics (subscriber count)
    try {
      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        process.env.GOOGLE_REDIRECT_URI!
      );

      oAuth2Client.setCredentials({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });

      const youtube = google.youtube({ version: "v3", auth: oAuth2Client });

      const channelsResp = await youtube.channels.list({
        part: ["statistics"],
        mine: true,
      });

      const items = channelsResp.data.items || [];
      if (items.length > 0) {
        const stats: any = items[0].statistics || {};
        const subscriberCount = stats.subscriberCount
          ? Number(stats.subscriberCount)
          : 0;

        // Upsert today's analytics snapshot with subscriber total
        const today = new Date();
        const snapshotDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        const upsertPayload: any = {
          where: {
            clerkId_date: {
              clerkId: userId,
              date: snapshotDate,
            },
          },
          update: {
            subscribersTotal: subscriberCount,
            rawData: { channelStatistics: stats },
          },
          create: {
            clerkId: userId,
            date: snapshotDate,
            subscribersTotal: subscriberCount,
            rawData: { channelStatistics: stats },
          },
        };

        await prisma.youTubeAnalytics.upsert(upsertPayload as any);
      }
    } catch (err) {
      console.error("Failed to fetch channel statistics:", err);
    }
  }

  /**
   * Get YouTube tokens from the database for the current user
   */
  static async getTokens(): Promise<YouTubeTokens | null> {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        youtubeAccessToken: true,
        youtubeRefreshToken: true,
        youtubeTokenExpiry: true,
        youtubeTokenType: true,
        youtubeScope: true,
      },
    });

    if (!user || !user.youtubeAccessToken) {
      return null;
    }

    return {
      access_token: user.youtubeAccessToken,
      refresh_token: user.youtubeRefreshToken || undefined,
      expiry_date: user.youtubeTokenExpiry
        ? user.youtubeTokenExpiry.getTime()
        : undefined,
      token_type: user.youtubeTokenType || undefined,
      scope: user.youtubeScope || undefined,
    };
  }

  /**
   * Check if user has valid YouTube tokens
   */
  static async hasValidTokens(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      if (!tokens) return false;

      // Check if token exists and is not expired
      if (tokens.expiry_date && Date.now() > tokens.expiry_date) {
        // Try to refresh the token if we have a refresh token
        if (tokens.refresh_token) {
          return await this.refreshTokens();
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking token validity:", error);
      return false;
    }
  }

  /**
   * Refresh YouTube tokens using the refresh token
   */
  static async refreshTokens(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      if (!tokens || !tokens.refresh_token) {
        return false;
      }

      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        process.env.GOOGLE_REDIRECT_URI!
      );

      oAuth2Client.setCredentials({
        refresh_token: tokens.refresh_token,
      });

      // Refresh the access token
      const { credentials } = await oAuth2Client.refreshAccessToken();

      if (credentials.access_token) {
        await this.saveTokens({
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token || tokens.refresh_token,
          expiry_date: credentials.expiry_date || undefined,
          token_type: credentials.token_type || tokens.token_type,
          scope: credentials.scope || tokens.scope,
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error refreshing tokens:", error);
      return false;
    }
  }

  /**
   * Delete YouTube tokens for the current user
   */
  static async deleteTokens(): Promise<void> {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        youtubeAccessToken: null,
        youtubeRefreshToken: null,
        youtubeTokenExpiry: null,
        youtubeTokenType: null,
        youtubeScope: null,
      },
    });
  }

  /**
   * Get configured OAuth2 client with user's tokens
   */
  static async getOAuth2Client(): Promise<any> {
    const tokens = await this.getTokens();
    if (!tokens) {
      throw new Error("No YouTube tokens found. Please authenticate first.");
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );

    oAuth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type,
      scope: tokens.scope,
    });

    return oAuth2Client;
  }

  /**
   * Get YouTube service instance with authenticated client
   */
  static async getYouTubeService(): Promise<any> {
    const oAuth2Client = await this.getOAuth2Client();
    return google.youtube({ version: "v3", auth: oAuth2Client });
  }

  /**
   * Get YouTube Analytics service instance with authenticated client
   */
  static async getYouTubeAnalyticsService(): Promise<any> {
    const oAuth2Client = await this.getOAuth2Client();
    return google.youtubeAnalytics({ version: "v2", auth: oAuth2Client });
  }
}
