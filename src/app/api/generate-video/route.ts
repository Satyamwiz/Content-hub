import { NextRequest, NextResponse } from "next/server";
import { videoGenerationService } from "@/services/video-generation.service";
import { MediaService } from "@/services/media.service";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;

    if (!image || !prompt?.trim()) {
      return NextResponse.json(
        { error: "Image and prompt are required" },
        { status: 400 }
      );
    }

    // Generate video using AI service
    const result = await videoGenerationService.generateVideo({
      image,
      prompt,
    });

    if (!result.video_url) {
      return NextResponse.json(
        { error: "Video generation failed - no video URL returned" },
        { status: 500 }
      );
    }

    // Download the video from the generated URL
    const videoResponse = await fetch(result.video_url);

    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.status}`);
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    const buffer = Buffer.from(videoBuffer);

    // Create data URL for Cloudinary upload
    const base64 = buffer.toString("base64");
    const dataUrl = `data:video/mp4;base64,${base64}`;

    // Generate filename
    const timestamp = Date.now();
    const fileName = `ai-video-${timestamp}.mp4`;

    // Upload to Cloudinary and save to database
    const uploadResult = await MediaService.uploadAndSaveMedia(dataUrl, {
      fileName,
      originalName: fileName,
      mediaType: "VIDEO",
      prompt,
      metadata: {
        generatedAt: new Date().toISOString(),
        aiModel: "video-generation-service",
        originalVideoUrl: result.video_url,
        videoUri: result.video_uri,
        size: buffer.length,
        inputImageName: image.name,
        inputImageSize: image.size,
      },
      cloudinaryFolder: "ai-videos",
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || "Failed to save video" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      videoUrl: uploadResult.media?.cloudinaryUrl,
      originalVideoUrl: result.video_url, // Keep for backward compatibility
      mediaId: uploadResult.media?.id,
      prompt: result.prompt,
    });
  } catch (error) {
    console.error("Error in video generation API:", error);

    let errorMessage = "Internal server error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
