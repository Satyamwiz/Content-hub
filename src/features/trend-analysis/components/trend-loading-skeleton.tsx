// trend-loading-skeleton.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function TrendLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-80" />
              <Skeleton className="h-5 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Hashtags Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 15 }).map((_, index) => (
              <Skeleton key={index} className="h-7 w-24" />
            ))}
          </div>
          <Skeleton className="h-3 w-64 mt-3" />
        </CardContent>
      </Card>

      {/* Trend Items Skeleton */}
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-3 bg-muted/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Rank Badge */}
                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <Skeleton className="h-3 w-10" />
                </div>

                {/* Topic Info */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-7 w-64" />
                  <div className="flex gap-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </div>

              {/* Composite Score */}
              <div className="text-right min-w-[100px] space-y-1">
                <Skeleton className="h-9 w-16 ml-auto" />
                <Skeleton className="h-3 w-24 ml-auto" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {/* Score bars grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-2 p-3 rounded-lg bg-muted/50">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>

            <Separator />

            {/* Top video card */}
            <div className="border-2 rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-4 py-2 border-b">
                <Skeleton className="h-4 w-40" />
              </div>

              <div className="p-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <Skeleton className="w-48 h-32 rounded-lg shrink-0" />

                  {/* Details */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-48" />
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="bg-muted/50 px-2 py-1.5 rounded">
                          <Skeleton className="h-3 w-12 mb-1" />
                          <Skeleton className="h-2 w-8" />
                        </div>
                      ))}
                    </div>

                    <Skeleton className="h-6 w-40" />
                  </div>

                  {/* Button */}
                  <div className="flex items-center">
                    <Skeleton className="h-full w-32" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Metadata Footer */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-8">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}