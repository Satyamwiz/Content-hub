import { NextRequest, NextResponse } from "next/server";
import { aiImageHelperService } from "@/services/ai-image-helper.service";
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

    const { prompt } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Generate image using AI service
    const result = await aiImageHelperService.generateImage({ prompt });

    if (!result.success || !result.imageBlob) {
      return NextResponse.json(
        { error: result.error || "Failed to generate image" },
        { status: 500 }
      );
    }

    // Convert blob to buffer for Cloudinary upload
    const arrayBuffer = await result.imageBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create data URL for Cloudinary
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${result.imageBlob.type};base64,${base64}`;

    // Generate filename
    const timestamp = Date.now();
    const fileName = `ai-image-${timestamp}.webp`;

    // Upload to Cloudinary and save to database
    const uploadResult = await MediaService.uploadAndSaveMedia(dataUrl, {
      fileName,
      originalName: fileName,
      mediaType: "IMAGE",
      prompt,
      metadata: {
        generatedAt: new Date().toISOString(),
        aiModel: "ai-image-service",
        originalMimeType: result.imageBlob.type,
        size: result.imageBlob.size,
      },
      cloudinaryFolder: "ai-images",
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || "Failed to save image" },
        { status: 500 }
      );
    }

    // Return both the blob URL for immediate display and the Cloudinary URL for persistence
    const blobUrl = aiImageHelperService.blobToObjectURL(result.imageBlob);

    return NextResponse.json({
      success: true,
      imageBlob: blobUrl,
      cloudinaryUrl: uploadResult.media?.cloudinaryUrl,
      mediaId: uploadResult.media?.id,
      message: "Image generated and saved successfully",
    });
  } catch (error) {
    console.error("Error in image generation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
