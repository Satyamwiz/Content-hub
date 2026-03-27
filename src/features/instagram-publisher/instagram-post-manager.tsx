"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Instagram,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  Edit,
  RefreshCw,
  Calendar,
  Image as ImageIcon,
  Video,
  Filter,
} from "lucide-react";
import { instagramDbService } from "@/services/instagram-db.service";
import { InstagramService } from "@/services/instagram.service";
import { InstagramAnalytics } from "./instagram-analytics";

interface InstagramPost {
  id: string;
  mediaId: string;
  containerId?: string;
  mediaType: string;
  mediaUrl?: string;
  caption?: string;
  permalink?: string;
  timestamp: Date;
  status: string;
  likes: number;
  comments: number;
  shares: number;
  saved: number;
  reach: number;
  views: number;
}

interface InstagramPostManagerProps {
  clerkId: string;
}

export function InstagramPostManager({ clerkId }: InstagramPostManagerProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const instagramService = new InstagramService();

  useEffect(() => {
    loadPosts();
  }, [clerkId]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, statusFilter]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const dbPosts = await instagramDbService.getInstagramPostsByUser(clerkId, 100);

      const formattedPosts: InstagramPost[] = dbPosts.map(post => ({
        id: post.id,
        mediaId: post.mediaId,
        containerId: post.containerId || undefined,
        mediaType: post.mediaType,
        mediaUrl: post.mediaUrl || undefined,
        caption: post.caption || undefined,
        permalink: post.permalink || undefined,
        timestamp: post.timestamp,
        status: post.status,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        saved: post.saved,
        reach: post.reach,
        views: post.views,
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Failed to load Instagram posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.mediaId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    setFilteredPosts(filtered);
  };

  const handleDeletePost = async (post: InstagramPost) => {
    try {
      await instagramDbService.deleteInstagramPost(post.mediaId, clerkId);
      setPosts(prev => prev.filter(p => p.id !== post.id));
      console.log('Post deleted successfully:', post.mediaId);
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleRefreshAnalytics = async (post: InstagramPost) => {
    try {
      const response = await instagramService.getAnalytics(post.mediaId);
      if (response.success && response.data) {
        await instagramDbService.syncInstagramPostFromApiResponse(response, clerkId);
        await loadPosts(); // Reload posts to get updated analytics
        console.log('Analytics refreshed for post:', post.mediaId);
      }
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default" className="bg-green-600">Published</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'IMAGE':
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  if (showAnalytics && selectedPost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowAnalytics(false);
              setSelectedPost(null);
            }}
          >
            ← Back to Posts
          </Button>
          <h2 className="text-2xl font-bold">Post Analytics</h2>
        </div>
        <InstagramAnalytics
          mediaId={selectedPost.mediaId}
          clerkId={clerkId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Instagram className="h-8 w-8 text-pink-600" />
            Instagram Posts
          </h1>
          <p className="text-muted-foreground">
            Manage your Instagram posts and view analytics
          </p>
        </div>

        <Button onClick={loadPosts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="failed">Failed</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Posts ({filteredPosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading posts...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8">
              <Instagram className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">No posts found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Start by publishing your first Instagram post"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Reach</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {post.mediaUrl ? (
                            <img
                              src={post.mediaUrl}
                              alt="Post"
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              {getMediaTypeIcon(post.mediaType)}
                            </div>
                          )}
                          <div className="max-w-[200px]">
                            <p className="font-medium truncate">
                              {post.caption || 'No caption'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {post.mediaId.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMediaTypeIcon(post.mediaType)}
                          <span className="capitalize">{post.mediaType.toLowerCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(post.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>❤️ {formatNumber(post.likes)}</div>
                          <div>💬 {formatNumber(post.comments)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>👥 {formatNumber(post.reach)}</div>
                          <div>📊 {post.views > 0 ? formatNumber(post.views) : '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(post.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPost(post);
                                setShowAnalytics(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRefreshAnalytics(post)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refresh Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeletePost(post)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}