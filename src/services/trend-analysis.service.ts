
/**
 * Trend Analysis Service
 * Provides insights into trending topics for various creative domains
 */

export type Domain =
  | "handloom"
  | "dancing"
  | "singing"
  | "painting"
  | "pottery"
  | "embroidery"
  | "woodwork"
  | "jewellery"
  | "metalwork"
  | "leatherwork"
  | "stonecraft"
  | "weaving"
  | "puppet_art"
  | "calligraphy"
  | "ceramics"
  | "paper_craft"
  | "folk_music"
  | "music"
  | "movie_songs"
  | "pop_music"
  | "indie_music";

export type Region = "IN" | "GLOBAL";

export interface TrendAnalysisRequest {
  domain: Domain;
  region: Region;
}

export interface TopVideo {
  videoId: string;
  title: string;
  channel: string;
  url: string;
  views: number;
  likes: number;
  subscribers: number;
  publishedAt: string;
  india_relevance_percent: number | null;
}

export interface TrendTopic {
  rank: number;
  topic: string;
  description: string;
  trend_score_percent: number;
  view_score_percent: number;
  india_relevance_percent: number | null;
  subscriber_score_percent: number;
  composite_score_percent: number;
  google_trends_percent: number | null;
  video_count: number;
  top_video: TopVideo;
}

export interface TrendAnalysisResponse {
  domain: Domain;
  region: Region;
  generated_at: string;
  top_topics: TrendTopic[];
  trending_hashtags: string[];
  metadata: {
    total_candidates_analyzed: number;
    results_returned: number;
    hashtags_count: number;
    data_sources: string[];
    timeframe: string;
  };
}

export interface TrendApiError {
  error: string;
  status?: number;
}

/**
 * Fetches trending topics for a specific domain and region
 */
export async function fetchTrendAnalysis(
  request: TrendAnalysisRequest
): Promise<TrendAnalysisResponse | TrendApiError> {
  const API_URL =
    "https://trend-insight-service-441399025512.europe-west1.run.app";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    return data as TrendAnalysisResponse;
  } catch (error) {
    console.error("Trend analysis API error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch trend analysis",
    };
  }
}

export const DOMAIN_LABELS: Record<Domain, string> = {
  handloom: "Fashion & Textiles",
  dancing: "Dance & Choreography",
  singing: "Vocals & Covers",
  painting: "Digital & Canvas Art",
  pottery: "Pottery & Clay Art",
  embroidery: "Needlework & DIY",
  woodwork: "Woodworking",
  jewellery: "Jewelry Design",
  metalwork: "Metalworking",
  leatherwork: "Leathercraft",
  stonecraft: "Sculpting",
  weaving: "Weaving & Knitting",
  puppet_art: "Animation & Puppetry",
  calligraphy: "Typography & Calligraphy",
  ceramics: "Ceramics",
  paper_craft: "Paper Crafting & Origami",
  folk_music: "Folk & Acoustic Music",
  music: "Music Production",
  movie_songs: "Soundtracks & Covers",
  pop_music: "Pop Music",
  indie_music: "Indie Music",
};

/**
 * Region display names for UI
 */
export const REGION_LABELS: Record<Region, string> = {
  IN: "India",
  GLOBAL: "Global",
};

/**
 * Domain categories for better organization in UI
 */
export const DOMAIN_CATEGORIES = {
  "Creative Arts & Hobbies": [
    "handloom",
    "pottery",
    "embroidery",
    "woodwork",
    "jewellery",
    "metalwork",
    "leatherwork",
    "stonecraft",
    "weaving",
    "ceramics",
    "paper_craft",
  ] as Domain[],
  "Performing Arts": ["dancing", "singing", "puppet_art", "folk_music"] as Domain[],
  "Visual Arts": ["painting", "calligraphy"] as Domain[],
  "Music & Entertainment": [
    "music",
    "movie_songs",
    "pop_music",
    "indie_music",
  ] as Domain[],
};

/**
 * Format view count for display
 */
export function formatViewCount(views: number): string {
  if (views >= 1_000_000_000) {
    return `${(views / 1_000_000_000).toFixed(1)}B`;
  }
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M`;
  }
  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K`;
  }
  return views.toString();
}

/**
 * Format trend score as percentage (for backward compatibility)
 */
export function formatScore(score: number): string {
  // If score is already a percentage (0-100), use as is
  if (score >= 1) {
    return `${Math.round(score)}%`;
  }
  // If score is a decimal (0-1), convert to percentage
  return `${Math.round(score * 100)}%`;
}