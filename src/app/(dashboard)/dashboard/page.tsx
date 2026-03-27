import React from "react";
import { DashboardActions } from "@/features/dashboard/components/dashboard-actions";
import { YouTubeAnalytics } from "@/features/dashboard/components/youtube-analytics";
import { InstagramAnalytics } from "@/features/dashboard/components/instagram-analytics";
import { TwitterDashboardPublisher } from "@/features/twitter/components/twitter-dashboard-publisher";
import { SectionHeading } from "@/components/shared/section-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TutorialButton } from "@/features/tutorial/tutorial-button";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header Section with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <SectionHeading
            title="Dashboard"
            description="Overview of your social media performance"
          />
          <TutorialButton
            page="dashboard"
            label="Dashboard Tutorial"
            variant="link"
            size="sm"
            className="mt-1 h-auto p-0"
          />
        </div>
        <DashboardActions />
      </div>

      {/* Platform Tabs */}
      <Tabs defaultValue="youtube" className="w-full">
        <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-3">
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
        </TabsList>

        <TabsContent value="youtube" className="mt-6">
          {/* YouTube Analytics */}
          <div className="flex justify-end mb-2">
            <TutorialButton page="youtube" label="YouTube Guide" size="sm" />
          </div>
          <YouTubeAnalytics />
        </TabsContent>

        <TabsContent value="instagram" className="mt-6">
          {/* Instagram Analytics */}
          <div className="flex justify-end mb-2">
            <TutorialButton
              page="instagram"
              label="Instagram Guide"
              size="sm"
            />
          </div>
          <InstagramAnalytics />
        </TabsContent>

        <TabsContent value="twitter" className="mt-6">
          {/* Twitter Publisher */}
          <div className="flex justify-end mb-2">
            <TutorialButton
              page="twitter"
              label="Twitter Guide"
              size="sm"
            />
          </div>
          <TwitterDashboardPublisher />
        </TabsContent>
      </Tabs>
    </div>
  );
}
