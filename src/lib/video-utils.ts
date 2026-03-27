/**
 * Utility functions for video handling
 */

export const downloadVideoFromUrl = async (
  videoUrl: string,
  filename?: string
): Promise<void> => {
  try {
    // For external URLs, we'll create a link that opens in a new tab
    // Direct download might be blocked by CORS
    const link = document.createElement("a");
    link.href = videoUrl;
    link.target = "_blank";
    link.download = filename || `ai-video-${Date.now()}.mp4`;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download video:", error);
    // Fallback: open in new tab
    window.open(videoUrl, "_blank");
  }
};

export const isValidVideoUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

export const getVideoThumbnail = (videoUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.addEventListener("loadedmetadata", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      video.currentTime = 1; // Get frame at 1 second
    });

    video.addEventListener("seeked", () => {
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const thumbnail = canvas.toDataURL("image/jpeg", 0.8);
        resolve(thumbnail);
      } else {
        reject(new Error("Could not get canvas context"));
      }
    });

    video.addEventListener("error", (e) => {
      reject(new Error("Failed to load video for thumbnail"));
    });

    video.crossOrigin = "anonymous";
    video.src = videoUrl;
  });
};
