import { v2 as cloudinary } from "cloudinary";

// Validate environment variables
const requiredEnvVars = {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(
    `Missing Cloudinary environment variables: ${missingVars.join(", ")}`
  );
  console.error("Please add these variables to your .env file:");
  missingVars.forEach((varName) => {
    console.error(
      `${varName}=your_${varName.toLowerCase().replace("cloudinary_", "")}_here`
    );
  });
}

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to upload image to Cloudinary
export async function uploadToCloudinary(
  imageData: string | Buffer,
  options: {
    folder?: string;
    transformation?: any;
    format?: string;
  } = {}
): Promise<{
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
}> {
  try {
    // Check if Cloudinary is properly configured
    if (missingVars.length > 0) {
      return {
        success: false,
        error: `Cloudinary not configured. Missing environment variables: ${missingVars.join(
          ", "
        )}. Please add them to your .env file.`,
      };
    }

    const uploadOptions = {
      folder: options.folder || "uploads",
      transformation: options.transformation || {},
      format: options.format,
    };

    const result = await cloudinary.uploader.upload(
      imageData as string,
      uploadOptions
    );

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);

    // Provide more specific error messages
    if (error.message?.includes("Must supply api_key")) {
      return {
        success: false,
        error:
          "Cloudinary API key is missing. Please set CLOUDINARY_API_KEY in your .env file.",
      };
    }

    if (error.message?.includes("Must supply cloud_name")) {
      return {
        success: false,
        error:
          "Cloudinary cloud name is missing. Please set CLOUDINARY_CLOUD_NAME in your .env file.",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to upload to Cloudinary",
    };
  }
}

// Helper function to upload video to Cloudinary
export async function uploadVideoToCloudinary(
  videoData: string | Buffer,
  options: {
    folder?: string;
    transformation?: any;
    format?: string;
  } = {}
): Promise<{
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
}> {
  try {
    // Check if Cloudinary is properly configured
    if (missingVars.length > 0) {
      return {
        success: false,
        error: `Cloudinary not configured. Missing environment variables: ${missingVars.join(
          ", "
        )}. Please add them to your .env file.`,
      };
    }

    const uploadOptions = {
      folder: options.folder || "videos",
      resource_type: "video" as const,
      transformation: options.transformation || {},
      format: options.format || "mp4",
    };

    const result = await cloudinary.uploader.upload(
      videoData as string,
      uploadOptions
    );

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: any) {
    console.error("Cloudinary video upload error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload video to Cloudinary",
    };
  }
}

// Helper function to get optimized image URL
export function getOptimizedImageUrl(
  publicId: string,
  transformations: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    width: transformations.width,
    height: transformations.height,
    quality: transformations.quality || "auto",
    format: transformations.format || "auto",
    fetch_format: "auto",
  });
}

// Helper function to get optimized video URL
export function getOptimizedVideoUrl(
  publicId: string,
  transformations: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
): string {
  return cloudinary.url(publicId, {
    resource_type: "video",
    width: transformations.width,
    height: transformations.height,
    quality: transformations.quality || "auto",
    format: transformations.format || "mp4",
  });
}
