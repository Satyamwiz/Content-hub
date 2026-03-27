import { NextResponse } from "next/server";
import YouTubeAnalyticsService from "@/services/youtube-analytics.service";

// Manual sync endpoint (can be used by users or scheduled jobs)
export async function POST() {
  try {
    const result = await YouTubeAnalyticsService.syncAnalytics();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in sync endpoint:", error);
    return NextResponse.json(
      { error: "Failed to sync analytics data" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "YouTube Analytics Sync",
    timestamp: new Date().toISOString(),
  });
}
