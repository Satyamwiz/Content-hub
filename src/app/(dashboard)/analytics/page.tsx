"use client";

import React from "react";
import { YouTubeAnalyticsDashboard } from "@/features/dashboard/components/youtube-analytics-dashboard";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Youtube, BarChart3, Clock } from "lucide-react";

export default function YouTubeAnalyticsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <SectionHeading
          title="YouTube Analytics Dashboard"
          description="Comprehensive insights into your YouTube channel performance and engagement metrics"
        />
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This dashboard stores and displays your YouTube analytics data for up
          to 30 days. Click &quot;Sync Data&quot; to fetch the latest analytics
          from your connected YouTube channel.
        </AlertDescription>
      </Alert>

      {/* Feature Overview */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg">Real-time Sync</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Automatically fetch and store your YouTube analytics data with a
              single click. Data is safely stored in your database for
              historical analysis.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Interactive Charts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Visualize your performance with beautiful, interactive charts
              showing views, engagement, subscriber growth, and watch time
              trends.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Monthly Storage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Keep track of your channel&apos;s growth with up to 30 days of
              stored analytics data. Monitor trends and optimize your content
              strategy.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <YouTubeAnalyticsDashboard />
    </div>
  );
}
