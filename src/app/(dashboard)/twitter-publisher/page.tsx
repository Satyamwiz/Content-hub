import React from "react";
import { TwitterPublisher } from "@/features/twitter/components/twitter-publisher";
import { SectionHeading } from "@/components/shared/section-heading";
import { TutorialButton } from "@/features/tutorial/tutorial-button";

export default function TwitterPublisherPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <SectionHeading
          title="Twitter Publisher"
          description="Compose and publish tweets directly to Twitter"
        />
        <TutorialButton
          page="twitter"
          label="Twitter Publishing Tutorial"
          variant="link"
          size="sm"
          className="mt-1 h-auto p-0"
        />
      </div>
      <TwitterPublisher />
    </div>
  );
}