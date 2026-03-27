import { NextRequest, NextResponse } from "next/server";

const VIDEO_TRANSLATOR_ENDPOINT =
  "https://video-translator-441399025512.europe-west1.run.app";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");

    // Handle multipart form data (file upload)
    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();
      const videoFile = formData.get("video") as File | null;
      const imageFile = formData.get("image") as File | null;
      const language = formData.get("language") as string | null;

      if (!videoFile) {
        return NextResponse.json(
          { success: false, error: "No video file provided" },
          { status: 400 }
        );
      }

      if (!language) {
        return NextResponse.json(
          { success: false, error: "Target language is required" },
          { status: 400 }
        );
      }

      // Validate file types
      const allowedVideoTypes = [
        "video/mp4",
        "video/avi",
        "video/mov",
        "video/wmv",
        "video/flv",
        "video/webm",
        "video/mkv",
      ];

      if (!allowedVideoTypes.includes(videoFile.type)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid video format. Supported formats: MP4, AVI, MOV, WMV, FLV, WebM, MKV",
          },
          { status: 400 }
        );
      }

      if (imageFile) {
        const allowedImageTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedImageTypes.includes(imageFile.type)) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Invalid image format. Supported formats: JPEG, PNG, GIF, WebP",
            },
            { status: 400 }
          );
        }
      }

      // Validate file sizes
      const maxVideoSize = 500 * 1024 * 1024; // 500MB
      const maxImageSize = 10 * 1024 * 1024; // 10MB

      if (videoFile.size > maxVideoSize) {
        return NextResponse.json(
          {
            success: false,
            error: "Video file too large. Maximum size is 500MB.",
          },
          { status: 400 }
        );
      }

      if (imageFile && imageFile.size > maxImageSize) {
        return NextResponse.json(
          {
            success: false,
            error: "Image file too large. Maximum size is 10MB.",
          },
          { status: 400 }
        );
      }

      try {
        console.log("Forwarding video translation request:", {
          videoName: videoFile.name,
          videoSize: `${(videoFile.size / 1024 / 1024).toFixed(2)}MB`,
          imageName: imageFile?.name || "None",
          language,
        });

        // Create new form data to forward to the external API
        const externalFormData = new FormData();
        externalFormData.append("video", videoFile);
        if (imageFile) {
          externalFormData.append("image", imageFile);
        }
        externalFormData.append("language", language);

        // Forward the request to the external API
        const response = await fetch(VIDEO_TRANSLATOR_ENDPOINT, {
          method: "POST",
          body: externalFormData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("External API error:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });

          return NextResponse.json(
            {
              success: false,
              error: `Translation service error: ${response.status} ${response.statusText}`,
              details: errorText,
            },
            { status: 500 }
          );
        }

        // Check if response is a video file (direct download)
        const responseContentType = response.headers.get("content-type");

        if (responseContentType?.startsWith("video/")) {
          // Response is a video file, stream it back to the client
          const videoBuffer = await response.arrayBuffer();

          return new NextResponse(videoBuffer, {
            status: 200,
            headers: {
              "Content-Type": responseContentType,
              "Content-Disposition": `attachment; filename="translated_${language}_${videoFile.name}"`,
            },
          });
        }

        // Try to parse as JSON response
        try {
          const result = await response.json();
          return NextResponse.json(result);
        } catch (parseError) {
          // If not JSON, treat as successful binary response
          const videoBuffer = await response.arrayBuffer();

          return new NextResponse(videoBuffer, {
            status: 200,
            headers: {
              "Content-Type": "video/mp4", // Default to mp4
              "Content-Disposition": `attachment; filename="translated_${language}_${videoFile.name}"`,
            },
          });
        }
      } catch (error: any) {
        console.error("Error forwarding to translation service:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to process video translation request",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unsupported content type. Please use multipart/form-data.",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Video translation API error:", error);
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
