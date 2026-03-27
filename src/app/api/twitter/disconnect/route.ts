import { NextRequest, NextResponse } from 'next/server';
import { TwitterTokenDbService } from '@/services/twitter-token-db.service';
import { twitterCache } from '@/services/twitter-cache.service';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove tokens from database
    await TwitterTokenDbService.removeTokens(userId);
    
    // Clear cache
    twitterCache.delete(`twitter-auth-${userId}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Twitter account disconnected successfully'
    });
    
  } catch (error) {
    console.error('Twitter disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Twitter account' },
      { status: 500 }
    );
  }
}