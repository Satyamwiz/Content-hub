import { NextRequest, NextResponse } from 'next/server';
import { TwitterTokenDbService } from '@/services/twitter-token-db.service';
import { auth } from '@clerk/nextjs/server';

const X_API_TWEETS_ENDPOINT = 'https://api.twitter.com/2/tweets';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tweet text is required' },
        { status: 400 }
      );
    }

    if (text.trim().length > 280) {
      return NextResponse.json(
        { error: 'Tweet text exceeds 280 characters' },
        { status: 400 }
      );
    }

    // Get (and auto-refresh if needed) the stored OAuth 2.0 user access token
    const tokens = await TwitterTokenDbService.refreshTokensIfNeeded(userId);

    if (!tokens?.accessToken) {
      return NextResponse.json(
        { error: 'Twitter not authenticated. Please connect your Twitter account first.' },
        { status: 401 }
      );
    }

    console.log('🚀 Calling X API v2 POST /2/tweets ...');

    // Direct call to X API v2 as per official documentation:
    // POST https://api.x.com/2/tweets
    // Authorization: Bearer <oauth2_user_access_token>
    // Content-Type: application/json
    // Body: { "text": "..." }
    const xApiResponse = await fetch(X_API_TWEETS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
      }),
    });

    const xApiData = await xApiResponse.json();

    console.log(`📡 X API response status: ${xApiResponse.status}`);
    console.log('📡 X API response body:', JSON.stringify(xApiData));

    // Handle X API error responses
    if (!xApiResponse.ok) {
      // X API v2 returns errors in { errors: [...], title, detail, type } format
      const errorTitle = xApiData?.title || '';
      const errorDetail = xApiData?.detail || '';
      const errorErrors = xApiData?.errors?.map((e: any) => e.message || e.code).join(', ') || '';
      const fullError = [errorTitle, errorDetail, errorErrors].filter(Boolean).join(' — ');

      console.error('❌ X API error:', xApiData);

      if (xApiResponse.status === 401) {
        return NextResponse.json(
          {
            error: `Authentication failed. Your Twitter token may be expired or invalid. Please reconnect your Twitter account. (${fullError || 'Unauthorized'})`,
          },
          { status: 401 }
        );
      }

      if (xApiResponse.status === 403) {
        return NextResponse.json(
          {
            error: `Access forbidden (403). Make sure your Twitter Developer App has "Read and Write" permissions enabled in the Developer Portal, then reconnect your account. (${fullError || 'Forbidden'})`,
          },
          { status: 403 }
        );
      }

      if (xApiResponse.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Free tier allows 500 posts/month. Please try again later.' },
          { status: 429 }
        );
      }

      if (xApiResponse.status === 400) {
        const isDuplicate =
          errorDetail?.toLowerCase().includes('duplicate') ||
          errorErrors?.toLowerCase().includes('duplicate');

        return NextResponse.json(
          { error: isDuplicate ? 'Duplicate tweet — this exact text was already posted recently.' : `Bad request: ${fullError}` },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `X API error (${xApiResponse.status}): ${fullError || 'Unknown error'}` },
        { status: xApiResponse.status }
      );
    }

    // Success: X API v2 returns { data: { id, text } }
    const tweetId = xApiData?.data?.id;
    const tweetText = xApiData?.data?.text;

    if (!tweetId) {
      console.error('❌ Unexpected X API response format:', xApiData);
      return NextResponse.json(
        { error: 'Tweet may have been posted, but the response format was unexpected.' },
        { status: 500 }
      );
    }

    console.log(`✅ Tweet published successfully! ID: ${tweetId}`);

    return NextResponse.json({
      success: true,
      tweet: {
        id: tweetId,
        text: tweetText,
        url: `https://x.com/i/web/status/${tweetId}`,
      },
    });
  } catch (error) {
    console.error('💥 Twitter publish route error:', error);
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}