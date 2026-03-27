-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "twitterAccessToken" TEXT,
ADD COLUMN     "twitterRefreshToken" TEXT,
ADD COLUMN     "twitterTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "twitterUserId" TEXT,
ADD COLUMN     "twitterUsername" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."creator_profiles" ADD COLUMN     "discoverable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."youtube_analytics" ADD COLUMN     "subscribersTotal" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."scheduled_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "platform" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "publishedAt" TIMESTAMP(3),
    "publishedId" TEXT,
    "publishedUrl" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clerkId" TEXT NOT NULL,

    CONSTRAINT "scheduled_posts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."scheduled_posts" ADD CONSTRAINT "scheduled_posts_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;
