import React from "react";
import { InstagramPublisher } from "@/features/instagram-publisher/instagram-publisher";
import { TwitterPublisher } from "@/features/twitter/components/twitter-publisher";
import { SectionHeading } from "@/components/shared/section-heading";
import { TutorialButton } from "@/features/tutorial/tutorial-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SocialPublisherPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <SectionHeading
          title="Social Publisher"
          description="Publish content directly to Instagram and Twitter"
        />
        <TutorialButton
          page="instagram"
          label="Social Publishing Tutorial"
          variant="link"
          size="sm"
          className="mt-1 h-auto p-0"
        />
      </div>

      <Tabs defaultValue="instagram" className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
        </TabsList>

        <TabsContent value="instagram" className="mt-6">
          <InstagramPublisher />
        </TabsContent>

        <TabsContent value="twitter" className="mt-6">
          <TwitterPublisher />
        </TabsContent>
      </Tabs>
    </div>
  );
}
