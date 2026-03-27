import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export interface CreatorProfileData {
  displayName?: string;
  bio?: string;
  email?: string;
  website?: string;
  contentGenres?: string[];
  targetAudience?: string;
  ageRange?: string;
  primaryPlatforms?: string[];
  editingStyle?: string;
  colorPalette?: string;
  contentTone?: string;
  postingFrequency?: string;
  primaryGoals?: string[];
  contentFocus?: string[];
  brandPartnership?: boolean;
  monetization?: boolean;
  preferredFormats?: string[];
  videoLength?: string;
  imageStyle?: string;
}

export class ProfileService {
  static async getProfile() {
    try {
      const { userId } = await auth();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const profile = await prisma.creatorProfile.findUnique({
        where: { clerkId: userId },
      });

      return { success: true, profile };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  static async createOrUpdateProfile(data: CreatorProfileData) {
    try {
      const { userId } = await auth();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const existing = await prisma.creatorProfile.findUnique({
        where: { clerkId: userId },
      });

      if (existing) {
        const updated = await prisma.creatorProfile.update({
          where: { clerkId: userId },
          data: {
            ...data,
            // ensure arrays are not null
            contentGenres: data.contentGenres ?? existing.contentGenres,
            primaryPlatforms:
              data.primaryPlatforms ?? existing.primaryPlatforms,
            primaryGoals: data.primaryGoals ?? existing.primaryGoals,
            contentFocus: data.contentFocus ?? existing.contentFocus,
            preferredFormats:
              data.preferredFormats ?? existing.preferredFormats,
          },
        });
        return { success: true, profile: updated };
      }

      const created = await prisma.creatorProfile.create({
        data: {
          clerkId: userId,
          displayName: data.displayName,
          bio: data.bio,
          email: data.email,
          website: data.website,
          contentGenres: data.contentGenres ?? [],
          targetAudience: data.targetAudience,
          ageRange: data.ageRange,
          primaryPlatforms: data.primaryPlatforms ?? [],
          editingStyle: data.editingStyle,
          colorPalette: data.colorPalette,
          contentTone: data.contentTone,
          postingFrequency: data.postingFrequency,
          primaryGoals: data.primaryGoals ?? [],
          contentFocus: data.contentFocus ?? [],
          brandPartnership: data.brandPartnership ?? false,
          monetization: data.monetization ?? false,
          preferredFormats: data.preferredFormats ?? [],
          videoLength: data.videoLength,
          imageStyle: data.imageStyle,
        },
      });

      return { success: true, profile: created };
    } catch (error) {
      console.error("Error creating/updating profile:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  static async deleteProfile() {
    try {
      const { userId } = await auth();
      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      await prisma.creatorProfile.delete({ where: { clerkId: userId } });
      return { success: true };
    } catch (error) {
      console.error("Error deleting profile:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export default ProfileService;
