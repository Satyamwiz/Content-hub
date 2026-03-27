"use client";

import { TutorialPage } from "./tutorial-store";

export interface TutorialStep {
  title: string;
  content: string;
  elementSelector?: string; // CSS selector for the element to highlight
  placement?: "top" | "right" | "bottom" | "left" | "center"; // where to position the tooltip
  action?: string; // text for an action button, e.g., "Try it"
}

// Define tutorial steps for each page
export const tutorialSteps: Record<TutorialPage, TutorialStep[]> = {
  dashboard: [
    {
      title: "Welcome to Your Dashboard",
      content:
        "This is your main dashboard where you can see all your content performance at a glance.",
      placement: "center",
    },
    {
      title: "YouTube & Instagram Tabs",
      content:
        "Switch between YouTube and Instagram analytics to monitor your social media performance.",
      elementSelector: "[data-value='youtube'], [data-value='instagram']",
      placement: "bottom",
    },
    {
      title: "Create Content",
      content:
        "Start creating new content or upload videos directly to YouTube from here.",
      elementSelector: ".dashboard-actions button",
      placement: "left",
    },
  ],

  youtube: [
    {
      title: "YouTube Analytics",
      content:
        "Track your YouTube channel performance, view counts, and subscriber growth.",
      placement: "center",
    },
    {
      title: "Video Upload",
      content:
        "Click the 'Upload' tab to upload new videos directly to your YouTube channel.",
      elementSelector: "[data-value='upload']",
      placement: "bottom",
      action: "Try it",
    },
    {
      title: "Performance Metrics",
      content:
        "View detailed analytics about your videos and channel growth over time.",
      elementSelector: ".grid",
      placement: "top",
    },
  ],

  instagram: [
    {
      title: "Instagram Analytics",
      content:
        "Monitor your Instagram account performance, engagement, and follower growth.",
      placement: "center",
    },
    {
      title: "Content Calendar",
      content:
        "See your planned and published Instagram posts organized by date.",
      elementSelector: "[data-value='calendar']",
      placement: "top",
    },
    {
      title: "Post Performance",
      content:
        "Review how your Instagram posts are performing with detailed metrics.",
      elementSelector: "[data-value='performance']",
      placement: "bottom",
    },
  ],

  twitter: [
    {
      title: "Twitter Integration",
      content:
        "Connect your Twitter account to publish tweets and view analytics directly from your dashboard.",
      placement: "center",
    },
    {
      title: "Authentication",
      content:
        "Click 'Connect Twitter Account' to authenticate with Twitter using OAuth 2.0.",
      elementSelector: "button:contains('Connect Twitter Account')",
      placement: "bottom",
    },
    {
      title: "Tweet Composer",
      content:
        "Compose tweets with up to 280 characters and attach media files.",
      elementSelector: "textarea",
      placement: "top",
    },
    {
      title: "Analytics Dashboard",
      content:
        "Monitor your Twitter performance including followers, engagement, and top tweets.",
      elementSelector: ".grid",
      placement: "top",
    },
  ],

  studio: [
    {
      title: "Content Studio",
      content:
        "Create and edit content for your social media channels in one place.",
      placement: "center",
    },
    {
      title: "Creation Tools",
      content:
        "Use these tools to design eye-catching social media posts and graphics.",
      elementSelector: "[value='poem'], [value='reel']",
      placement: "right",
    },
    {
      title: "Templates",
      content:
        "Start with a template to quickly create professional-looking content.",
      placement: "top",
      action: "Browse Templates",
    },
  ],

  settings: [
    {
      title: "Account Settings",
      content:
        "Manage your profile information and application preferences here.",
      placement: "center",
    },
    {
      title: "Profile Settings",
      content: "Update your personal information and profile picture.",
      elementSelector: "[data-value='profile']",
      placement: "bottom",
    },
    {
      title: "Notification Preferences",
      content:
        "Control which notifications you receive and how they're delivered.",
      elementSelector: "[data-value='preferences']",
      placement: "bottom",
    },
  ],

  scheduler: [
    {
      title: "Content Scheduler",
      content: "Plan and schedule your social media posts in advance.",
      placement: "center",
    },
    {
      title: "Calendar View",
      content:
        "See your scheduled posts in a calendar format to better plan your content strategy.",
      placement: "top",
    },
    {
      title: "Create Scheduled Post",
      content:
        "Click here to create a new post and schedule it for future publication.",
      elementSelector: "button",
      placement: "left",
      action: "Try it",
    },
  ],

  voiceovers: [
    {
      title: "AI Voiceovers",
      content:
        "Create professional voiceovers for your videos using AI technology.",
      placement: "center",
    },
    {
      title: "Voice Selection",
      content: "Choose from different AI voices to match your content style.",
      placement: "right",
    },
    {
      title: "Script Editor",
      content:
        "Write or paste your script here for the AI to convert to speech.",
      placement: "top",
      action: "Try a Sample",
    },
  ],

  "ai-video": [
    {
      title: "AI Video Generator",
      content:
        "Create professional videos quickly using artificial intelligence.",
      placement: "center",
    },
    {
      title: "Video Templates",
      content: "Start with a template to create your video faster.",
      placement: "top",
    },
    {
      title: "AI Generation Options",
      content: "Customize how the AI generates your video with these settings.",
      placement: "right",
      action: "Generate Sample",
    },
  ],
};
