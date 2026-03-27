import { NextRequest, NextResponse } from "next/server";
import { MediaService } from "@/services/media.service";

export async function GET() {
  try {
    const result = await MediaService.getUserMedia();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "User not authenticated" ? 401 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      media: result.media,
    });
  } catch (error) {
    console.error("Error in GET /api/media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("id");

    if (!mediaId) {
      return NextResponse.json(
        { error: "Media ID is required" },
        { status: 400 }
      );
    }

    const result = await MediaService.deleteMedia(mediaId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "User not authenticated" ? 401 : 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/media:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
