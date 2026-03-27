"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface ScheduledPost {
  id: string;
  title?: string;
  content: string;
  caption: string; // Add caption field for compatibility
  mediaUrls: string[];
  platform: string;
  scheduledAt: Date;
  scheduledDate: Date; // Add scheduledDate field for compatibility
  status: string;
  hashtags: string[];
  publishedAt?: Date;
  publishedId?: string;
  publishedUrl?: string;
  thumbnail?: string; // Add thumbnail field
}

type StatusFilter = "all" | "scheduled" | "draft" | "published";

export function ScheduledPostsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch scheduled posts from API
  React.useEffect(() => {
    const fetchScheduledPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/scheduler/posts');
        const data = await response.json();

        if (data.success) {
          const posts = data.posts.map((post: any) => ({
            ...post,
            caption: post.content || post.caption || '',
            scheduledAt: new Date(post.scheduledAt),
            scheduledDate: new Date(post.scheduledAt),
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
            hashtags: post.hashtags || [],
            thumbnail: post.mediaUrls?.[0] || undefined,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "draft":
        return "secondary";
      case "published":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-3 w-3" />;
      case "published":
        return <Eye className="h-3 w-3" />;
      default:
        return <Edit className="h-3 w-3" />;
    }
  };

  const filteredPosts = scheduledPosts.filter((post: ScheduledPost) => {
    const matchesSearch =
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.hashtags.some((tag: string) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (action: string, postId: string) => {
    console.log(`${action} post ${postId}`);
    // Handle actions here
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Posts
          </CardTitle>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Posts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("scheduled")}>
                  Scheduled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                  Drafts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("published")}>
                  Published
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading posts...
                  </TableCell>
                </TableRow>
              ) : filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No posts 
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post: ScheduledPost) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={post.thumbnail}
                          alt="Post thumbnail"
                        />
                        <AvatarFallback>P{post.id}</AvatarFallback>
                      </Avatar>
                    </TableCell>

                    <TableCell className="max-w-[300px]">
                      <div className="space-y-1">
                        <p className="text-sm line-clamp-2">{post.content}</p>
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.slice(0, 3).map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="text-xs text-blue-600 bg-blue-50 px-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {post.hashtags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{post.hashtags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {format(post.scheduledAt, "MMM d, yyyy")}
                        </div>
                        <div className="text-muted-foreground">
                          {format(post.scheduledAt, "h:mm a")}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-medium">
                        {post.platform}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={getStatusColor(post.status)}
                        className="flex items-center gap-1 w-fit"
                      >
                        {getStatusIcon(post.status)}
                        {post.status.charAt(0).toUpperCase() +
                          post.status.slice(1)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleAction("edit", post.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction("view", post.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleAction("delete", post.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredPosts.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div>
              Showing {filteredPosts.length} of {scheduledPosts.length}{" "}
              posts
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                {
                  scheduledPosts.filter((p: ScheduledPost) => p.status === "scheduled")
                    .length
                }{" "}
                Scheduled
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                {
                  scheduledPosts.filter((p: ScheduledPost) => p.status === "draft").length
                }{" "}
                Drafts
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                {
                  scheduledPosts.filter((p: ScheduledPost) => p.status === "published")
                    .length
                }{" "}
                Published
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
