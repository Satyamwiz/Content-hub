"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SchedulerCalendar } from "@/features/scheduler/components/scheduler-calendar";
import { ScheduledPostsList } from "@/features/scheduler/components/scheduled-posts-list";
import { NewPostModal } from "@/features/scheduler/components/new-post-modal";
import { TutorialButton } from "@/features/tutorial/tutorial-button";

export function PostScheduler() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduler</h1>
          <p className="text-muted-foreground">
            Plan and schedule your content calendar
          </p>
          <TutorialButton
            page="scheduler"
            label="Scheduler Tutorial"
            className="mt-1 h-auto p-0"
          />
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Scheduled Post
        </Button>
      </div>

      {/* Calendar View */}
      <SchedulerCalendar key={`calendar-${refreshKey}`} />

      {/* Scheduled Posts List */}
      <ScheduledPostsList key={`list-${refreshKey}`} />

      {/* New Post Modal */}
      <NewPostModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}
