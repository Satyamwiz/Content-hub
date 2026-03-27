"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, TrendingUp, Heart, Users } from "lucide-react";

const analyticsData = [
  {
    title: "Reach",
    value: "12.5K",
    change: "+5.2%",
    icon: Eye,
    description: "Total people reached",
  },
  {
    title: "Impressions",
    value: "28.4K",
    change: "+12.1%",
    icon: TrendingUp,
    description: "Total impressions",
  },
  {
    title: "Engagement Rate",
    value: "3.8%",
    change: "+0.5%",
    icon: Heart,
    description: "Average engagement rate",
  },
  {
    title: "Followers",
    value: "1.2K",
    change: "+2.3%",
    icon: Users,
    description: "New followers this month",
  },
];

export function AnalyticsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {analyticsData.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{item.change}</span> from last
              month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
