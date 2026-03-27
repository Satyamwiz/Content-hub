import fs from "fs";
import path from "path";
import os from "os";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { YouTubeTokenService } from "@/services/youtube-token.service";

export async function POST(req: NextRequest) {
  try {
    // Check if authenticated
    const hasTokens = await YouTubeTokenService.hasValidTokens();
    if (!hasTokens) {
      return NextResponse.json(
        { error: "Not authenticated with YouTube", authenticated: false },
        { status: 401 }
      );
    }

    // Get YouTube service from token service (handles token refresh automatically)
    const youtube = await YouTubeTokenService.getYouTubeService();

    // Parse the multipart form data
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { error: "Failed to parse form data" },
        { status: 400 }
      );
    }

    const videoFile = formData.get("video") as File | null;

    if (!videoFile) {
      console.log("No video file found in form data, using test file");
      // For prototype: use a temp file if no upload provided
      const tempDir = os.tmpdir();
      const mediaFile = path.join(tempDir, "generated_video.mp4");

      // Check if we need to create a dummy video file for testing
      if (!fs.existsSync(mediaFile)) {
        // Create an empty MP4 file (won't actually work with YouTube API, just for testing)
        const minimalMP4Header = Buffer.from([
          0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34,
          0x32, 0x00, 0x00, 0x00, 0x00, 0x6d, 0x70, 0x34, 0x32, 0x69, 0x73,
          0x6f, 0x6d,
        ]);
        fs.writeFileSync(mediaFile, minimalMP4Header);
      }

      // Use the existing file
      const videoStream = fs.createReadStream(mediaFile);
      const response = await youtube.videos.insert({
        part: ["snippet", "status"],
        requestBody: {
          snippet: {
            title: "Uploaded from Next.js 15 TS",
            description: "Test upload",
            tags: ["nextjs", "youtube", "api"],
            categoryId: "22",
          },
          status: { privacyStatus: "private" },
        },
        media: { body: videoStream },
      });

      return NextResponse.json({
        success: true,
        videoId: response.data.id,
        url: `https://www.youtube.com/watch?v=${response.data.id}`,
      });
    }

    // Get metadata from the form
    const title =
      (formData.get("title") as string) || "Uploaded from Next.js App";
    const description =
      (formData.get("description") as string) || "Video uploaded via API";
    const tagsString = formData.get("tags") as string;
    const tags = tagsString
      ? tagsString.split(",").map((tag) => tag.trim())
      : ["nextjs", "api"];
    const privacyStatus =
      (formData.get("privacyStatus") as string) || "private";

    // Convert File to buffer and stream
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // Mark the end of the stream

    // Upload to YouTube
    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description,
          tags,
          categoryId: "22", // Entertainment category
        },
        status: {
          privacyStatus: privacyStatus as "private" | "public" | "unlisted",
        },
      },
      media: {
        body: stream,
      },
    });

    return NextResponse.json({
      success: true,
      videoId: response.data.id,
      url: `https://www.youtube.com/watch?v=${response.data.id}`,
    });
  } catch (error) {
    console.error("YouTube upload error:", error);

    // Handle error
    const err = error as Error;
    const isAuthError =
      err.message?.includes("auth") ||
      err.message?.includes("Authentication") ||
      err.message?.includes("401");

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
        error: "Upload failed: " + (err.message || "Unknown error"),
        authenticated: !isAuthError,
        errorDetails: {
          message: err.message,
          isAuthError,
          stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        },
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
