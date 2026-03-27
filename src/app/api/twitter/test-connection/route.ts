import { NextRequest, NextResponse } from 'next/server';
import { TwitterService } from '@/services/twitter.service';
import { TwitterTokenDbService } from '@/services/twitter-token-db.service';
import { twitterCache } from '@/services/twitter-cache.service';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check cache first
    const cacheKey = `twitter-test-${userId}`;
    const cachedResult = twitterCache.get(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true
      });
    }

    // Get user tokens
    const tokens = await TwitterTokenDbService.refreshTokensIfNeeded(userId);
    
    if (!tokens) {
      return NextResponse.json({ 
        error: 'No Twitter tokens found. Please authenticate first.' 
      }, { status: 401 });
    }

    // Test the connection with rate limit handling
    try {
      const twitterService = new TwitterService(tokens);
      const user = await twitterService.getCurrentUser();

      const result = {
        success: true,
        message: 'Twitter connection is working!',
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          tweetCount: user.tweetCount,
        },
      };

      // Cache successful result for 10 minutes
      twitterCache.set(cacheKey, result, 10 * 60 * 1000);
      return NextResponse.json(result);

    } catch (apiError: any) {
      // Handle rate limiting
      if (apiError.code === 429 || apiError.message?.includes('429')) {
        const result = {
          success: false,
          error: 'Twitter API rate limit reached. Please try again later.',
          rateLimited: true
        };
        
        // Cache rate limit error for 15 minutes
        twitterCache.set(cacheKey, result, 15 * 60 * 1000);
        return NextResponse.json(result, { status: 429 });
      }
      
      throw apiError; // Re-throw other errors
    }
    
  } catch (error) {
    console.error('Twitter test error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Twitter API Error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to test Twitter connection' },
      { status: 500 }
    );
  }
}