// Vision AI API Service
const VISION_AI_ENDPOINT = "https://visionai-441399025512.europe-west1.run.app";

export interface VisionAnalysisRequest {
  image_data?: string; // base64 encoded image
  image_url?: string; // Cloudinary URL
}

export interface ColorInfo {
  rgb: string;
  hex: string;
  percentage: number;
}

export interface VisionAnalysisResponse {
  success: boolean;
  analysis: {
    labels: string[];
    objects: string[];
    colors: ColorInfo[];
    text: string;
  };
  insights: {
    summary: string;
    craft: string;
    marketing_copy: string;
    hashtags: string[];
    audience: string[];
    advice: string;
  };
}

export interface VisionApiError {
  success: false;
  error: string;
  details?: any;
}

/**
 * Analyze an image using the Vision AI API
 * @param request - Either base64 image data or Cloudinary URL
 * @returns Promise with analysis results
 */
export async function analyzeImage(
  request: VisionAnalysisRequest
): Promise<VisionAnalysisResponse | VisionApiError> {
  try {
    // Validate input
    if (!request.image_data && !request.image_url) {
      return {
        success: false,
        error: "Either image_data or image_url must be provided",
      };
    }

    if (request.image_data && request.image_url) {
      return {
        success: false,
        error: "Provide either image_data or image_url, not both",
      };
    }

    console.log("Sending request to Vision AI API:", {
      hasImageData: !!request.image_data,
      hasImageUrl: !!request.image_url,
      imageUrlPreview: request.image_url
        ? request.image_url.substring(0, 100) + "..."
        : undefined,
    });

    const response = await fetch(VISION_AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Vision AI API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      return {
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}`,
        details: errorText,
      };
    }

    const result = await response.json();

    // Validate response structure
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Analysis failed",
        details: result,
      };
    }

    return result as VisionAnalysisResponse;
  } catch (error: any) {
    console.error("Vision AI service error:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze image",
      details: error,
    };
  }
}

/**
 * Analyze image from Cloudinary URL
 * @param cloudinaryUrl - The Cloudinary image URL
 * @returns Promise with analysis results
 */
export async function analyzeImageFromUrl(
  cloudinaryUrl: string
): Promise<VisionAnalysisResponse | VisionApiError> {
  return analyzeImage({ image_url: cloudinaryUrl });
}

/**
 * Analyze image from base64 data
 * @param base64Data - Base64 encoded image data
 * @returns Promise with analysis results
 */
export async function analyzeImageFromBase64(
  base64Data: string
): Promise<VisionAnalysisResponse | VisionApiError> {
  return analyzeImage({ image_data: base64Data });
}

/**
 * Convert File to base64 for Vision AI analysis
 * @param file - Image file
 * @returns Promise with base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 data without the data URL prefix
      const base64Data = result.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
