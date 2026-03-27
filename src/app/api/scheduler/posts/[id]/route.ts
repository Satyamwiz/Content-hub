// app/api/scheduled-post/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// If you did want to enable caching for GET, you could add:
// export const dynamic = 'force-static';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const scheduledPost = await prisma.scheduledPost.findFirst({
      where: { id, clerkId: userId },
    });

    if (!scheduledPost) {
      return NextResponse.json(
        { error: "Scheduled post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, post: scheduledPost });
  } catch (error) {
    console.error("Fetch scheduled post error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled post" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingPost = await prisma.scheduledPost.findFirst({
      where: { id, clerkId: userId },
    });
    if (!existingPost) {
      return NextResponse.json(
        { error: "Scheduled post not found" },
        { status: 404 }
      );
    }
    if (existingPost.status === "published") {
      return NextResponse.json(
        { error: "Cannot update published posts" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      mediaUrls,
      platform,
      scheduledAt,
      hashtags,
      status,
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (mediaUrls !== undefined) updateData.mediaUrls = mediaUrls;
    if (platform !== undefined) updateData.platform = platform;
    if (hashtags !== undefined) updateData.hashtags = hashtags;
    if (status !== undefined) updateData.status = status;

    if (scheduledAt !== undefined) {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { error: "Scheduled date must be in the future" },
          { status: 400 }
        );
      }
      updateData.scheduledAt = scheduledDate;
    }

    const updatedPost = await prisma.scheduledPost.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error("Update scheduled post error:", error);
    return NextResponse.json(
      { error: "Failed to update scheduled post" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingPost = await prisma.scheduledPost.findFirst({
      where: { id, clerkId: userId },
    });
    if (!existingPost) {
      return NextResponse.json(
        { error: "Scheduled post not found" },
        { status: 404 }
      );
    }

    await prisma.scheduledPost.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Scheduled post deleted successfully",
    });
  } catch (error) {
    console.error("Delete scheduled post error:", error);
    return NextResponse.json(
      { error: "Failed to delete scheduled post" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
