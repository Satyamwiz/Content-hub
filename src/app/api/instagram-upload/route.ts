import { NextRequest, NextResponse } from "next/server";
import cloudinary, { uploadToCloudinary } from "@/lib/cloudinary";

// Function to handle image uploads for Instagram using Cloudinary
async function handleImageUpload(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return { success: false, error: "No image file provided" };
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
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
      };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return { success: false, error: "File too large. Maximum size is 10MB." };
    }

    // Upload to Cloudinary
    console.log("Uploading to Cloudinary:", {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size,
    });

    try {
      // Convert file to base64 for Cloudinary upload
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64String = `data:${imageFile.type};base64,${buffer.toString(
        "base64"
      )}`;

      // Upload to Cloudinary using the centralized helper
      const uploadResult = await uploadToCloudinary(base64String, {
        folder: "instagram_uploads",
        transformation: {
          width: 1080,
          height: 1080,
          crop: "limit",
          quality: "auto",
        },
      });

      if (!uploadResult.success) {
        console.error("Cloudinary upload error:", uploadResult.error);
        return {
          success: false,
          error:
            uploadResult.error ||
            "Failed to upload to Cloudinary. Please check your Cloudinary configuration.",
        };
      }

      console.log(
        "Image uploaded to Cloudinary successfully:",
        uploadResult.url
      );
      return { success: true, url: uploadResult.url };
    } catch (cloudinaryError) {
      console.error("Cloudinary upload error:", cloudinaryError);
      return {
        success: false,
        error:
          "Failed to upload to Cloudinary. Please check your Cloudinary configuration.",
      };
    }
  } catch (error) {
    console.error("Image upload error:", error);
    return { success: false, error: "Failed to upload image" };
  }
}

export async function POST(req: NextRequest) {
  console.log("Instagram Upload API called");

  try {
    // Parse the multipart form data
    console.log("Parsing form data");
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { error: "Failed to parse form data" },
        { status: 400 }
      );
    }

    // Check if this is an image upload for Instagram
    const imageFile = formData.get("image") as File | null;
    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    console.log("Processing image upload for Instagram");

    // Check if Cloudinary is configured
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        {
          error:
            "Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
        },
        { status: 500 }
      );
    }

    const result = await handleImageUpload(formData);
    if (result.success && result.url) {
      return NextResponse.json({
        success: true,
        url: result.url,
        type: "image",
        message: "Image uploaded successfully",
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Image upload failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Instagram upload error:", error);

    return NextResponse.json(
      {
        error:
          "Upload failed: " + ((error as Error).message || "Unknown error"),
      },
      { status: 500 }
    );
  }
}
