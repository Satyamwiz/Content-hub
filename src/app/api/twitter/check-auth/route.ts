import { NextRequest, NextResponse } from 'next/server';
import { TwitterTokenDbService } from '@/services/twitter-token-db.service';
import { TwitterService } from '@/services/twitter.service';
import { twitterCache } from '@/services/twitter-cache.service';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Check cache first to reduce database and API calls
    const cacheKey = `twitter-auth-${userId}`;
    const cachedResult = twitterCache.get(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true
      });
    }

    // Check if user has valid tokens without making API calls
    const hasValidTokens = await TwitterTokenDbService.hasValidTokens(userId);
    
    if (!hasValidTokens) {
      const result = { authenticated: false };
      twitterCache.set(cacheKey, result, 30 * 1000); // Cache negative result for 30 seconds
      return NextResponse.json(result);
    }

    // Get tokens and basic user info from database
    const tokens = await TwitterTokenDbService.getTokens(userId);
    const userProfile = await TwitterTokenDbService.getUserProfile(userId);
    
    if (!tokens || !userProfile) {
      const result = { authenticated: false };
      twitterCache.set(cacheKey, result, 30 * 1000);
      return NextResponse.json(result);
    }

    // Only validate tokens with API call if they're close to expiry or if we don't have user profile
    const needsValidation = !userProfile.username || 
      (tokens.expiresAt && tokens.expiresAt.getTime() - Date.now() < 10 * 60 * 1000); // 10 minutes

    if (needsValidation) {
      try {
        const twitterService = new TwitterService(tokens);
        const userInfo = await twitterService.getCurrentUser();
        
        // Update user profile in database
        await TwitterTokenDbService.storeUserProfile(userId, userInfo.id, userInfo.username);
        
        const result = {
          authenticated: true,
          user: {
            id: userInfo.id,
            username: userInfo.username,
            name: userInfo.name,
            profileImageUrl: userInfo.profileImageUrl,
          },
        };
        
        // Cache successful result for 5 minutes
        twitterCache.set(cacheKey, result, 5 * 60 * 1000);
        return NextResponse.json(result);
        
      } catch (apiError: any) {
        // Handle rate limiting gracefully
        if (apiError.code === 429 || apiError.message?.includes('429')) {
          console.warn('Twitter API rate limit hit, using cached data');
          
          // Return cached user data if available
          if (userProfile.username) {
            const result = {
              authenticated: true,
              user: {
                id: userProfile.twitterUserId || '',
                username: userProfile.username,
                name: userProfile.username, // Fallback to username
                profileImageUrl: undefined,
              },
              rateLimited: true
            };
            
            // Cache rate-limited result for 15 minutes
            twitterCache.set(cacheKey, result, 15 * 60 * 1000);
            return NextResponse.json(result);
          }
        }
        
        // For other errors, remove invalid tokens
        console.error('Twitter API validation failed:', apiError);
        await TwitterTokenDbService.removeTokens(userId);
        const result = { authenticated: false };
        twitterCache.set(cacheKey, result, 60 * 1000); // Cache for 1 minute
        return NextResponse.json(result);
      }
    }

    // Return cached user data
    const result = {
      authenticated: true,
      user: {
        id: userProfile.twitterUserId || '',
        username: userProfile.username || '',
        name: userProfile.username || '', // Fallback to username
        profileImageUrl: undefined,
      },
    };
    
    // Cache database result for 5 minutes
    twitterCache.set(cacheKey, result, 5 * 60 * 1000);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Twitter auth check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}