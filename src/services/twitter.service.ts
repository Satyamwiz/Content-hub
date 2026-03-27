import { TwitterApi, TwitterApiReadWrite } from 'twitter-api-v2';
import envVars from '@/data/env/envVars';

export interface TwitterAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface TwitterUserInfo {
  id: string;
  username: string;
  name: string;
  profileImageUrl?: string;
  followersCount?: number;
  followingCount?: number;
  tweetCount?: number;
  verified?: boolean;
}

export interface TwitterTweetMetrics {
  impressionCount?: number;
  likeCount?: number;
  replyCount?: number;
  retweetCount?: number;
  quoteCount?: number;
  bookmarkCount?: number;
}

export interface TwitterTweet {
  id: string;
  text: string;
  createdAt: string;
  authorId: string;
  metrics?: TwitterTweetMetrics;
  mediaKeys?: string[];
}

export interface TwitterAnalytics {
  user: TwitterUserInfo;
  recentTweets: TwitterTweet[];
  totalEngagement: number;
  averageEngagement: number;
  topTweet?: TwitterTweet;
}

export class TwitterService {
  private client: TwitterApiReadWrite | null = null;

  constructor(tokens?: TwitterAuthTokens) {
    if (tokens?.accessToken) {
      this.client = new TwitterApi(tokens.accessToken).readWrite;
    }
  }

  // Initialize OAuth 2.0 flow
  static generateAuthUrl(): { url: string; codeVerifier: string; state: string } {
    const client = new TwitterApi({
      clientId: envVars.TWITTER_CLIENT_ID!,
      clientSecret: envVars.TWITTER_CLIENT_SECRET!,
    });

    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);

    const { url, codeVerifier } = client.generateOAuth2AuthLink(
      envVars.TWITTER_REDIRECT_URI!,
      {
        scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
        state,
      }
    );

    return {
      url,
      codeVerifier,
      state,
    };
  }

  // Exchange authorization code for access token
  static async exchangeCodeForTokens(
    code: string,
    codeVerifier: string
  ): Promise<TwitterAuthTokens> {
    const client = new TwitterApi({
      clientId: envVars.TWITTER_CLIENT_ID!,
      clientSecret: envVars.TWITTER_CLIENT_SECRET!,
    });

    const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: envVars.TWITTER_REDIRECT_URI!,
    });

    return {
      accessToken,
      refreshToken,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined,
    };
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<TwitterAuthTokens> {
    const client = new TwitterApi({
      clientId: envVars.TWITTER_CLIENT_ID!,
      clientSecret: envVars.TWITTER_CLIENT_SECRET!,
    });

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = 
      await client.refreshOAuth2Token(refreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken || refreshToken,
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined,
    };
  }

  // Get current user information
  async getCurrentUser(): Promise<TwitterUserInfo> {
    if (!this.client) {
      throw new Error('Twitter client not initialized');
    }

    const user = await this.client.v2.me({
      'user.fields': [
        'profile_image_url',
        'public_metrics',
        'verified',
        'description',
      ],
    });

    return {
      id: user.data.id,
      username: user.data.username,
      name: user.data.name,
      profileImageUrl: user.data.profile_image_url,
      followersCount: user.data.public_metrics?.followers_count,
      followingCount: user.data.public_metrics?.following_count,
      tweetCount: user.data.public_metrics?.tweet_count,
      verified: user.data.verified,
    };
  }

  // Basic user info only (no detailed analytics)
  async getBasicUserInfo(userId: string): Promise<{ id: string; username: string; name: string }> {
    if (!this.client) {
      throw new Error('Twitter client not initialized');
    }

    const user = await this.client.v2.user(userId, {
      'user.fields': ['username', 'name'],
    });

    return {
      id: user.data.id,
      username: user.data.username,
      name: user.data.name,
    };
  }

  // Post a tweet
  async postTweet(text: string, mediaIds?: string[]): Promise<{ id: string; text: string }> {
    if (!this.client) {
      throw new Error('Twitter client not initialized');
    }

    const tweetData: any = { text };
    
    if (mediaIds && mediaIds.length > 0) {
      tweetData.media = { media_ids: mediaIds };
    }

    const tweet = await this.client.v2.tweet(tweetData);
    
    return {
      id: tweet.data.id,
      text: tweet.data.text,
    };
  }

  // Upload media (image/video)
  async uploadMedia(mediaBuffer: Buffer, mediaType: 'image' | 'video'): Promise<string> {
    if (!this.client) {
      throw new Error('Twitter client not initialized');
    }

    const mediaId = await this.client.v1.uploadMedia(mediaBuffer, {
      mimeType: mediaType === 'image' ? 'image/jpeg' : 'video/mp4',
    });

    return mediaId;
  }



  // Check if tokens are valid
  async validateTokens(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error: any) {
      // Don't treat rate limiting as invalid tokens
      if (error.code === 429 || error.message?.includes('429')) {
        console.warn('Rate limited during token validation, assuming tokens are valid');
        return true;
      }
      return false;
    }
  }
}