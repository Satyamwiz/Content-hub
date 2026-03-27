import { NextRequest, NextResponse } from "next/server";
import { TwitterTokenDbService } from "@/services/twitter-token-db.service";
import { TwitterService } from "@/services/twitter.service";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { mediaUrl } = body;

    if (!mediaUrl) {
      return NextResponse.json(
        { error: "Media URL is required" },
        { status: 400 }
      );
    }

    const tokens = await TwitterTokenDbService.refreshTokensIfNeeded(userId);

    if (!tokens) {
      return NextResponse.json(
        { error: "Twitter not authenticated" },
        { status: 401 }
      );
    }

    const twitterService = new TwitterService(tokens);

    let contentType = "";
    try {
      console.log(
        "🧪 Testing media upload for URL:",
        mediaUrl.substring(0, 50) + "..."
      );

      let mediaBuffer: Buffer;

      if (mediaUrl.startsWith("data:")) {
        // Handle data URLs (base64 encoded)
        const matches = mediaUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          throw new Error("Invalid data URL format");
        }

        contentType = matches[1];
        const base64Data = matches[2];
        mediaBuffer = Buffer.from(base64Data, "base64");
        console.log(
          "📊 Data URL decoded, size:",
          mediaBuffer.length,
          "type:",
          contentType
        );
      } else {
        // Handle regular URLs
        const response = await fetch(mediaUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch media: ${response.statusText}`);
        }

        mediaBuffer = Buffer.from(await response.arrayBuffer());
        contentType = response.headers.get("content-type") || "";
        console.log(
          "📊 Media fetched, size:",
          mediaBuffer.length,
          "type:",
          contentType
        );
      }

      // Determine media type
      const mediaType = contentType.startsWith("video/") ? "video" : "image";

      // Test upload
      const mediaId = await twitterService.uploadMedia(
        mediaBuffer,
        mediaType
        // contentType
      );

      return NextResponse.json({
        success: true,
        mediaId,
        mediaType,
        contentType,
        size: mediaBuffer.length,
        message: "Media upload test successful!",
      });
    } catch (uploadError: any) {
      console.error("Media upload test failed:", uploadError);

      return NextResponse.json(
        {
          success: false,
          error: uploadError.message || "Media upload test failed",
          code: uploadError.code,
          details: {
            mediaType: contentType.startsWith("video/") ? "video" : "image",
            contentType,
          },
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Media test error:", error);

    return NextResponse.json(
      { error: error.message || "Media test failed" },
      { status: 500 }
    );
  }
}
