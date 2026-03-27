import { google } from "googleapis";
import { NextResponse } from "next/server";

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

export async function GET() {
  try {
    console.log("OAuth flow started with environment variables:", {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent", // Force consent screen to ensure we get refresh token
      include_granted_scopes: true,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI, // Explicitly set redirect_uri again
    });

    console.log(
      "Generated auth URL (first 100 chars):",
      authUrl.substring(0, 100) + "..."
    );

    // Redirect the user to the auth URL
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      {
        error: "Failed to generate auth URL",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
