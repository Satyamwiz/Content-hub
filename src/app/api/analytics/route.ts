import { NextResponse } from "next/server";
import { mockYouTubeData } from "@/features/dashboard/mock-data/youtube-data";
import { YouTubeTokenService } from "@/services/youtube-token.service";

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true";

export async function GET() {
  // Check if authenticated first
  const hasTokens = await YouTubeTokenService.hasValidTokens();
  if (!hasTokens) {
    return NextResponse.json(
      { error: "Not authenticated with YouTube", authenticated: false },
      { status: 401 }
    );
  }

  // For prototype: use mock data if configured
  if (USE_MOCK_DATA) {
    return NextResponse.json({ ...mockYouTubeData, authenticated: true });
  }

  try {
    // Use the YouTube services from our token service
    const youtube = await YouTubeTokenService.getYouTubeService();
    const youtubeAnalytics =
      await YouTubeTokenService.getYouTubeAnalyticsService();
    // Fix part parameter to use array format as required by the API
    const channelResp = await youtube.channels.list({
      part: ["snippet", "statistics"],
      mine: true,
    });
    const channel = channelResp.data.items?.[0];

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const analyticsResp = await youtubeAnalytics.reports.query({
      ids: "channel==MINE",
      startDate: thirtyDaysAgo.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      metrics: "views,likes,subscribersGained,estimatedMinutesWatched",
      dimensions: "day",
      sort: "day",
    });

    return NextResponse.json({
      channel,
      analytics: analyticsResp.data,
      authenticated: true,
    });
  } catch (err) {
    console.error("YouTube API error:", err);

    // If there's an auth error, mark as not authenticated
    const error = err as Error;
    const isAuthError =
      error.message?.includes("auth") ||
      error.message?.includes("Authentication") ||
      error.message?.includes("401");

    if (isAuthError) {
      try {
        // On auth errors, clear the tokens to force re-authentication
        await YouTubeTokenService.deleteTokens();
      } catch (e) {
        console.error("Failed to clear user tokens:", e);
      }
    }

    return NextResponse.json(
      {
        error: "Analytics fetch failed: " + (error.message || "Unknown error"),
        authenticated: !isAuthError,
        errorDetails: {
          message: error.message,
          isAuthError,
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
