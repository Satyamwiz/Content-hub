import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export interface CollaboratorMatch {
  clerkId: string;
  displayName: string | null;
  bio: string | null;
  email: string | null;
  website: string | null;
  primaryPlatforms: string[];
  contentGenres: string[];
  targetAudience: string | null;
  subscribersTotal: number;
  similarity: number; // percentage match (0-100)
  lastActive: Date;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const rangePercent = parseInt(url.searchParams.get("range") || "20");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    // Get current user's profile and subscriber count
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { creatorProfile: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get current user's subscriber count from YouTube Analytics
    const userAnalytics = await prisma.youTubeAnalytics.findFirst({
      where: { clerkId: userId },
      orderBy: { date: "desc" },
      select: { subscribersGained: true },
    });

    // Use actual subscriber count or default to 0 if no analytics data
    const mySubscribers = userAnalytics?.subscribersGained || 0;

    // Calculate range based on subscriber count
    const lowerBound = Math.floor(mySubscribers * (1 - rangePercent / 100));
    const upperBound = Math.ceil(mySubscribers * (1 + rangePercent / 100));

    // Fetch all discoverable users from the database
    const potentialCollaborators = await prisma.creatorProfile.findMany({
      where: {
        discoverable: true,
        clerkId: {
          not: userId, // Exclude current user
        },
      },
      include: {
        user: {
          include: {
            youtubeAnalytics: {
              orderBy: { date: "desc" },
              take: 1,
            },
          },
        },
      },
      take: limit * 3, // Fetch more to have better filtering options
    });

    // Helper function to calculate content similarity
    const calculateContentSimilarity = (
      userGenres: string[],
      collaboratorGenres: string[]
    ) => {
      if (!userGenres.length || !collaboratorGenres.length) return 0;
      const intersection = userGenres.filter((genre) =>
        collaboratorGenres.includes(genre)
      );
      const union = [...new Set([...userGenres, ...collaboratorGenres])];
      return intersection.length / union.length;
    };

    // Helper function to calculate platform similarity
    const calculatePlatformSimilarity = (
      userPlatforms: string[],
      collaboratorPlatforms: string[]
    ) => {
      if (!userPlatforms.length || !collaboratorPlatforms.length) return 0;
      const intersection = userPlatforms.filter((platform) =>
        collaboratorPlatforms.includes(platform)
      );
      return (
        intersection.length /
        Math.max(userPlatforms.length, collaboratorPlatforms.length)
      );
    };

    // Process collaborators and calculate similarity
    const processedCollaborators: CollaboratorMatch[] = potentialCollaborators
      .map((profile) => {
        // Get actual subscriber count from their YouTube analytics
        const collaboratorAnalytics = profile.user.youtubeAnalytics[0];
        const subscribersTotal =
          collaboratorAnalytics?.subscribersGained || 1000;

        // Calculate subscriber similarity (40% weight)
        const subscriberDiff = Math.abs(subscribersTotal - mySubscribers);
        const maxDiff = Math.max(mySubscribers, subscribersTotal, 1);
        const subscriberSimilarity =
          maxDiff > 0 ? Math.max(0, 1 - subscriberDiff / maxDiff) : 1;

        // Calculate content similarity (35% weight)
        const contentSimilarity = currentUser.creatorProfile
          ? calculateContentSimilarity(
              currentUser.creatorProfile.contentGenres,
              profile.contentGenres
            )
          : 0;

        // Calculate platform similarity (25% weight)
        const platformSimilarity = currentUser.creatorProfile
          ? calculatePlatformSimilarity(
              currentUser.creatorProfile.primaryPlatforms,
              profile.primaryPlatforms
            )
          : 0;

        // Calculate composite similarity score
        const similarity =
          (subscriberSimilarity * 0.4 +
            contentSimilarity * 0.35 +
            platformSimilarity * 0.25) *
          100;

        return {
          clerkId: profile.clerkId,
          displayName: profile.displayName || "Anonymous Creator",
          bio:
            profile.bio ||
            "Content creator passionate about sharing knowledge and connecting with others.",
          email: profile.email,
          website: profile.website,
          primaryPlatforms: profile.primaryPlatforms || [],
          contentGenres: profile.contentGenres || [],
          targetAudience: profile.targetAudience,
          subscribersTotal,
          similarity: Math.round(similarity * 100) / 100,
          lastActive: profile.updatedAt,
        };
      })
      .sort((a, b) => b.similarity - a.similarity);

    // First, try to find collaborators within subscriber range if user has subscriber data
    let collaborators: CollaboratorMatch[] = [];

    if (mySubscribers > 0) {
      collaborators = processedCollaborators
        .filter(
          (collab) =>
            collab.subscribersTotal >= lowerBound &&
            collab.subscribersTotal <= upperBound
        )
        .slice(0, limit);
    }

    // If no collaborators found in range, return all discoverable collaborators
    if (collaborators.length === 0) {
      collaborators = processedCollaborators.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      mySubscribers,
      searchRange: { min: lowerBound, max: upperBound },
      collaborators,
    });
  } catch (error) {
    console.error("Error finding collaborators:", error);
    return NextResponse.json(
      { error: "Failed to find collaborators" },
      { status: 500 }
    );
  }
}
