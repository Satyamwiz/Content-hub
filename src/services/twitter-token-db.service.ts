import { PrismaClient } from '@prisma/client';
import { TwitterAuthTokens } from './twitter.service';

const prisma = new PrismaClient();

// Database-backed Twitter token service for production
export class TwitterTokenDbService {
  // Store user tokens in database
  static async storeTokens(userId: string, tokens: TwitterAuthTokens): Promise<void> {
    try {
      // First try to update existing user
      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          twitterAccessToken: tokens.accessToken,
          twitterRefreshToken: tokens.refreshToken,
          twitterTokenExpiry: tokens.expiresAt,
        },
      });
    } catch (error: any) {
      // If user doesn't exist (P2025 error), create the user first
      if (error.code === 'P2025') {
        console.log(`Creating new user record for clerkId: ${userId}`);
        await prisma.user.create({
          data: {
            clerkId: userId,
            twitterAccessToken: tokens.accessToken,
            twitterRefreshToken: tokens.refreshToken,
            twitterTokenExpiry: tokens.expiresAt,
          },
        });
      } else {
        throw error;
      }
    }
  }

  // Get user tokens from database
  static async getTokens(userId: string): Promise<TwitterAuthTokens | null> {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        twitterAccessToken: true,
        twitterRefreshToken: true,
        twitterTokenExpiry: true,
      },
    });

    if (!user?.twitterAccessToken) {
      return null;
    }

    return {
      accessToken: user.twitterAccessToken,
      refreshToken: user.twitterRefreshToken || undefined,
      expiresAt: user.twitterTokenExpiry || undefined,
    };
  }

  // Remove user tokens from database
  static async removeTokens(userId: string): Promise<void> {
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        twitterAccessToken: null,
        twitterRefreshToken: null,
        twitterTokenExpiry: null,
        twitterUserId: null,
        twitterUsername: null,
      },
    });
  }

  // Check if user has valid tokens
  static async hasValidTokens(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        twitterAccessToken: true,
        twitterTokenExpiry: true,
      },
    });

    if (!user?.twitterAccessToken) {
      return false;
    }

    // Check if tokens are expired
    if (user.twitterTokenExpiry && user.twitterTokenExpiry < new Date()) {
      return false;
    }

    return true;
  }

  // Refresh tokens if needed
  static async refreshTokensIfNeeded(userId: string): Promise<TwitterAuthTokens | null> {
    const tokens = await this.getTokens(userId);
    if (!tokens) return null;

    // Check if tokens need refresh (refresh 5 minutes before expiry)
    const needsRefresh = tokens.expiresAt && 
      tokens.expiresAt.getTime() - Date.now() < 5 * 60 * 1000;

    if (needsRefresh && tokens.refreshToken) {
      try {
        const { TwitterService } = await import('./twitter.service');
        const newTokens = await TwitterService.refreshAccessToken(tokens.refreshToken);
        await this.storeTokens(userId, newTokens);
        return newTokens;
      } catch (error) {
        console.error('Failed to refresh Twitter tokens:', error);
        // Remove invalid tokens
        await this.removeTokens(userId);
        return null;
      }
    }

    return tokens;
  }

  // Store user profile info
  static async storeUserProfile(userId: string, twitterUserId: string, username: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          twitterUserId,
          twitterUsername: username,
        },
      });
    } catch (error: any) {
      // If user doesn't exist, create with profile info
      if (error.code === 'P2025') {
        console.log(`Creating user record with Twitter profile for clerkId: ${userId}`);
        await prisma.user.create({
          data: {
            clerkId: userId,
            twitterUserId,
            twitterUsername: username,
          },
        });
      } else {
        throw error;
      }
    }
  }

  // Get user profile info
  static async getUserProfile(userId: string): Promise<{ twitterUserId?: string; username?: string } | null> {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        twitterUserId: true,
        twitterUsername: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      twitterUserId: user.twitterUserId || undefined,
      username: user.twitterUsername || undefined,
    };
  }
}