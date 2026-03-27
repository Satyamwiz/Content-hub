import { NextRequest, NextResponse } from "next/server";
import YouTubeAnalyticsService from "@/services/youtube-analytics.service";

// GET - Fetch stored analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const summary = searchParams.get("summary") === "true";

    if (summary) {
      const result = await YouTubeAnalyticsService.getDashboardSummary();

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: result.error === "User not authenticated" ? 401 : 500 }
        );
      }

      return NextResponse.json({ success: true, ...result.summary });
    } else {
      const result = await YouTubeAnalyticsService.getStoredAnalytics(days);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: result.error === "User not authenticated" ? 401 : 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        summary: result.summary,
      });
    }
  } catch (error) {
    console.error("Error in GET /api/youtube-analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Trigger analytics sync
export async function POST() {
  try {
    const result = await YouTubeAnalyticsService.syncAnalytics();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "User not authenticated" ? 401 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in POST /api/youtube-analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
