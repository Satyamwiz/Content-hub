import { NextResponse } from "next/server";
import { MediaService } from "@/services/media.service";

export async function GET() {
  try {
    const result = await MediaService.getMediaStats();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "User not authenticated" ? 401 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: result.stats,
    });
  } catch (error) {
    console.error("Error in GET /api/media/stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
