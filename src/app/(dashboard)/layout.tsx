"use client";

import React, { Suspense } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/shared/sidebar";
import { DashboardNavbar } from "@/components/shared/navbar";
import { TutorialWrapper } from "@/features/tutorial/tutorial-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SidebarProvider>
        <TutorialWrapper>
          <div className="min-h-screen flex w-full">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col">
              <DashboardNavbar />
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </TutorialWrapper>
      </SidebarProvider>
    </Suspense>
  );
}
