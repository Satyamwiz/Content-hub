-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('user', 'assistant');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "public"."User" (
    "clerkId" TEXT NOT NULL,
    "instaUsername" TEXT,
    "instaPassword" TEXT,
    "youtubeAccessToken" TEXT,
    "youtubeRefreshToken" TEXT,
    "youtubeTokenExpiry" TIMESTAMP(3),
    "youtubeTokenType" TEXT,
    "youtubeScope" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("clerkId")
);

-- CreateTable
CREATE TABLE "public"."Conversation" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clerkId" TEXT NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "content" TEXT,
    "imageUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."instagram_posts" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "containerId" TEXT,
    "mediaType" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "caption" TEXT,
    "permalink" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'published',
    "scheduledAt" TIMESTAMP(3),
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "saved" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "rawAnalytics" JSONB,
    "rawComments" JSONB,
    "mediaInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clerkId" TEXT NOT NULL,

    CONSTRAINT "instagram_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."instagram_analytics" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "saved" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clerkId" TEXT NOT NULL,

    CONSTRAINT "instagram_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."instagram_accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "biography" TEXT,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "followsCount" INTEGER NOT NULL DEFAULT 0,
    "mediaCount" INTEGER NOT NULL DEFAULT 0,
    "profilePictureUrl" TEXT,
    "website" TEXT,
    "profileViews" INTEGER NOT NULL DEFAULT 0,
    "websiteClicks" INTEGER NOT NULL DEFAULT 0,
    "accountsEngaged" INTEGER NOT NULL DEFAULT 0,
    "totalInteractions" INTEGER NOT NULL DEFAULT 0,
    "averageEngagementPerPost" DOUBLE PRECISION,
    "engagementRatePercentage" DOUBLE PRECISION,
    "totalEngagementLast12Posts" INTEGER NOT NULL DEFAULT 0,
    "totalPostsAnalyzed" INTEGER NOT NULL DEFAULT 0,
    "rawAccountData" JSONB,
    "rawRecentMedia" JSONB,
    "lastSync" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clerkId" TEXT NOT NULL,

    CONSTRAINT "instagram_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."creator_profiles" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "email" TEXT,
    "website" TEXT,
    "contentGenres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetAudience" TEXT,
    "ageRange" TEXT,
    "primaryPlatforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "editingStyle" TEXT,
    "colorPalette" TEXT,
    "contentTone" TEXT,
    "postingFrequency" TEXT,
    "primaryGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contentFocus" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "brandPartnership" BOOLEAN NOT NULL DEFAULT false,
    "monetization" BOOLEAN NOT NULL DEFAULT false,
    "preferredFormats" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videoLength" TEXT,
    "imageStyle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clerkId" TEXT NOT NULL,

    CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."generated_media" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT,
    "mediaType" "public"."MediaType" NOT NULL,
    "fileSize" INTEGER,
    "cloudinaryUrl" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "prompt" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clerkId" TEXT NOT NULL,

    CONSTRAINT "generated_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."youtube_analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "subscribersGained" INTEGER NOT NULL DEFAULT 0,
    "subscribersLost" INTEGER NOT NULL DEFAULT 0,
    "watchTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "averageViewDuration" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clickThroughRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "videoId" TEXT,
    "videoTitle" TEXT,
    "videoViews" INTEGER NOT NULL DEFAULT 0,
    "videoLikes" INTEGER NOT NULL DEFAULT 0,
    "videoComments" INTEGER NOT NULL DEFAULT 0,
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clerkId" TEXT NOT NULL,

    CONSTRAINT "youtube_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instagram_posts_mediaId_clerkId_key" ON "public"."instagram_posts"("mediaId", "clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "instagram_accounts_accountId_key" ON "public"."instagram_accounts"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "instagram_accounts_clerkId_key" ON "public"."instagram_accounts"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_clerkId_key" ON "public"."creator_profiles"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "youtube_analytics_clerkId_date_key" ON "public"."youtube_analytics"("clerkId", "date");

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instagram_posts" ADD CONSTRAINT "instagram_posts_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instagram_analytics" ADD CONSTRAINT "instagram_analytics_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instagram_accounts" ADD CONSTRAINT "instagram_accounts_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."creator_profiles" ADD CONSTRAINT "creator_profiles_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."generated_media" ADD CONSTRAINT "generated_media_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."youtube_analytics" ADD CONSTRAINT "youtube_analytics_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;
