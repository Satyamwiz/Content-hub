import { google } from "googleapis";
import { NextResponse } from "next/server";
import { YouTubeTokenService } from "@/services/youtube-token.service";

export async function GET() {
  try {
    // Debug output
    const debug: {
      tokenStorage: string;
      hasValidTokens: boolean;
      env: {
        hasClientId: boolean;
        hasClientSecret: boolean;
        hasRedirectUri: boolean;
        redirectUri: string | undefined;
        nodeEnv: "development" | "production" | "test" | undefined;
      };
      token?: {
        hasAccessToken: boolean;
        hasRefreshToken: boolean;
        expiry: string | null;
        isExpired: boolean;
        tokenType?: string;
        scope?: string;
      };
      tokenReadError?: string;
    } = {
      tokenStorage: "database",
      hasValidTokens: await YouTubeTokenService.hasValidTokens(),
      env: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        nodeEnv: process.env.NODE_ENV,
      },
    };

    // Add token data if available
    try {
      const tokenData = await YouTubeTokenService.getTokens();
      if (tokenData) {
        debug.token = {
          hasAccessToken: !!tokenData.access_token,
          hasRefreshToken: !!tokenData.refresh_token,
          expiry: tokenData.expiry_date
            ? new Date(tokenData.expiry_date).toISOString()
            : null,
          isExpired: !!(
            tokenData.expiry_date && Date.now() > tokenData.expiry_date
          ),
          tokenType: tokenData.token_type,
          scope: tokenData.scope,
        };
      }
    } catch (e) {
      debug.tokenReadError = (e as Error).message;
    }

    return NextResponse.json(debug);
  } catch (error) {
    return NextResponse.json(
      { error: "Debug failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
