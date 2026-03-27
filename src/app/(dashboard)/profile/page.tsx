"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Globe,
  Users,
  Camera,
  Palette,
  Target,
  Star,
  Settings,
  Save,
  Loader2,
  CheckCircle,
  Youtube,
  Instagram,
  Twitter as TwitterIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface CreatorProfile {
  // Basic Info
  displayName: string;
  bio: string;
  email: string;
  website?: string;

  // Content Details
  contentGenres: string[];
  targetAudience: string;
  ageRange: string;
  primaryPlatforms: string[];

  // Style & Preferences
  editingStyle: string;
  colorPalette: string;
  contentTone: string;
  postingFrequency: string;

  // Goals & Focus
  primaryGoals: string[];
  contentFocus: string[];
  brandPartnership: boolean;
  monetization: boolean;

  // Technical Preferences
  preferredFormats: string[];
  videoLength: string;
  imageStyle: string;

  // Collaborator Settings
  discoverable: boolean;
}

const defaultProfile: CreatorProfile = {
  displayName: "",
  bio: "",
  email: "",
  website: "",
  contentGenres: [],
  targetAudience: "",
  ageRange: "",
  primaryPlatforms: [],
  editingStyle: "",
  colorPalette: "",
  contentTone: "",
  postingFrequency: "",
  primaryGoals: [],
  contentFocus: [],
  brandPartnership: false,
  monetization: false,
  preferredFormats: [],
  videoLength: "",
  imageStyle: "",
  discoverable: false,
};

