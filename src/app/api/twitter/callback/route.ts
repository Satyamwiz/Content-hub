import { NextRequest, NextResponse } from 'next/server';
import { TwitterService } from '@/services/twitter.service';
import { TwitterTokenDbService } from '@/services/twitter-token-db.service';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Twitter Authentication Error</title>
          </head>
          <body>
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h2>❌ Twitter Authentication Failed</h2>
              <p>Access was denied. You can close this window.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'TWITTER_AUTH_ERROR',
                    error: 'Access denied'
                  }, window.location.origin);
                }
                setTimeout(() => window.close(), 2000);
              </script>
            </div>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (!code || !state) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Twitter Authentication Error</title>
          </head>
          <body>
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h2>❌ Authentication Error</h2>
              <p>Missing required parameters. You can close this window.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'TWITTER_AUTH_ERROR',
                    error: 'Missing required parameters'
                  }, window.location.origin);
                }
                setTimeout(() => window.close(), 2000);
              </script>
            </div>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const cookieStore = await cookies();
    const cookieState = cookieStore.get('twitter_oauth_state')?.value;
    const cookieVerifier = cookieStore.get('twitter_code_verifier')?.value;

    if (!cookieState || cookieState !== state || !cookieVerifier) {
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Twitter Authentication Error</title>
          </head>
          <body>
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h2>❌ Authentication Error</h2>
              <p>Invalid authentication state. You can close this window.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({
                    type: 'TWITTER_AUTH_ERROR',
                    error: 'Invalid authentication state'
                  }, window.location.origin);
                }
                setTimeout(() => window.close(), 2000);
              </script>
            </div>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    let tokens;
    try {
      tokens = await TwitterService.exchangeCodeForTokens(
        code,
        cookieVerifier
      );
    } catch (tokenError: any) {
      console.error('❌ Token exchange failed (403 details):');
      console.error('  message:', tokenError?.message);
      console.error('  code:', tokenError?.code);
      console.error('  data:', JSON.stringify(tokenError?.data, null, 2));
      console.error('  This usually means one of:');
      console.error('  1) Redirect URI in Dev Portal does not match:', process.env.TWITTER_REDIRECT_URI);
      console.error('  2) OAuth 2.0 User Auth not enabled in Dev Portal');
      console.error('  3) App type is "Public Client" but a secret is being sent (or vice versa)');
      console.error('  4) Client ID/Secret are stale — regenerate them in Dev Portal');
      throw tokenError;
    }

    await TwitterTokenDbService.storeTokens(userId, tokens);
    
    const twitterService = new TwitterService(tokens);
    const userInfo = await twitterService.getCurrentUser();

    await TwitterTokenDbService.storeUserProfile(userId, userInfo.id, userInfo.username);
    
    cookieStore.delete('twitter_oauth_state');
    cookieStore.delete('twitter_code_verifier');

    // Return HTML that sends message to parent window and closes popup
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Twitter Authentication Success</title>
        </head>
        <body>
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>✅ Twitter Connected Successfully!</h2>
            <p>You can close this window now.</p>
            <script>

              
              // Send success message to parent window
              if (window.opener) {
                window.opener.postMessage({
                  type: 'TWITTER_AUTH_SUCCESS',
                  user: {
                    username: '${userInfo.username}',
                    name: '${userInfo.name}'
                  }
                }, window.location.origin);
              }
              
              // Close the popup after a short delay
              setTimeout(() => {
                window.close();
              }, 1000);
            </script>
          </div>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Twitter callback error:', error);
    
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Twitter Authentication Error</title>
        </head>
        <body>
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>❌ Authentication Failed</h2>
            <p>Something went wrong during authentication. You can close this window.</p>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'TWITTER_AUTH_ERROR',
                  error: 'Authentication callback failed'
                }, window.location.origin);
              }
              setTimeout(() => window.close(), 2000);
            </script>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}