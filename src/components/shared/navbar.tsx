"use client";

import React from "react";
import { UserButton, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { TutorialToggle } from "@/features/tutorial/tutorial-toggle";

export function DashboardNavbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center justify-end">
        <div className="flex items-center gap-3">
          <TutorialToggle />
          <ModeToggle />
          <ClerkLoading>
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          </ClerkLoading>
          <ClerkLoaded>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </ClerkLoaded>
        </div>
      </div>
    </header>
  );
}
