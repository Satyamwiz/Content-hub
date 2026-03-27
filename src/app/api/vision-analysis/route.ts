import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  analyzeImageFromUrl,
  analyzeImageFromBase64,
  fileToBase64,
} from "@/services/vision-ai.service";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");

    // Handle multipart form data (file upload)
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      const imageFile = formData.get("image") as File | null;

      if (!imageFile) {
        return NextResponse.json(
          { success: false, error: "No image file provided" },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
          },
          { status: 400 }
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (imageFile.size > maxSize) {
        return NextResponse.json(
          { success: false, error: "File too large. Maximum size is 10MB." },
          { status: 400 }
        );
      }

      try {
        // Convert file to base64 for Cloudinary upload
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64String = `data:${imageFile.type};base64,${buffer.toString(
          "base64"
        )}`;

        // Upload to Cloudinary first
        const uploadResult = await uploadToCloudinary(base64String, {
          folder: "vision_analysis",
          transformation: {
            quality: "auto",
            format: "auto",
          },
        });

        if (!uploadResult.success) {
          return NextResponse.json(
            {
              success: false,
              error: uploadResult.error || "Failed to upload image",
            },
            { status: 500 }
          );
        }

        // Analyze the image using the Cloudinary URL
        const analysisResult = await analyzeImageFromUrl(uploadResult.url!);

        if (!analysisResult.success) {
          return NextResponse.json(
            {
              success: false,
              error: (analysisResult as any).error || "Failed to analyze image",
              uploadedUrl: uploadResult.url, // Still return the uploaded URL for reference
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          uploadedUrl: uploadResult.url,
          cloudinaryPublicId: uploadResult.public_id,
          analysis: analysisResult,
        });
      } catch (error: any) {
        console.error("Error processing image upload:", error);
        return NextResponse.json(
          { success: false, error: "Failed to process image upload" },
          { status: 500 }
        );
      }
    }

    // Handle JSON requests (direct image URL or base64)
    if (contentType?.includes("application/json")) {
      const body = await request.json();

      if (body.image_url) {
        // Analyze from provided URL
        const analysisResult = await analyzeImageFromUrl(body.image_url);

        if (!analysisResult.success) {
          return NextResponse.json(
            {
              success: false,
              error: (analysisResult as any).error || "Failed to analyze image",
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          providedUrl: body.image_url,
          analysis: analysisResult,
        });
      }

      if (body.image_data) {
        // Analyze from base64 data
        const analysisResult = await analyzeImageFromBase64(body.image_data);

        if (!analysisResult.success) {
          return NextResponse.json(
            {
              success: false,
              error: (analysisResult as any).error || "Failed to analyze image",
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          analysis: analysisResult,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: "Either image_url or image_data must be provided",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Unsupported content type" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Vision analysis API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
