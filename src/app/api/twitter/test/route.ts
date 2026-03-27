import { NextResponse } from 'next/server';
import envVars from '@/data/env/envVars';

export async function GET() {
  try {
    // Check if Twitter credentials are configured
    const hasClientId = !!envVars.TWITTER_CLIENT_ID && envVars.TWITTER_CLIENT_ID !== 'your_actual_client_id_here';
    const hasClientSecret = !!envVars.TWITTER_CLIENT_SECRET && envVars.TWITTER_CLIENT_SECRET !== 'your_actual_client_secret_here';
    const hasRedirectUri = !!envVars.TWITTER_REDIRECT_URI;

    return NextResponse.json({
      status: 'Twitter Integration Test',
      credentials: {
        clientId: hasClientId ? 'Configured ✅' : 'Missing ❌',
        clientSecret: hasClientSecret ? 'Configured ✅' : 'Missing ❌',
        redirectUri: hasRedirectUri ? 'Configured ✅' : 'Missing ❌',
      },
      ready: hasClientId && hasClientSecret && hasRedirectUri,
      message: hasClientId && hasClientSecret && hasRedirectUri 
        ? 'Twitter integration is ready to use!' 
        : 'Please configure your Twitter app credentials in .env file'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}