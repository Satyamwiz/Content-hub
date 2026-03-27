"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";

interface ScheduledPost {
  id: string;
  content: string;
  scheduledAt: Date;
  status: string;
  platform: string;
  hashtags: string[];
  mediaUrls: string[];
}

export function SchedulerCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch scheduled posts
  React.useEffect(() => {
    const fetchScheduledPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/scheduler/posts');
        const data = await response.json();
        
        if (data.success) {
          const posts = data.posts.map((post: any) => ({
            ...post,
            scheduledAt: new Date(post.scheduledAt),
          }));
          setScheduledPosts(posts);
        }
      } catch (error) {
        console.error('Failed to fetch scheduled posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheduledPosts();
  }, []);

  const handlePrevious = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter((post) => isSameDay(post.scheduledAt, date));
  };

  const renderMonthView = () => (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Month
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("week")}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            Week
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentDate}
            onMonthChange={setCurrentDate}
            className="rounded-md border"
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">
            Posts for{" "}
            {selectedDate
              ? format(selectedDate, "MMMM d, yyyy")
              : "Selected Date"}
          </h4>
          {selectedDate && getPostsForDate(selectedDate).length > 0 ? (
            <div className="space-y-3">
              {getPostsForDate(selectedDate).map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={post.mediaUrls[0] || "/api/placeholder/40/40"} 
                      alt="Post thumbnail" 
                    />
                    <AvatarFallback>{post.platform[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {format(post.scheduledAt, "h:mm a")}
                      </span>
                      <Badge
                        variant={
                          post.status === "scheduled" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {post.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {post.platform}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading scheduled posts...</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No posts scheduled for this date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h3>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const postsForDay = getPostsForDate(day);
            return (
              <div
                key={day.toISOString()}
                className="border rounded-lg p-2 min-h-[120px]"
              >
                <div className="text-sm font-medium mb-2">
                  {format(day, "EEE d")}
                </div>
                <div className="space-y-1">
                  {postsForDay.map((post) => (
                    <div
                      key={post.id}
                      className="text-xs p-1 bg-primary/10 rounded border-l-2 border-l-primary"
                    >
                      <div className="font-medium">
                        {format(post.scheduledAt, "h:mm a")}
                      </div>
                      <div className="text-muted-foreground truncate">
                        {post.content.slice(0, 20)}...
                      </div>
                      <div className="text-xs text-blue-600">
                        {post.platform}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Content Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {viewMode === "month" ? renderMonthView() : renderWeekView()}
      </CardContent>
    </Card>
  );
}
