"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  RotateCcw,
  Download,
  Trash2,
  Clock,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { GeneratedVideo } from "../video-generation-hub";

interface GenerationHistoryProps {
  videos: GeneratedVideo[];
  onRegenerate: (video: GeneratedVideo) => void;
  onSelect: (video: GeneratedVideo) => void;
}

export function GenerationHistory({
  videos,
  onRegenerate,
  onSelect,
}: GenerationHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (videoId: string) => {
    setDeletingId(videoId);
    // Simulate delete operation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setDeletingId(null);
    // In a real app, this would call an API to delete the video
    console.log("Delete video:", videoId);
  };

  const handleDownload = (video: GeneratedVideo) => {
    if (video.videoUrl) {
      const link = document.createElement("a");
      link.href = video.videoUrl;
      link.download = `ai-video-${video.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusIcon = (status: GeneratedVideo["status"]) => {
    switch (status) {
      case "generating":
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: GeneratedVideo["status"]) => {
    switch (status) {
      case "generating":
        return (
          <Badge variant="secondary" className="text-blue-600">
            Generating
          </Badge>
        );
      case "completed":
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-fit mx-auto mb-3">
          <Clock className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-muted-foreground">No videos generated yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Create your first AI video to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {videos.map((video) => (
        <Card
          key={video.id}
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => onSelect(video)}
        >
          <CardContent className="p-0">
            <div className="flex">
              {/* Thumbnail */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <img
                  src={video.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-4 w-4 text-white" />
                </div>

                {/* Status indicator */}
                <div className="absolute top-1 left-1">
                  {getStatusIcon(video.status)}
                </div>

                {/* Duration */}
                {video.status === "completed" && (
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 rounded">
                    {video.duration}s
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-3 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Status and timestamp */}
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(video.status)}
                      <span className="text-xs text-muted-foreground">
                        {video.createdAt.toLocaleDateString()}
                      </span>
                    </div>

                    {/* Prompt */}
                    <p className="text-sm text-foreground line-clamp-2 mb-2">
                      {video.prompt}
                    </p>

                    {/* Video details */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{video.style}</span>
                      <span>•</span>
                      <span>{video.quality.toUpperCase()}</span>
                      <span>•</span>
                      <span>{video.aspectRatio}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(video);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>

                      {video.status === "completed" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(video);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onRegenerate(video);
                        }}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Regenerate
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(video.id);
                        }}
                        disabled={deletingId === video.id}
                      >
                        {deletingId === video.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Progress bar for generating videos */}
                {video.status === "generating" && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Generating...</span>
                      <span>{video.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${video.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load more button (if needed) */}
      {videos.length >= 5 && (
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View All History
          </Button>
        </div>
      )}
    </div>
  );
}
