import { useState, useEffect, useCallback } from "react";

interface UseYouTubeAnalyticsOptions {
  days?: number;
  autoSync?: boolean;
  syncInterval?: number; // in minutes
}

interface YouTubeAnalyticsData {
  date: Date;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  subscribersGained: number;
  subscribersLost: number;
  watchTimeMinutes: number;
  averageViewDuration: number;
  impressions: number;
  clickThroughRate: number;
}

interface AnalyticsSummary {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalSubscribersGained: number;
  totalWatchTimeHours: number;
  averageEngagementRate: number;
  dataPoints: number;
  dateRange: {
    from: Date;
    to: Date;
  };
}

interface DashboardSummary {
  last7Days: AnalyticsSummary;
  last30Days: AnalyticsSummary;
  growth: {
    views: number;
    subscribers: number;
    engagement: number;
  };
}

export function useYouTubeAnalytics(options: UseYouTubeAnalyticsOptions = {}) {
  const { days = 30, autoSync = false, syncInterval = 60 } = options;

  const [data, setData] = useState<YouTubeAnalyticsData[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Fetch analytics data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/youtube-analytics?days=${days}`);
      const result = await response.json();

      if (result.success) {
        // Convert date strings to Date objects
        const formattedData =
          result.data?.map((item: any) => ({
            ...item,
            date: new Date(item.date),
          })) || [];

        setData(formattedData);
        setSummary(result.summary);
      } else {
        setError(result.error || "Failed to fetch analytics data");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Error fetching YouTube analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  // Fetch dashboard summary
  const fetchDashboardSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/youtube-analytics?summary=true");
      const result = await response.json();

      if (result.success !== false) {
        setDashboardSummary(result);
      }
    } catch (err) {
      console.error("Error fetching dashboard summary:", err);
    }
  }, []);

  // Sync analytics data from YouTube API
  const syncData = useCallback(async () => {
    try {
      setSyncing(true);
      setError(null);

      const response = await fetch("/api/youtube-analytics", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setLastSync(new Date());
        // Refresh data after successful sync
        await fetchData();
        await fetchDashboardSummary();
        return { success: true, message: result.message };
      } else {
        setError(result.error || "Failed to sync analytics data");
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = "Network error during sync";
      setError(errorMsg);
      console.error("Error syncing YouTube analytics:", err);
      return { success: false, error: errorMsg };
    } finally {
      setSyncing(false);
    }
  }, [fetchData, fetchDashboardSummary]);

  // Check if sync is needed (based on last sync time)
  const isSyncNeeded = useCallback(() => {
    if (!lastSync) return true;
    const now = new Date();
    const timeDiff = now.getTime() - lastSync.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    return minutesDiff >= syncInterval;
  }, [lastSync, syncInterval]);

  // Auto sync effect
  useEffect(() => {
    if (autoSync && isSyncNeeded()) {
      syncData();
    }
  }, [autoSync, isSyncNeeded, syncData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
    fetchDashboardSummary();
  }, [fetchData, fetchDashboardSummary]);

  // Periodic sync interval
  useEffect(() => {
    if (autoSync && syncInterval > 0) {
      const interval = setInterval(() => {
        if (isSyncNeeded()) {
          syncData();
        }
      }, syncInterval * 60 * 1000); // Convert minutes to milliseconds

      return () => clearInterval(interval);
    }
  }, [autoSync, syncInterval, isSyncNeeded, syncData]);

  return {
    // Data
    data,
    summary,
    dashboardSummary,

    // State
    loading,
    syncing,
    error,
    lastSync,

    // Actions
    fetchData,
    fetchDashboardSummary,
    syncData,
    refresh: () => {
      fetchData();
      fetchDashboardSummary();
    },

    // Utilities
    isSyncNeeded,
    formatNumber: (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    },
  };
}