export default function ProfilePage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<CreatorProfile>(defaultProfile);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load user profile data on mount
  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        displayName: user.fullName || "",
        email: user.emailAddresses[0]?.emailAddress || "",
      }));
      // Try to fetch existing profile from backend
      (async () => {
        try {
          const res = await fetch("/api/profile");
          if (res.ok) {
            const json = await res.json();
            if (json?.success && json?.profile) {
              // Merge fetched profile into state, prefer fetched values
              setProfile((prev) => ({ ...prev, ...json.profile }));
            }
          }
        } catch (e) {
          // ignore fetch errors for now
        }
      })();
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to backend
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || "Failed to save profile");
      } else {
        setSaved(true);
        toast.success("Profile saved successfully!");
        // Reset saved state after 2 seconds
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleGenreToggle = (genre: string) => {
    setProfile((prev) => ({
      ...prev,
      contentGenres: prev.contentGenres.includes(genre)
        ? prev.contentGenres.filter((g) => g !== genre)
        : [...prev.contentGenres, genre],
    }));
  };

  const handlePlatformToggle = (platform: string) => {
    setProfile((prev) => ({
      ...prev,
      primaryPlatforms: prev.primaryPlatforms.includes(platform)
        ? prev.primaryPlatforms.filter((p) => p !== platform)
        : [...prev.primaryPlatforms, platform],
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setProfile((prev) => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goal)
        ? prev.primaryGoals.filter((g) => g !== goal)
        : [...prev.primaryGoals, goal],
    }));
  };

  const handleFocusToggle = (focus: string) => {
    setProfile((prev) => ({
      ...prev,
      contentFocus: prev.contentFocus.includes(focus)
        ? prev.contentFocus.filter((f) => f !== focus)
        : [...prev.contentFocus, focus],
    }));
  };

  const handleFormatToggle = (format: string) => {
    setProfile((prev) => ({
      ...prev,
      preferredFormats: prev.preferredFormats.includes(format)
        ? prev.preferredFormats.filter((f) => f !== format)
        : [...prev.preferredFormats, format],
    }));
  };

  const genres = [
    "Gaming",
    "Tech",
    "Lifestyle",
    "Beauty",
    "Fashion",
    "Food",
    "Travel",
    "Education",
    "Comedy",
    "Music",
    "Sports",
    "Fitness",
    "DIY",
    "Reviews",
  ];

  const platforms = [
    { name: "YouTube", icon: Youtube },
    { name: "Instagram", icon: Instagram },
    { name: "Twitter/X", icon: TwitterIcon },
    { name: "TikTok", icon: Camera },
  ];

  const goals = [
    "Grow Audience",
    "Increase Engagement",
    "Brand Collaborations",
    "Monetization",
    "Community Building",
    "Educational Content",
    "Entertainment",
    "Product Promotion",
  ];

  const contentFocus = [
    "Tutorials",
    "Reviews",
    "Vlogs",
    "Behind the Scenes",
    "Live Streams",
    "Shorts/Reels",
    "Educational",
    "Entertainment",
    "News & Updates",
  ];

  const formats = [
    "Short Videos (&lt; 1 min)",
    "Medium Videos (1-10 min)",
    "Long Videos (10+ min)",
    "Square Images",
    "Portrait Images",
    "Landscape Images",
    "Carousels",
    "Stories",
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
            <AvatarFallback>
              {user?.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Creator Profile</h1>
            <p className="text-muted-foreground">
              Tell us about your content creation style and preferences
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {loading ? "Saving..." : saved ? "Saved!" : "Save Profile"}
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={profile.displayName}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                placeholder="Your creator name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              value={profile.website}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, website: e.target.value }))
              }
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Tell us about yourself and your content..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Content Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Genres */}
          <div className="space-y-3">
            <Label>Content Genres</Label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Badge
                  key={genre}
                  variant={
                    profile.contentGenres.includes(genre)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleGenreToggle(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Select
                value={profile.targetAudience}
                onValueChange={(value) =>
                  setProfile((prev) => ({ ...prev, targetAudience: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Audience</SelectItem>
                  <SelectItem value="professionals">Professionals</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="hobbyists">Hobbyists</SelectItem>
                  <SelectItem value="enthusiasts">Enthusiasts</SelectItem>
                  <SelectItem value="beginners">Beginners</SelectItem>
                  <SelectItem value="experts">Experts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageRange">Primary Age Range</Label>
              <Select
                value={profile.ageRange}
                onValueChange={(value) =>
                  setProfile((prev) => ({ ...prev, ageRange: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="13-17">13-17 (Gen Z Young)</SelectItem>
                  <SelectItem value="18-24">18-24 (Gen Z)</SelectItem>
                  <SelectItem value="25-34">25-34 (Millennials)</SelectItem>
                  <SelectItem value="35-44">
                    35-44 (Millennials Older)
                  </SelectItem>
                  <SelectItem value="45-54">45-54 (Gen X)</SelectItem>
                  <SelectItem value="55+">55+ (Boomers)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Primary Platforms */}
          <div className="space-y-3">
            <Label>Primary Platforms</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <div
                    key={platform.name}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      profile.primaryPlatforms.includes(platform.name)
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:bg-muted/50"
                    }`}
                    onClick={() => handlePlatformToggle(platform.name)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">
                        {platform.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Style & Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Style & Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editingStyle">Editing Style</Label>
              <Select
                value={profile.editingStyle}
                onValueChange={(value) =>
                  setProfile((prev) => ({ ...prev, editingStyle: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select editing style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal & Clean</SelectItem>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="trendy">Trendy & Modern</SelectItem>
                  <SelectItem value="vintage">Vintage/Retro</SelectItem>
                  <SelectItem value="dynamic">Dynamic & Energetic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="colorPalette">Preferred Color Palette</Label>
              <Select
                value={profile.colorPalette}
                onValueChange={(value) =>
                  setProfile((prev) => ({ ...prev, colorPalette: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color palette" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bright">Bright & Vibrant</SelectItem>
                  <SelectItem value="pastel">Soft & Pastel</SelectItem>
                  <SelectItem value="monochrome">Monochrome</SelectItem>
                  <SelectItem value="warm">Warm Tones</SelectItem>
                  <SelectItem value="cool">Cool Tones</SelectItem>
                  <SelectItem value="neutral">Neutral & Natural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentTone">Content Tone</Label>
              <Select
                value={profile.contentTone}
                onValueChange={(value) =>
                  setProfile((prev) => ({ ...prev, contentTone: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual & Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="humorous">Humorous & Fun</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="inspirational">Inspirational</SelectItem>
                  <SelectItem value="authentic">
                    Authentic & Personal
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postingFrequency">Posting Frequency</Label>
              <Select
                value={profile.postingFrequency}
                onValueChange={(value) =>
                  setProfile((prev) => ({ ...prev, postingFrequency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="few-times-week">
                    Few times a week
                  </SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals & Focus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals & Content Focus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Goals */}
          <div className="space-y-3">
            <Label>Primary Goals</Label>
            <div className="flex flex-wrap gap-2">
              {goals.map((goal) => (
                <Badge
                  key={goal}
                  variant={
                    profile.primaryGoals.includes(goal) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleGoalToggle(goal)}
                >
                  {goal}
                </Badge>
              ))}
            </div>
          </div>

          {/* Content Focus */}
          <div className="space-y-3">
            <Label>Content Focus Areas</Label>
            <div className="flex flex-wrap gap-2">
              {contentFocus.map((focus) => (
                <Badge
                  key={focus}
                  variant={
                    profile.contentFocus.includes(focus) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleFocusToggle(focus)}
                >
                  {focus}
                </Badge>
              ))}
            </div>
          </div>

          {/* Monetization Options */}
          <div className="space-y-4">
            <Label>Monetization & Partnerships</Label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="brandPartnership"
                  checked={profile.brandPartnership}
                  onCheckedChange={(checked) =>
                    setProfile((prev) => ({
                      ...prev,
                      brandPartnership: !!checked,
                    }))
                  }
                />
                <Label htmlFor="brandPartnership" className="text-sm">
                  Interested in brand partnerships and sponsorships
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="monetization"
                  checked={profile.monetization}
                  onCheckedChange={(checked) =>
                    setProfile((prev) => ({ ...prev, monetization: !!checked }))
                  }
                />
                <Label htmlFor="monetization" className="text-sm">
                  Looking to monetize content through ads, memberships, etc.
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Technical Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preferred Formats */}
          <div className="space-y-3">
            <Label>Preferred Content Formats</Label>
            <div className="flex flex-wrap gap-2">
              {formats.map((format) => (
                <Badge
                  key={format}
                  variant={
                    profile.preferredFormats.includes(format)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleFormatToggle(format)}
                >
                  {format}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="videoLength">Preferred Video Length</Label>
              <Select
                value={profile.videoLength}
                onValueChange={(value) =>
                  setProfile((prev) => ({ ...prev, videoLength: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select video length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (&lt; 60 seconds)</SelectItem>
                  <SelectItem value="medium">Medium (1-10 minutes)</SelectItem>
                  <SelectItem value="long">Long (10+ minutes)</SelectItem>
                  <SelectItem value="mixed">Mixed lengths</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageStyle">Image Style Preference</Label>
              <Select
                value={profile.imageStyle}
                onValueChange={(value) =>
                  setProfile((prev) => ({ ...prev, imageStyle: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select image style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realistic">Realistic Photos</SelectItem>
                  <SelectItem value="artistic">Artistic & Creative</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="illustrated">
                    Illustrated/Graphic
                  </SelectItem>
                  <SelectItem value="mixed">Mixed Styles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration Settings
          </CardTitle>
          <CardDescription>
            Control how other creators can discover and connect with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="discoverable" className="text-base">
                Allow others to discover my profile
              </Label>
              <p className="text-sm text-muted-foreground">
                Other creators with similar subscriber counts can find you for
                potential collaborations
              </p>
            </div>
            <Switch
              id="discoverable"
              checked={profile.discoverable}
              onCheckedChange={(checked) =>
                setProfile((prev) => ({ ...prev, discoverable: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center pb-8">
        <Button onClick={handleSave} disabled={loading} className="gap-2 px-8">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {loading
            ? "Saving Profile..."
            : saved
            ? "Profile Saved!"
            : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
