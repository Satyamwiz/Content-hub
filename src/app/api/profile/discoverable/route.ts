import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { discoverable } = await request.json();

    if (typeof discoverable !== "boolean") {
      return NextResponse.json(
        { error: "Invalid discoverable value" },
        { status: 400 }
      );
    }

    // Check if user has a creator profile
    const existingProfile = await prisma.creatorProfile.findUnique({
      where: { clerkId: userId },
    });

    if (!existingProfile) {
      // Create a basic profile with just the discoverable setting
      await prisma.creatorProfile.create({
        data: {
          clerkId: userId,
          discoverable,
        },
      });
    } else {
      // Update the existing profile
      await prisma.creatorProfile.update({
        where: { clerkId: userId },
        data: { discoverable },
      });
    }

    return NextResponse.json({
      success: true,
      discoverable,
    });
  } catch (error) {
    console.error("Error updating discoverable status:", error);
    return NextResponse.json(
      { error: "Failed to update discoverable status" },
      { status: 500 }
    );
  }
}
