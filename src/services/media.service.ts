import { uploadToCloudinary, uploadVideoToCloudinary } from "@/lib/cloudinary";
import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { withUserEnsured } from "@/lib/user-utils";

export interface MediaUploadOptions {
  fileName: string;
  originalName?: string;
  mediaType: "IMAGE" | "VIDEO";
  prompt?: string;
  metadata?: Record<string, any>;
  cloudinaryFolder?: string;
}

export interface GeneratedMediaRecord {
  id: string;
  fileName: string;
  originalName?: string;
  mediaType: "IMAGE" | "VIDEO";
  fileSize?: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  prompt?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class MediaService {
  /**
   * Upload media to Cloudinary and save record to database
   */
  static async uploadAndSaveMedia(
    mediaData: string | Buffer,
    options: MediaUploadOptions
  ): Promise<{
    success: boolean;
    media?: GeneratedMediaRecord;
    error?: string;
  }> {
    try {
      const { userId } = await auth();

      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      // Determine folder based on media type
      const folder =
        options.cloudinaryFolder ||
        (options.mediaType === "IMAGE" ? "ai-images" : "ai-videos");

      // Upload to Cloudinary based on media type
      const uploadResult =
        options.mediaType === "VIDEO"
          ? await uploadVideoToCloudinary(mediaData, {
              folder,
              format: "mp4",
            })
          : await uploadToCloudinary(mediaData, {
              folder,
              format: "webp",
            });

      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error };
      }

      // Calculate file size if mediaData is Buffer
      const fileSize = Buffer.isBuffer(mediaData)
        ? mediaData.length
        : undefined;

      // Save to database with user creation handling
      const mediaRecord = await withUserEnsured(userId, () =>
        prisma.generatedMedia.create({
          data: {
            fileName: options.fileName,
            originalName: options.originalName,
            mediaType: options.mediaType,
            fileSize,
            cloudinaryUrl: uploadResult.url!,
            cloudinaryPublicId: uploadResult.public_id!,
            prompt: options.prompt,
            metadata: options.metadata,
            clerkId: userId,
          },
        })
      );

      return {
        success: true,
        media: mediaRecord as GeneratedMediaRecord,
      };
    } catch (error) {
      console.error("Error uploading and saving media:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get all media for the current user
   */
  static async getUserMedia(mediaType?: "IMAGE" | "VIDEO"): Promise<{
    success: boolean;
    media?: GeneratedMediaRecord[];
    error?: string;
  }> {
    try {
      const { userId } = await auth();

      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const whereClause: any = { clerkId: userId };
      if (mediaType) {
        whereClause.mediaType = mediaType;
      }

      const media = await withUserEnsured(userId, () =>
        prisma.generatedMedia.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
        })
      );

      return {
        success: true,
        media: media as GeneratedMediaRecord[],
      };
    } catch (error) {
      console.error("Error fetching user media:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Delete media from both Cloudinary and database
   */
  static async deleteMedia(mediaId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { userId } = await auth();

      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      // Get media record to ensure user owns it
      const mediaRecord = await withUserEnsured(userId, () =>
        prisma.generatedMedia.findFirst({
          where: {
            id: mediaId,
            clerkId: userId,
          },
        })
      );

      if (!mediaRecord) {
        return { success: false, error: "Media not found or access denied" };
      }

      // Delete from Cloudinary
      const cloudinary = (await import("@/lib/cloudinary")).default;
      try {
        await cloudinary.uploader.destroy(mediaRecord.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.warn("Failed to delete from Cloudinary:", cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }

      // Delete from database
      await prisma.generatedMedia.delete({
        where: { id: mediaId },
      });

      return { success: true };
    } catch (error) {
      console.error("Error deleting media:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get media statistics for user
   */
  static async getMediaStats(): Promise<{
    success: boolean;
    stats?: {
      totalImages: number;
      totalVideos: number;
      totalSize: number;
      recentCount: number; // last 7 days
    };
    error?: string;
  }> {
    try {
      const { userId } = await auth();

      if (!userId) {
        return { success: false, error: "User not authenticated" };
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [totalImages, totalVideos, totalSizeResult, recentCount] =
        await withUserEnsured(userId, () =>
          Promise.all([
            prisma.generatedMedia.count({
              where: { clerkId: userId, mediaType: "IMAGE" },
            }),
            prisma.generatedMedia.count({
              where: { clerkId: userId, mediaType: "VIDEO" },
            }),
            prisma.generatedMedia.aggregate({
              where: { clerkId: userId },
              _sum: { fileSize: true },
            }),
            prisma.generatedMedia.count({
              where: {
                clerkId: userId,
                createdAt: { gte: sevenDaysAgo },
              },
            }),
          ])
        );

      return {
        success: true,
        stats: {
          totalImages,
          totalVideos,
          totalSize: totalSizeResult._sum.fileSize || 0,
          recentCount,
        },
      };
    } catch (error) {
      console.error("Error fetching media stats:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
