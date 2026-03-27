"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Download,
  Trash2,
  Eye,
  Calendar,
  FileImage,
  Video,
  HardDrive,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

interface GeneratedMedia {
  id: string;
  fileName: string;
  originalName?: string;
  mediaType: "IMAGE" | "VIDEO";
  fileSize?: number;
  cloudinaryUrl: string;
  prompt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface MediaStats {
  totalImages: number;
  totalVideos: number;
  totalSize: number;
  recentCount: number;
}

export default function GalleryPage() {
  const { user } = useUser();
  const [media, setMedia] = useState<GeneratedMedia[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
    fetchStats();
  }, []);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/media");
      const data = await response.json();

      if (data.success) {
        setMedia(data.media || []);
      } else {
        toast.error("Failed to load media");
      }
    } catch (error) {
      console.error("Error fetching media:", error);
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/media/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return;

    try {
      setDeleting(mediaId);
      const response = await fetch(`/api/media?id=${mediaId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMedia((prev) => prev.filter((item) => item.id !== mediaId));
        toast.success("Media deleted successfully");
        fetchStats(); // Refresh stats
      } else {
        toast.error(data.error || "Failed to delete media");
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error("Failed to delete media");
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (item: GeneratedMedia) => {
    try {
      const response = await fetch(item.cloudinaryUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = item.originalName || item.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const MediaGrid = ({ items }: { items: GeneratedMedia[] }) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <FileImage className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No media found</h3>
          <p className="text-muted-foreground">
            Generate some content to see it here!
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="group overflow-hidden">
            <div className="relative aspect-square bg-muted">
              {item.mediaType === "IMAGE" ? (
                <Image
                  src={item.cloudinaryUrl}
                  alt={item.originalName || "Generated image"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20">
                  <Video className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownload(item)}
                  className="bg-white/20 backdrop-blur text-white hover:bg-white/30"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="bg-red-500/80 backdrop-blur text-white hover:bg-red-500"
                >
                  {deleting === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Media type badge */}
              <div className="absolute top-2 left-2">
                <Badge
                  variant={item.mediaType === "IMAGE" ? "default" : "secondary"}
                >
                  {item.mediaType === "IMAGE" ? (
                    <FileImage className="h-3 w-3 mr-1" />
                  ) : (
                    <Video className="h-3 w-3 mr-1" />
                  )}
                  {item.mediaType}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-medium truncate">
                  {item.originalName || item.fileName}
                </h3>

                {item.prompt && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.prompt}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(item.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {formatFileSize(item.fileSize)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
          <AvatarFallback>
            {user?.fullName
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">Media Gallery</h1>
          <p className="text-muted-foreground">
            Your generated images and videos
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <FileImage className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Images
                  </p>
                  <p className="text-2xl font-bold">{stats.totalImages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Videos
                  </p>
                  <p className="text-2xl font-bold">{stats.totalVideos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <HardDrive className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Storage
                  </p>
                  <p className="text-2xl font-bold">
                    {formatFileSize(stats.totalSize)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Recent
                  </p>
                  <p className="text-2xl font-bold">{stats.recentCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Media Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All Media ({media.length})</TabsTrigger>
          <TabsTrigger value="images">
            Images ({media.filter((item) => item.mediaType === "IMAGE").length})
          </TabsTrigger>
          <TabsTrigger value="videos">
            Videos ({media.filter((item) => item.mediaType === "VIDEO").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <MediaGrid items={media} />
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <MediaGrid
            items={media.filter((item) => item.mediaType === "IMAGE")}
          />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <MediaGrid
            items={media.filter((item) => item.mediaType === "VIDEO")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
