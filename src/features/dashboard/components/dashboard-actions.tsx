"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Youtube, BugPlay, Instagram } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function DashboardActions() {
  const handleDebugAuth = async () => {
    try {
      const response = await fetch("/api/auth-debug");
      const data = await response.json();
      console.log("Auth Debug Info:", data);
      alert(
        "Auth debug info has been logged to console. Check browser dev tools."
      );
    } catch (error) {
      console.error("Auth debug error:", error);
      alert("Auth debug failed. Check browser console for errors.");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 dashboard-actions">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Create Content
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/studio">Create Social Post</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              document
                .querySelector('[data-value="youtube"]')
                ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
              // After tab change, click the upload tab
              setTimeout(() => {
                document
                  .querySelector('[data-value="upload"]')
                  ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
              }, 100);
            }}
          >
            <Youtube className="h-4 w-4 mr-2" />
            Upload YouTube Video
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              // Navigate to Instagram publisher
              window.location.href = "/instagram-publisher";
            }}
          >
            <Instagram className="h-4 w-4 mr-2" />
            Add Instagram Post
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDebugAuth}>
            <BugPlay className="h-4 w-4 mr-2" />
            Debug Auth
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button asChild variant="outline" className="flex-1 sm:flex-none">
        <Link href="/scheduler" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Schedule Post
        </Link>
      </Button>
    </div>
  );
}
