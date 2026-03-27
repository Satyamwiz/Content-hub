"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Mail,
  Globe,
  RefreshCw,
  UserPlus,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCollaborators } from "@/hooks/use-collaborators";
import { toast } from "sonner";

export default function CollaboratorDashboard() {
  const [rangePercent, setRangePercent] = useState(20);
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [discoverableLoading, setDiscoverableLoading] = useState(false);
  const { collaborators, mySubscribers, searchRange, loading, error, refetch } =
    useCollaborators(rangePercent);

  // Load discoverable state on component mount
  useEffect(() => {
    const fetchDiscoverableStatus = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.profile) {
            setIsDiscoverable(data.profile.discoverable || false);
          }
        }
      } catch (error) {
        console.error("Error fetching discoverable status:", error);
      }
    };

    fetchDiscoverableStatus();
  }, []);

  const handleDiscoverableToggle = async (checked: boolean) => {
    setDiscoverableLoading(true);
    try {
      const response = await fetch("/api/profile/discoverable", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ discoverable: checked }),
      });

      if (!response.ok) {
        throw new Error("Failed to update discoverable status");
      }

      setIsDiscoverable(checked);
      toast.success(
        checked
          ? "You are now discoverable by other creators"
          : "You are no longer discoverable by other creators"
      );
    } catch (error) {
      toast.error("Failed to update discoverable status");
      console.error("Error updating discoverable status:", error);
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
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Find Collaborators
          </h2>
          <p className="text-muted-foreground mt-1">
            Connect with creators who have similar subscriber counts
          </p>
        </div>
        <Button
          onClick={refetch}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Stats & Search Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mySubscribers !== null ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Your Subscribers
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(mySubscribers)}
                </p>
              </div>
              {searchRange && (
                <>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Search Range
                    </p>
                    <p className="text-lg font-semibold">
                      {formatNumber(searchRange.min)} -{" "}
                      {formatNumber(searchRange.max)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Range</p>
                    <Select
                      value={rangePercent.toString()}
                      onValueChange={(value) =>
                        setRangePercent(parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">±10%</SelectItem>
                        <SelectItem value="20">±20%</SelectItem>
                        <SelectItem value="30">±30%</SelectItem>
                        <SelectItem value="50">±50%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          ) : loading ? (
            <Skeleton className="h-20 w-full" />
          ) : null}
        </CardContent>
      </Card>

      {/* Discoverability Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Collaboration Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isDiscoverable ? (
                <Eye className="h-5 w-5 text-green-600" />
              ) : (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="discoverable" className="text-base font-medium">
                  Make my profile discoverable
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow other creators with similar subscriber counts to find
                  you for collaborations
                </p>
              </div>
            </div>
            <Switch
              id="discoverable"
              checked={isDiscoverable}
              onCheckedChange={handleDiscoverableToggle}
              disabled={discoverableLoading}
            />
          </div>
          {isDiscoverable && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✓ Your profile is visible to other creators looking for
                collaborators
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Collaborators Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collaborators.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No collaborators found</p>
              <p className="text-muted-foreground">
                Try expanding your search range or sync your YouTube analytics
                first.
              </p>
            </div>
          ) : (
            collaborators.map((collab) => (
              <Card
                key={collab.clerkId}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(collab.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {collab.displayName || "Anonymous Creator"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(collab.subscribersTotal)} subscribers
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {collab.similarity.toFixed(1)}% match
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {collab.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {collab.bio}
                      </p>
                    )}

                    {/* Content Info */}
                    <div className="space-y-2">
                      {collab.contentGenres.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Content
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {collab.contentGenres.slice(0, 2).map((genre) => (
                              <Badge
                                key={genre}
                                variant="outline"
                                className="text-xs"
                              >
                                {genre}
                              </Badge>
                            ))}
                            {collab.contentGenres.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{collab.contentGenres.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {collab.primaryPlatforms.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Platforms
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {collab.primaryPlatforms
                              .slice(0, 3)
                              .map((platform) => (
                                <Badge
                                  key={platform}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {platform}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t">
                      {collab.email && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          asChild
                        >
                          <a href={`mailto:${collab.email}`}>
                            <Mail className="h-3 w-3 mr-1" />
                            Contact
                          </a>
                        </Button>
                      )}
                      {collab.website && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          asChild
                        >
                          <a
                            href={collab.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Globe className="h-3 w-3 mr-1" />
                            Website
                          </a>
                        </Button>
                      )}
                      {!collab.email && !collab.website && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
