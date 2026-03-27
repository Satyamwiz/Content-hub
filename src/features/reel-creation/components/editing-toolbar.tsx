"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Music,
  Type,
  Zap,
  Volume2,
  Palette,
  Clock,
  Sparkles,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Search,
  Download,
  Plus,
} from "lucide-react";

interface EditingToolbarProps {
  mode: "poem" | "reel";
}

const musicTracks = [
  {
    id: "calm-piano",
    name: "Calm Piano",
    category: "Ambient",
    duration: "2:30",
    mood: "Peaceful",
  },
  {
    id: "upbeat-acoustic",
    name: "Upbeat Acoustic",
    category: "Acoustic",
    duration: "3:15",
    mood: "Energetic",
  },
  {
    id: "inspirational-strings",
    name: "Inspirational Strings",
    category: "Orchestral",
    duration: "2:45",
    mood: "Uplifting",
  },
  {
    id: "modern-beat",
    name: "Modern Beat",
    category: "Electronic",
    duration: "3:00",
    mood: "Dynamic",
  },
  {
    id: "nature-sounds",
    name: "Nature Sounds",
    category: "Ambient",
    duration: "5:00",
    mood: "Relaxing",
  },
];

const transitions = [
  { id: "fade", name: "Fade", description: "Smooth fade in/out" },
  { id: "slide", name: "Slide", description: "Slide from side" },
  { id: "zoom", name: "Zoom", description: "Zoom in effect" },
  { id: "dissolve", name: "Dissolve", description: "Dissolve transition" },
  { id: "wipe", name: "Wipe", description: "Wipe across screen" },
  { id: "flip", name: "Flip", description: "3D flip effect" },
];

const fontStyles = [
  { id: "serif", name: "Serif", family: "serif" },
  { id: "sans", name: "Sans Serif", family: "sans-serif" },
  { id: "mono", name: "Monospace", family: "monospace" },
  { id: "script", name: "Script", family: "cursive" },
  { id: "display", name: "Display", family: "fantasy" },
];

export function EditingToolbar({ mode }: EditingToolbarProps) {
  const [selectedMusic, setSelectedMusic] = useState<string>("");
  const [musicVolume, setMusicVolume] = useState([50]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [captionFont, setCaptionFont] = useState("sans");
  const [captionSize, setCaptionSize] = useState([16]);
  const [selectedTransition, setSelectedTransition] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Editing Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Music Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <h3 className="font-medium">Add Music</h3>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedMusic
                    ? musicTracks.find((t) => t.id === selectedMusic)?.name
                    : "Choose music track"}
                  <Music className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <Input placeholder="Search music..." className="flex-1" />
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {musicTracks.map((track) => (
                      <div
                        key={track.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                          selectedMusic === track.id
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() => setSelectedMusic(track.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">
                              {track.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {track.category} • {track.duration}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {track.mood}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Custom Track
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {selectedMusic && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                  <Button size="sm" variant="outline">
                    <SkipBack className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <SkipForward className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <span className="text-sm">Volume</span>
                  </div>
                  <Slider
                    value={musicVolume}
                    onValueChange={setMusicVolume}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {musicVolume[0]}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Captions Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <h3 className="font-medium">Add Captions</h3>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="caption-text" className="text-sm">
                  Caption Text
                </Label>
                <Input
                  id="caption-text"
                  placeholder={
                    mode === "poem" ? "Enter verse..." : "Enter caption..."
                  }
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Font Style</Label>
                  <Select value={captionFont} onValueChange={setCaptionFont}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontStyles.map((font) => (
                        <SelectItem key={font.id} value={font.id}>
                          <span style={{ fontFamily: font.family }}>
                            {font.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Text Size</Label>
                  <div className="space-y-2">
                    <Slider
                      value={captionSize}
                      onValueChange={setCaptionSize}
                      min={12}
                      max={32}
                      step={2}
                    />
                    <div className="text-xs text-center text-muted-foreground">
                      {captionSize[0]}px
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Palette className="h-3 w-3 mr-1" />
                  Color
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Timing
                </Button>
              </div>

              {captionText && (
                <div
                  className="p-2 border rounded text-center bg-black text-white"
                  style={{
                    fontFamily: fontStyles.find((f) => f.id === captionFont)
                      ?.family,
                    fontSize: `${captionSize[0]}px`,
                  }}
                >
                  {captionText}
                </div>
              )}
            </div>
          </div>

          {/* Transitions Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <h3 className="font-medium">Transitions</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {transitions.map((transition) => (
                <div
                  key={transition.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent text-center ${
                    selectedTransition === transition.id
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                  onClick={() => setSelectedTransition(transition.id)}
                >
                  <div className="font-medium text-sm">{transition.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {transition.description}
                  </div>
                </div>
              ))}
            </div>

            {selectedTransition && (
              <div className="space-y-2">
                <Label className="text-sm">Transition Duration</Label>
                <Select defaultValue="0.5">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.3">0.3 seconds</SelectItem>
                    <SelectItem value="0.5">0.5 seconds</SelectItem>
                    <SelectItem value="1.0">1.0 second</SelectItem>
                    <SelectItem value="1.5">1.5 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <Separator className="my-6" />
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {mode === "poem" ? "Poetry Mode" : "Reel Mode"}
          </Badge>
          {selectedMusic && (
            <Badge variant="secondary" className="text-xs">
              Music: {musicTracks.find((t) => t.id === selectedMusic)?.name}
            </Badge>
          )}
          {captionText && (
            <Badge variant="secondary" className="text-xs">
              Caption Added
            </Badge>
          )}
          {selectedTransition && (
            <Badge variant="secondary" className="text-xs">
              Transition:{" "}
              {transitions.find((t) => t.id === selectedTransition)?.name}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
