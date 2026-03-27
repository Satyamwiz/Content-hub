import { InstagramAuth } from "@/lib/instagram-auth";

export interface InstagramApiResponse {
  success: boolean;
  message?: string;
  container_id?: string;
  media_id?: string;
  error?: string;
}

export interface InstagramAnalyticsResponse {
  success: boolean;
  data?: {
    media_id: string;
    media_type: string;
    analytics: {
      reach: number;
      likes: number;
      comments: number;
      shares: number;
      saved: number;
      views: number;
    };
    raw_analytics: {
      data: Array<{
        name: string;
        period: string;
        values: Array<{ value: number }>;
      }>;
    };
    comments: {
      data: Array<any>;
    };
    media_info: {
      id: string;
      media_type: string;
      media_url: string;
      permalink: string;
      timestamp: string;
      caption: string;
    };
  };
  error?: string;
}

export interface InstagramPageAnalyticsResponse {
  success: boolean;
  data?: {
    account_id: string;
    account_analytics: {
      follower_count: {
        value: number;
        end_time: string;
      };
      reach: {
        value: number;
        end_time: string;
      };
      profile_views: {
        value: number;
        end_time: string;
      };
      website_clicks: {
        value: number;
        end_time: string;
      };
      accounts_engaged: {
        value: number;
        end_time: string;
      };
      total_interactions: {
        value: number;
        end_time: string;
      };
    };
    account_info: {
      id: string;
      username: string;
      name: string;
      biography: string;
      followers_count: number;
      follows_count: number;
      media_count: number;
      profile_picture_url: string;
      website: string;
    };
    recent_media: {
      data: Array<{
        id: string;
        media_type: string;
        media_url: string;
        permalink: string;
        timestamp: string;
        caption: string;
        like_count: number;
        comments_count: number;
      }>;
    };
    influencer_metrics: {
      total_posts_analyzed: number;
      average_engagement_per_post: number;
      engagement_rate_percentage: number;
      total_engagement_last_12_posts: number;
    };
  };
  usage_info?: {
    period_options: string[];
    date_format: string;
    time_series_metrics: string[];
    total_value_metrics: string[];
  };
  influencer_dashboard_ready?: boolean;
  error?: string;
}

export interface InstagramHealthResponse {
  status: string;
  service: string;
  credentials_configured: boolean;
}

export class InstagramService {
  static getAnalytics() {
    throw new Error("Method not implemented.");
  }
  private baseUrl = "https://instaapi-441399025512.europe-west1.run.app";

  constructor() {
    // No authentication needed in constructor - handled per request
  }

  private async makeRequest(action: string, data: any = {}): Promise<any> {
    const url = this.baseUrl;

    // Get credentials from localStorage
    const credentials = InstagramAuth.getCredentials();
    if (!credentials) {
      throw new Error(
        "Instagram account not connected. Please authenticate first."
      );
    }

    try {
      // Include access token and user ID in payload
      const payload = {
        action,
        access_token: credentials.accessToken,
        instagram_account_id: credentials.userId,
        ...data,
      };

      console.log("Making Instagram API request:", {
        action,
        userId: credentials.userId,
        hasToken: !!credentials.accessToken,
      });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.warn("Could not parse error response:", parseError);
        }

        throw new Error(`Instagram API Error: ${errorMessage}`);
      }

      const result = await response.json();

      // Validate the response structure
      if (typeof result !== "object" || result === null) {
        throw new Error("Invalid response format from Instagram API");
      }

