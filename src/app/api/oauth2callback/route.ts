import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { YouTubeTokenService } from "@/services/youtube-token.service";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code)
    return NextResponse.redirect(new URL("/dashboard?auth=error", req.url));

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  try {
    const { tokens } = await oAuth2Client.getToken(code);

    // Ensure we have all required tokens
    if (!tokens.access_token) {
      console.error("No access token received");
      return NextResponse.redirect(new URL("/dashboard?auth=error", req.url));
    }

    oAuth2Client.setCredentials(tokens);

    // Store tokens in database per user
    try {
      await YouTubeTokenService.saveTokens({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || undefined,
        expiry_date: tokens.expiry_date || undefined,
        token_type: tokens.token_type || undefined,
        scope: tokens.scope || undefined,
      });
    } catch (saveError) {
      console.error("Error saving tokens to database:", saveError);
      return NextResponse.redirect(new URL("/dashboard?auth=error", req.url));
    }

    return NextResponse.redirect(new URL("/dashboard?auth=success", req.url));
  } catch (err) {
    console.error("OAuth error:", err);
    return NextResponse.redirect(new URL("/dashboard?auth=error", req.url));
  }
}
