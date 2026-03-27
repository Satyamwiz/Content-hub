const VIDEO_TRANSLATOR_ENDPOINT =
  "https://video-translator-441399025512.europe-west1.run.app";

export interface SupportedLanguages {
  indian: {
    value: string;
    label: string;
  }[];
  foreign: {
    value: string;
    label: string;
  }[];
}

// Categorized list of supported languages
export const SUPPORTED_LANGUAGES: SupportedLanguages = {
  indian: [
    { value: "bengali", label: "Bengali" },
    { value: "gujarati", label: "Gujarati" },
    { value: "hindi", label: "Hindi" },
    { value: "kannada", label: "Kannada" },
    { value: "malayalam", label: "Malayalam" },
    { value: "marathi", label: "Marathi" },
    { value: "tamil", label: "Tamil" },
    { value: "telugu", label: "Telugu" },
  ],
  foreign: [
    { value: "afrikaans", label: "Afrikaans" },
    { value: "arabic", label: "Arabic" },
    { value: "basque", label: "Basque" },
    { value: "bulgarian", label: "Bulgarian" },
    { value: "catalan", label: "Catalan" },
    { value: "chinese", label: "Chinese" },
    { value: "czech", label: "Czech" },
    { value: "danish", label: "Danish" },
    { value: "dutch", label: "Dutch" },
    { value: "english", label: "English" },
    { value: "finnish", label: "Finnish" },
    { value: "filipino", label: "Filipino" },
    { value: "french", label: "French" },
    { value: "galician", label: "Galician" },
    { value: "german", label: "German" },
    { value: "greek", label: "Greek" },
    { value: "hebrew", label: "Hebrew" },
    { value: "hungarian", label: "Hungarian" },
    { value: "icelandic", label: "Icelandic" },
    { value: "indonesian", label: "Indonesian" },
    { value: "italian", label: "Italian" },
    { value: "japanese", label: "Japanese" },
    { value: "korean", label: "Korean" },
    { value: "latvian", label: "Latvian" },
    { value: "lithuanian", label: "Lithuanian" },
    { value: "malay", label: "Malay" },
    { value: "norwegian", label: "Norwegian" },
    { value: "polish", label: "Polish" },
    { value: "portuguese", label: "Portuguese" },
    { value: "romanian", label: "Romanian" },
    { value: "russian", label: "Russian" },
    { value: "serbian", label: "Serbian" },
    { value: "slovak", label: "Slovak" },
    { value: "slovenian", label: "Slovenian" },
    { value: "spanish", label: "Spanish" },
    { value: "swedish", label: "Swedish" },
    { value: "thai", label: "Thai" },
    { value: "turkish", label: "Turkish" },
    { value: "ukrainian", label: "Ukrainian" },
    { value: "vietnamese", label: "Vietnamese" },
  ],
};

export interface VideoTranslationRequest {
  video: File;
  image?: File;
  language: string;
}

export interface VideoTranslationResponse {
  success: boolean;
  videoUrl?: string;
  message?: string;
  error?: string;
}

export interface VideoTranslationError {
  success: false;
  error: string;
  details?: any;
}

/**
 * Translate a video to the specified language
 * @param request - Video file, optional image, and target language
 * @returns Promise with translated video URL or error
 */
export async function translateVideo(
  request: VideoTranslationRequest
): Promise<VideoTranslationResponse | VideoTranslationError> {
  try {
    // Validate input
    if (!request.video) {
      return {
        success: false,
        error: "Video file is required",
      };
    }

    if (!request.language) {
      return {
        success: false,
        error: "Target language is required",
      };
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

    if (!allowedVideoTypes.includes(request.video.type)) {
      return {
        success: false,
        error:
          "Invalid video format. Supported formats: MP4, AVI, MOV, WMV, FLV, WebM, MKV",
      };
    }

    if (request.image) {
      const allowedImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedImageTypes.includes(request.image.type)) {
        return {
          success: false,
          error:
            "Invalid image format. Supported formats: JPEG, PNG, GIF, WebP",
        };
      }
    }

    // Validate file sizes
    const maxVideoSize = 500 * 1024 * 1024; // 500MB
    const maxImageSize = 10 * 1024 * 1024; // 10MB

    if (request.video.size > maxVideoSize) {
      return {
        success: false,
        error: "Video file too large. Maximum size is 500MB.",
      };
    }

    if (request.image && request.image.size > maxImageSize) {
      return {
        success: false,
        error: "Image file too large. Maximum size is 10MB.",
      };
    }

    // Validate language
    const allLanguages = [
      ...SUPPORTED_LANGUAGES.indian,
      ...SUPPORTED_LANGUAGES.foreign,
    ];
    const isValidLanguage = allLanguages.some(
      (lang) => lang.value === request.language
    );

    if (!isValidLanguage) {
      return {
        success: false,
        error: `Unsupported language: ${request.language}`,
      };
    }

    console.log("Sending video translation request:", {
      videoName: request.video.name,
      videoSize: `${(request.video.size / 1024 / 1024).toFixed(2)}MB`,
      imageName: request.image?.name || "None",
      targetLanguage: request.language,
    });

    // Create form data
    const formData = new FormData();
    formData.append("video", request.video);
    if (request.image) {
      formData.append("image", request.image);
    }
    formData.append("language", request.language);

    // Make API request to our Next.js API route
    const response = await fetch("/api/video-translation", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Video translation API error:", {
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

    // Check if response is a video file (direct download)
    const contentType = response.headers.get("content-type");

    if (contentType?.startsWith("video/")) {
      // Response is a video file, create a blob URL
      const videoBlob = await response.blob();
      const videoUrl = URL.createObjectURL(videoBlob);

      return {
        success: true,
        videoUrl,
        message: "Video translated successfully",
      };
    }

    // Try to parse as JSON response
    try {
      const result = await response.json();

      if (result.success === false) {
        return {
          success: false,
          error: result.error || "Translation failed",
          details: result,
        };
      }

      return {
        success: true,
        videoUrl: result.videoUrl || result.video_url,
        message: result.message || "Video translated successfully",
      };
    } catch (parseError) {
      // If not JSON, treat as successful binary response
      const videoBlob = await response.blob();
      const videoUrl = URL.createObjectURL(videoBlob);

      return {
        success: true,
        videoUrl,
        message: "Video translated successfully",
      };
    }
  } catch (error: any) {
    console.error("Video translation service error:", error);
    return {
      success: false,
      error: error.message || "Failed to translate video",
      details: error,
    };
  }
}

/**
 * Get language label by value
 */
export function getLanguageLabel(value: string): string {
  const allLanguages = [
    ...SUPPORTED_LANGUAGES.indian,
    ...SUPPORTED_LANGUAGES.foreign,
  ];
  const language = allLanguages.find((lang) => lang.value === value);
  return language?.label || value;
}

/**
 * Check if language is Indian
 */
export function isIndianLanguage(value: string): boolean {
  return SUPPORTED_LANGUAGES.indian.some((lang) => lang.value === value);
}
