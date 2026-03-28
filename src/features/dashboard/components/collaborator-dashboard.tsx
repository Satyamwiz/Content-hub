"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Mail,
  Globe,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Youtube,
  Instagram,
  Twitter,
  Clock,
  Target,
  Tv2,
  Sparkles,
} from "lucide-react";
import { useCollaborators } from "@/hooks/use-collaborators";
import { toast } from "sonner";

type ViewMode = "all" | "niche";
type RangeOption = "10" | "20" | "30" | "50";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  YouTube: <Youtube className="h-3 w-3" />,
  Instagram: <Instagram className="h-3 w-3" />,
  Twitter: <Twitter className="h-3 w-3" />,
  X: <Twitter className="h-3 w-3" />,
};

const NICHE_COLORS: Record<string, string> = {
  Tech: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Travel: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Food: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  Fitness: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  Fashion: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  Gaming: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  Finance: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  Education: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  Lifestyle: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  Comedy: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

const getBadgeColor = (genre: string) =>
  NICHE_COLORS[genre] || "bg-muted text-muted-foreground";

export default function CollaboratorDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [rangePercent, setRangePercent] = useState<RangeOption>("20");
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [discoverableLoading, setDiscoverableLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const { collaborators, mySubscribers, searchRange, loading, error, refetch } =
    useCollaborators(parseInt(rangePercent), viewMode === "niche");

  // Load discoverable state on mount
  useEffect(() => {
    const fetchDiscoverableStatus = async () => {
      try {
        setProfileLoading(true);
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.profile) {
            setIsDiscoverable(data.profile.discoverable || false);
          }
        }
      } catch (err) {
        console.error("Error fetching discoverable status:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchDiscoverableStatus();
  }, []);

  const handleDiscoverableToggle = async () => {
    const next = !isDiscoverable;
    setDiscoverableLoading(true);
    try {
      const response = await fetch("/api/profile/discoverable", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discoverable: next }),
      });
      if (!response.ok) throw new Error("Failed to update");
      setIsDiscoverable(next);
      toast.success(
        next
          ? "Your profile is now public — other creators can find you!"
          : "Your profile is now private."
      );
    } catch {
      toast.error("Failed to update profile visibility.");
    } finally {
      setDiscoverableLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getMatchColor = (pct: number) => {
    if (pct >= 70) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (pct >= 40) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    return "bg-muted text-muted-foreground";
  };

  const timeAgo = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Active today";
    if (days === 1) return "Active yesterday";
    if (days < 7) return `Active ${days}d ago`;
    if (days < 30) return `Active ${Math.floor(days / 7)}w ago`;
    return `Active ${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Collaborators
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover creators to collaborate with based on niche and audience size
          </p>
        </div>
        <Button
          onClick={refetch}
          disabled={loading}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* ── Profile Visibility Banner ─────────────────────────────── */}
      {!profileLoading && (
        <div
          className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            isDiscoverable
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-amber-500/5 border-amber-500/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                isDiscoverable ? "bg-emerald-500/15" : "bg-amber-500/15"
              }`}
            >
              {isDiscoverable ? (
                <Eye className="h-5 w-5 text-emerald-500" />
              ) : (
                <EyeOff className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">
                {isDiscoverable
                  ? "Your profile is public"
                  : "Your profile is private"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isDiscoverable
                  ? "Other creators can find and contact you for collaborations"
                  : "Other creators cannot discover you — enable to appear in their search"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleDiscoverableToggle}
            disabled={discoverableLoading}
            size="sm"
            variant={isDiscoverable ? "outline" : "default"}
            className={
              isDiscoverable
                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shrink-0"
                : "shrink-0"
            }
          >
            {discoverableLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : isDiscoverable ? (
              <Lock className="h-4 w-4 mr-2" />
            ) : (
              <Unlock className="h-4 w-4 mr-2" />
            )}
            {isDiscoverable ? "Make Private" : "Make Profile Public"}
          </Button>
        </div>
      )}

      {/* ── Filters Row ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Stats pill */}
        {mySubscribers !== null && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-full px-3 py-1.5">
            <Youtube className="h-4 w-4" />
            <span>
              <span className="font-semibold text-foreground">{formatNumber(mySubscribers)}</span>{" "}
              subscribers
            </span>
            {searchRange && (
              <>
                <span className="opacity-40">·</span>
                <span>
                  Range:{" "}
                  <span className="font-semibold text-foreground">
                    {formatNumber(searchRange.min)}–{formatNumber(searchRange.max)}
                  </span>
                </span>
              </>
            )}
          </div>
        )}

        <div className="flex gap-2 sm:ml-auto flex-wrap">
          {/* Dropdown 1 — View Mode */}
          <Select
            value={viewMode}
            onValueChange={(v) => setViewMode(v as ViewMode)}
          >
            <SelectTrigger className="w-[185px]" id="view-mode-select">
              <Sparkles className="h-4 w-4 mr-1.5 text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collaborators</SelectItem>
              <SelectItem value="niche">Same Niche Only</SelectItem>
            </SelectContent>
          </Select>


        </div>
      </div>

      {/* ── Error State ──────────────────────────────────────────── */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── Results count ────────────────────────────────────────── */}
      {!loading && !error && collaborators.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">{collaborators.length}</span>{" "}
          {viewMode === "niche" ? "same-niche " : ""}creator
          {collaborators.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── Loading Skeletons ─────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-4/5 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────── */}
      {!loading && !error && collaborators.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No collaborators found</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {viewMode === "niche"
              ? "No creators in your niche have been found. Try switching to \"All Collaborators\" or expand the subscriber range."
              : "No creators are available in this range yet. Try expanding the subscriber range or ask creators to enable discoverability."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setViewMode("all");
              setRangePercent("50");
            }}
          >
            Show all creators
          </Button>
        </div>
      )}

      {/* ── Collaborator Cards ────────────────────────────────────── */}
      {!loading && !error && collaborators.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {collaborators.map((collab) => (
            <Card
              key={collab.clerkId}
              className="group overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border"
            >
              <CardContent className="p-5 flex flex-col h-full">

                {/* Top — Avatar + Name + Match */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-12 w-12 shrink-0 ring-2 ring-background">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-sm">
                      {getInitials(collab.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">
                        {collab.displayName || "Anonymous Creator"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {collab.subscribersTotal > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Youtube className="h-3 w-3" />
                          {formatNumber(collab.subscribersTotal)} subs
                        </span>
                      )}

                    </div>
                  </div>
                </div>

                {/* Bio */}
                {collab.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                    {collab.bio}
                  </p>
                )}

                {/* Content Genres */}
                {collab.contentGenres.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      {collab.contentGenres.slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getBadgeColor(genre)}`}
                        >
                          {genre}
                        </span>
                      ))}
                      {collab.contentGenres.length > 3 && (
                        <span className="text-[10px] text-muted-foreground px-2 py-0.5">
                          +{collab.contentGenres.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Platforms */}
                {collab.primaryPlatforms.length > 0 && (
                  <div className="flex gap-1.5 mb-3">
                    {collab.primaryPlatforms.slice(0, 4).map((platform) => (
                      <span
                        key={platform}
                        className="flex items-center gap-1 text-[10px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground"
                      >
                        {PLATFORM_ICONS[platform] ?? <Tv2 className="h-3 w-3" />}
                        {platform}
                      </span>
                    ))}
                  </div>
                )}

                {/* Extra meta */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground mb-3">
                  {collab.targetAudience && (
                    <span>👥 {collab.targetAudience}</span>
                  )}
                  {collab.ageRange && (
                    <span>🎯 {collab.ageRange}</span>
                  )}
                  {collab.contentTone && (
                    <span>🎨 {collab.contentTone}</span>
                  )}
                  {collab.postingFrequency && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {collab.postingFrequency}
                    </span>
                  )}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Last seen */}
                <p className="text-[10px] text-muted-foreground mb-3">
                  {timeAgo(collab.lastActive)}
                </p>

                {/* Contact Buttons */}
                <div className="flex gap-2 pt-3 border-t">
                  {collab.email ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-xs h-8"
                      onClick={() => {
                        if (collab.email) {
                          navigator.clipboard.writeText(collab.email);
                          toast.success("Email copied to clipboard!");
                        }
                      }}
                    >
                      <Mail className="h-3 w-3 mr-1.5 shrink-0" />
                      <span className="truncate">{collab.email}</span>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="flex-1 text-xs h-8" disabled>
                      <Mail className="h-3 w-3 mr-1.5" />
                      No email
                    </Button>
                  )}
                  {collab.website && (
                    <Button size="sm" variant="outline" className="flex-1 text-xs h-8" asChild>
                      <a href={collab.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-3 w-3 mr-1.5" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