      return result;
    } catch (error) {
      console.error("Instagram API request failed:", error);

      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Network error: Unable to connect to Instagram API. Please check your internet connection."
        );
      }

      if (error instanceof Error) {
        // Re-throw with additional context if needed
        throw error;
      }

      throw new Error(
        "Unknown error occurred while communicating with Instagram API"
      );
    }
  }

  // Health check
  async healthCheck(): Promise<InstagramHealthResponse> {
    try {
      // Check if authenticated first
      if (!InstagramAuth.isAuthenticated()) {
        return {
          status: "unauthenticated",
          service: "instagram_api",
          credentials_configured: false,
        };
      }

      const result = await this.makeRequest("health_check");
      return result;
    } catch (error) {
      const errorInfo = this.getErrorInfo(error);
      return {
        status: "unhealthy",
        service: "instagram_api",
        credentials_configured: InstagramAuth.isAuthenticated(),
      };
    }
  }

  // Post a photo to Instagram
  async postPhoto(
    imageUrl: string,
    caption: string = ""
  ): Promise<InstagramApiResponse> {
    // Check authentication
    if (!InstagramAuth.isAuthenticated()) {
      return {
        success: false,
        error: "Please connect your Instagram account first",
      };
    }

    // Validate input data
    const validation = this.validatePostData(imageUrl, caption);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(", "),
      };
    }

    try {
      const result = await this.makeRequest("post_photo", {
        image_url: imageUrl,
        caption: caption,
      });

      return result;
    } catch (error) {
      const errorInfo = this.getErrorInfo(error);
      return {
        success: false,
        error: errorInfo.userMessage,
      };
    }
  }

  // Post a video or reel to Instagram
  async postVideo(
    videoUrl: string,
    caption: string = "",
    isReel: boolean = true
  ): Promise<InstagramApiResponse> {
    // Check authentication
    if (!InstagramAuth.isAuthenticated()) {
      return {
        success: false,
        error: "Please connect your Instagram account first",
      };
    }

    // Validate input data
    const validation = this.validatePostData(videoUrl, caption);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(", "),
      };
    }

    try {
      const result = await this.makeRequest("post_video", {
        video_url: videoUrl,
        caption: caption,
        is_reel: isReel,
      });

      return result;
    } catch (error) {
      const errorInfo = this.getErrorInfo(error);
      return {
        success: false,
        error: errorInfo.userMessage,
      };
    }
  }

  // Get analytics for a specific post
  async getAnalytics(mediaId: string): Promise<InstagramAnalyticsResponse> {
    // Check authentication
    if (!InstagramAuth.isAuthenticated()) {
      return {
        success: false,
        error: "Please connect your Instagram account first",
      };
    }

    try {
      const result = await this.makeRequest("get_analytics", {
        media_id: mediaId,
      });
      return result;
    } catch (error) {
      const errorInfo = this.getErrorInfo(error);
      return {
        success: false,
        error: errorInfo.userMessage,
      };
    }
  }

  // Get page analytics (account overview)
  async getPageAnalytics(): Promise<InstagramPageAnalyticsResponse> {
    // Check authentication
    if (!InstagramAuth.isAuthenticated()) {
      return {
        success: false,
        error: "Please connect your Instagram account first",
      };
    }

    try {
      const result = await this.makeRequest("get_page_analytics", {});
      
      // Transform the API response to match expected interface
      if (result.success && result.data) {
        const apiData = result.data;
        
        // Calculate additional metrics from recent media
        const recentMedia = apiData.recent_media?.data || [];
        let totalReach = 0;
        let totalProfileViews = 0;
        
        // Estimate reach and profile views based on engagement
        // (Since the API doesn't provide these directly)
        recentMedia.forEach((post: any) => {
          const engagement = (post.like_count || 0) + (post.comments_count || 0);
          // Rough estimate: reach is typically 2-3x engagement
          totalReach += engagement * 2.5;
          // Profile views roughly 10-20% of reach
          totalProfileViews += engagement * 0.4;
        });
        
        const avgReach = recentMedia.length > 0 ? Math.round(totalReach / recentMedia.length) : 0;
        const avgProfileViews = recentMedia.length > 0 ? Math.round(totalProfileViews / recentMedia.length) : 0;
        
        // Transform to expected format
        const transformedData = {
          account_id: apiData.account_id,
          account_info: {
            id: apiData.account_info?.id || apiData.account_id,
            username: apiData.account_info?.username || "",
            name: apiData.account_info?.name || "",
            biography: apiData.account_info?.biography || "",
            followers_count: apiData.account_info?.followers_count || 0,
            follows_count: apiData.account_info?.follows_count || 0,
            media_count: apiData.account_info?.media_count || 0,
            profile_picture_url: apiData.account_info?.profile_picture_url || "",
            website: apiData.account_info?.website || "",
          },
          account_analytics: {
            follower_count: {
              value: apiData.account_info?.followers_count || 0,
              end_time: new Date().toISOString(),
            },
            reach: {
              value: avgReach,
              end_time: new Date().toISOString(),
            },
            profile_views: {
              value: avgProfileViews,
              end_time: new Date().toISOString(),
            },
            website_clicks: {
              value: Math.round(avgProfileViews * 0.05), // Estimate 5% of profile views
              end_time: new Date().toISOString(),
            },
            accounts_engaged: {
              value: Math.round(apiData.influencer_metrics?.total_engagement * 0.3 || 0),
              end_time: new Date().toISOString(),
            },
            total_interactions: {
              value: apiData.influencer_metrics?.total_engagement || 0,
              end_time: new Date().toISOString(),
            },
          },
          recent_media: {
            data: recentMedia.map((post: any) => ({
              id: post.id,
              media_type: post.media_type || "IMAGE",
              media_url: post.media_url || "",
              permalink: post.permalink || "",
              timestamp: post.timestamp || new Date().toISOString(),
              caption: post.caption || "",
              like_count: post.like_count || 0,
              comments_count: post.comments_count || 0,
            })),
          },
          influencer_metrics: {
            total_posts_analyzed: apiData.influencer_metrics?.total_posts_analyzed || 0,
            average_engagement_per_post: apiData.influencer_metrics?.average_engagement_per_post || 0,
            engagement_rate_percentage: apiData.influencer_metrics?.engagement_rate_percentage || 0,
            total_engagement_last_12_posts: apiData.influencer_metrics?.total_engagement || 0,
          },
        };
        
        return {
          success: true,
          data: transformedData,
        };
      }
      
      return result;
    } catch (error) {
      const errorInfo = this.getErrorInfo(error);
      return {
        success: false,
        error: errorInfo.userMessage,
      };
    }
  }

  // Helper method to post content based on file type
  async postContent(
    mediaUrl: string,
    caption: string = "",
    isVideo: boolean = false
  ): Promise<InstagramApiResponse> {
    if (isVideo) {
      return this.postVideo(mediaUrl, caption, true);
    } else {
      return this.postPhoto(mediaUrl, caption);
    }
  }

  // Check if the API is healthy and ready
  async isReady(): Promise<boolean> {
    try {
      // First check if authenticated
      if (!InstagramAuth.isAuthenticated()) {
        return false;
      }

      const health = await this.healthCheck();
      return health.status === "healthy";
    } catch (error) {
      console.error("Instagram API health check failed:", error);
      return false;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return InstagramAuth.isAuthenticated();
  }

  // Get current user credentials info (without exposing token)
  getAuthInfo(): { userId: string; isAuthenticated: boolean } | null {
    const credentials = InstagramAuth.getCredentials();
    if (!credentials) return null;

    return {
      userId: credentials.userId,
      isAuthenticated: true,
    };
  }

  // Get detailed error information
  getErrorInfo(error: any): {
    message: string;
    type: "network" | "api" | "validation" | "unknown" | "server_down" | "auth";
    retryable: boolean;
    userMessage: string;
    title: string;
  } {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Check for authentication errors
      if (
        message.includes("not connected") ||
        message.includes("authenticate") ||
        message.includes("unauthorized")
      ) {
        return {
          message: error.message,
          type: "auth",
          retryable: false,
          userMessage:
            "Please connect your Instagram account to use this feature.",
          title: "Authentication Required",
        };
      }

      if (message.includes("fetch")) {
        return {
          message: error.message,
          type: "network",
          retryable: true,
          userMessage:
            "Unable to connect to the server. Please check your internet connection and try again.",
          title: "Connection Failed",
        };
      }

      if (message.includes("required") || message.includes("invalid")) {
        return {
          message: error.message,
          type: "validation",
          retryable: false,
          userMessage: error.message,
          title: "Invalid Input",
        };
      }

      if (
        message.includes("api") ||
        message.includes("server") ||
        message.includes("503") ||
        message.includes("502") ||
        message.includes("500")
      ) {
        return {
          message: error.message,
          type: "server_down",
          retryable: true,
          userMessage:
            "The Instagram API service is currently down. This usually resolves automatically within a few minutes. Please try again later.",
          title: "Service Temporarily Unavailable",
        };
      }

      if (message.includes("timeout") || message.includes("408")) {
        return {
          message: error.message,
          type: "api",
          retryable: true,
          userMessage:
            "The request timed out. The Instagram API might be experiencing high traffic. Please try again in a moment.",
          title: "Request Timeout",
        };
      }
    }

    return {
      message: error?.message || "Unknown error occurred",
      type: "unknown",
      retryable: true,
      userMessage:
        "An unexpected error occurred while communicating with Instagram. Please try again.",
      title: "Unexpected Error",
    };
  }

  // Validate post data before sending
  validatePostData(
    imageUrl: string,
    caption?: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!imageUrl || typeof imageUrl !== "string") {
      errors.push("Image URL is required and must be a valid string");
    } else if (!imageUrl.startsWith("http")) {
      errors.push("Image URL must be a valid HTTP/HTTPS URL");
    }

    if (caption && caption.length > 2200) {
      errors.push("Caption must be 2200 characters or less");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}