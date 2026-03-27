import { NextResponse } from "next/server";
import { YouTubeTokenService } from "@/services/youtube-token.service";

export async function GET() {
  try {
    // Check if user has valid YouTube tokens (this automatically handles refresh if needed)
    const hasValidTokens = await YouTubeTokenService.hasValidTokens();

    if (!hasValidTokens) {
      return NextResponse.json({ authenticated: false });
    }

    // Get token details for response
    const tokenData = await YouTubeTokenService.getTokens();

    if (!tokenData) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      tokenInfo: {
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        expiry: tokenData.expiry_date
          ? new Date(tokenData.expiry_date).toISOString()
          : null,
        isExpired: !!(
          tokenData.expiry_date && Date.now() > tokenData.expiry_date
        ),
      },
    });
  } catch (error) {
    console.error("Error checking auth status:", error);
    return NextResponse.json(
      { error: "Failed to check authentication status", authenticated: false },
      { status: 500 }
    );
  }
}
