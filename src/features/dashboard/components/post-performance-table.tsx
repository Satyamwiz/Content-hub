"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const postsData = [
  {
    id: 1,
    thumbnail: "/api/placeholder/60/60",
    caption: "Tips for better social media engagement...",
    reach: "5.2K",
    likes: 342,
    comments: 28,
    type: "Carousel",
  },
  {
    id: 2,
    thumbnail: "/api/placeholder/60/60",
    caption: "Behind the scenes of content creation...",
    reach: "3.8K",
    likes: 219,
    comments: 15,
    type: "Video",
  },
  {
    id: 3,
    thumbnail: "/api/placeholder/60/60",
    caption: "Quick tutorial on design principles...",
    reach: "4.5K",
    likes: 287,
    comments: 22,
    type: "Single",
  },
  {
    id: 4,
    thumbnail: "/api/placeholder/60/60",
    caption: "Weekend inspiration for creators...",
    reach: "2.9K",
    likes: 156,
    comments: 12,
    type: "Story",
  },
  {
    id: 5,
    thumbnail: "/api/placeholder/60/60",
    caption: "Marketing strategies that actually work...",
    reach: "6.1K",
    likes: 418,
    comments: 35,
    type: "Carousel",
  },
];

export function PostPerformanceTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Post</TableHead>
              <TableHead>Caption</TableHead>
              <TableHead>Reach</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {postsData.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.thumbnail} alt="Post thumbnail" />
                      <AvatarFallback>P{post.id}</AvatarFallback>
                    </Avatar>
                    <Badge variant="secondary" className="text-xs">
                      {post.type}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px] truncate text-sm">
                    {post.caption}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{post.reach}</TableCell>
                <TableCell>{post.likes}</TableCell>
                <TableCell>{post.comments}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
