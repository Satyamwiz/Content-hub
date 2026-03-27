import { NextRequest, NextResponse } from 'next/server';
import { TwitterService } from '@/services/twitter.service';
import { TwitterTokenDbService } from '@/services/twitter-token-db.service';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, codeVerifier, state } = TwitterService.generateAuthUrl();
    
    // Store in cookies instead of globalThis, which is lost across requests in Next 15 serverless/edge/dev
    const cookieStore = await cookies();
    cookieStore.set('twitter_oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 10, path: '/' });
    cookieStore.set('twitter_code_verifier', codeVerifier, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 10, path: '/' });

    return NextResponse.json({ authUrl: url });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}