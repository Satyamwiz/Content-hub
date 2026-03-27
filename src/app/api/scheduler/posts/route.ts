import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// GET - Fetch all scheduled posts for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');

    const where: any = { clerkId: userId };
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (platform && platform !== 'all') {
      where.platform = platform;
    }

    const scheduledPosts = await prisma.scheduledPost.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      posts: scheduledPosts,
    });

  } catch (error) {
    console.error('Fetch scheduled posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled posts' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new scheduled post
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      mediaUrls = [],
      platform,
      scheduledAt,
      hashtags = [],
      status = 'scheduled'
    } = body;

    if (!content || !platform || !scheduledAt) {
      return NextResponse.json(
        { error: 'Content, platform, and scheduled date are required' },
        { status: 400 }
      );
    }

    // Validate scheduled date is in the future
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        clerkId: userId,
        title,
        content,
        mediaUrls,
        platform,
        scheduledAt: scheduledDate,
        hashtags,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      post: scheduledPost,
    });

  } catch (error) {
    console.error('Create scheduled post error:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled post' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}