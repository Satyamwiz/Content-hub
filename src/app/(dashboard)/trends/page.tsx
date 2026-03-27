
"use client";

import React, { useState } from "react";
import {
  Domain,
  Region,
  TrendAnalysisResponse,
  fetchTrendAnalysis,
} from "@/services/trend-analysis.service";
import { DomainSelector } from "@/features/trend-analysis/components/domain-selector";
import { TrendResults } from "@/features/trend-analysis/components/trend-results";
import { TrendLoadingSkeleton } from "@/features/trend-analysis/components/trend-loading-skeleton";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export default function TrendsPage() {
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region>("IN");
  const [trendData, setTrendData] = useState<TrendAnalysisResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!selectedDomain) return;

    setIsLoading(true);
    setError(null);
    setTrendData(null);

    try {
      const result = await fetchTrendAnalysis({
        domain: selectedDomain,
        region: selectedRegion,
      });

      if ("error" in result) {
        setError(result.error);
        toast.error("Failed to fetch trend analysis", {
          description: result.error,
        });
      } else {
        setTrendData(result);
        toast.success("Trend analysis completed successfully!", {
          description: `Found ${result.top_topics.length} trending topics and ${result.trending_hashtags?.length || 0} hashtags`,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error("Failed to fetch trend analysis", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <SectionHeading
          title="Trend Analysis"
          description="Discover trending topics and viral content opportunities across various creative domains"
        />
      </div>

      {/* Info Alert (Optional - uncomment if needed) */}
      <Alert className="border-primary/50 bg-primary/5">
        <Lightbulb className="h-4 w-4 text-primary" />
        <AlertTitle>Trend Insights Powered by AI</AlertTitle>
        <AlertDescription>
          Get real-time insights into trending topics using Google Trends and YouTube data. 
          Analyze what&apos;s popular in your field, discover viral content opportunities, 
          and get trending hashtags based on top-performing videos with millions of views.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Domain Selection */}
        <div className="lg:col-span-1">
          <DomainSelector
            selectedDomain={selectedDomain}
            selectedRegion={selectedRegion}
            onDomainChangeAction={setSelectedDomain}
            onRegionChangeAction={setSelectedRegion}
            onAnalyzeAction={handleAnalyze}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && <TrendLoadingSkeleton />}

          {trendData && !isLoading && <TrendResults data={trendData} />}

          {!trendData && !isLoading && !error && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Ready to Analyze Trends?
                </h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Select a domain and region from the sidebar, then click
                  &quot;Analyze Trends&quot; to discover what&apos;s trending in
                  your chosen field.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground mt-4">
                  <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">10+</div>
                    <div>Trending Topics</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">15+</div>
                    <div>Hashtags</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">100%</div>
                    <div>Real-time Data</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Additional Info Section */}
      {trendData && trendData.metadata && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {trendData.metadata.total_candidates_analyzed}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Candidates Analyzed
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {trendData.metadata.results_returned}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Top Results
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {trendData.metadata.hashtags_count}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Trending Hashtags
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}