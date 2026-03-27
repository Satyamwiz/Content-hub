"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  FileAudio,
  FileVideo,
  Clock,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";

interface UploadedFile {
  file: File;
  url: string;
  type: "audio" | "video";
  duration?: number;
}

interface GenerationResult {
  url: string;
  duration: number;
  format: string;
  size: number;
}

interface MediaPlayerProps {
  originalFile: UploadedFile;
  generatedResult: GenerationResult | null;
}

export function MediaPlayer({
  originalFile,
  generatedResult,
}: MediaPlayerProps) {
  const [activeTab, setActiveTab] = useState("original");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showVideoControls, setShowVideoControls] = useState(true);

  const originalRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);
  const generatedRef = useRef<HTMLAudioElement>(null);

  const activePlayer =
    activeTab === "original" ? originalRef.current : generatedRef.current;

  useEffect(() => {
    const player = activePlayer;
    if (!player) return;

    const updateTime = () => setCurrentTime(player.currentTime);
    const updateDuration = () => setDuration(player.duration || 0);
    const updatePlayState = () => setIsPlaying(!player.paused);

    player.addEventListener("timeupdate", updateTime);
    player.addEventListener("loadedmetadata", updateDuration);
    player.addEventListener("play", updatePlayState);
    player.addEventListener("pause", updatePlayState);
    player.addEventListener("ended", () => setIsPlaying(false));

    // Set initial volume and playback rate
    player.volume = volume;
    player.playbackRate = playbackSpeed;

    return () => {
      player.removeEventListener("timeupdate", updateTime);
      player.removeEventListener("loadedmetadata", updateDuration);
      player.removeEventListener("play", updatePlayState);
      player.removeEventListener("pause", updatePlayState);
      player.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, [activePlayer, volume, playbackSpeed]);

  const togglePlay = () => {
    if (!activePlayer) return;

    if (isPlaying) {
      activePlayer.pause();
    } else {
      activePlayer.play();
    }
  };

  const handleSeek = (newTime: number[]) => {
    if (!activePlayer) return;
    activePlayer.currentTime = newTime[0];
    setCurrentTime(newTime[0]);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (activePlayer) {
      activePlayer.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!activePlayer) return;

    if (isMuted) {
      activePlayer.volume = volume;
      setIsMuted(false);
    } else {
      activePlayer.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (activePlayer) {
      activePlayer.playbackRate = speed;
    }
  };

  const resetPlayer = () => {
    if (!activePlayer) return;
    activePlayer.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    activePlayer.pause();
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="space-y-4">
      {/* Media Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="original" className="flex items-center gap-2">
            {originalFile.type === "video" ? (
              <FileVideo className="h-4 w-4" />
            ) : (
              <FileAudio className="h-4 w-4" />
            )}
            Original
          </TabsTrigger>
          <TabsTrigger
            value="generated"
            disabled={!generatedResult}
            className="flex items-center gap-2"
          >
            <FileAudio className="h-4 w-4" />
            Generated
            {generatedResult && (
              <Badge variant="secondary" className="ml-1 text-xs">
                New
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Original Media */}
        <TabsContent value="original" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {originalFile.type === "video" ? (
                  <div className="relative">
                    <video
                      ref={originalRef as React.RefObject<HTMLVideoElement>}
                      src={originalFile.url}
                      className="w-full max-h-64 rounded-lg border bg-black"
                      controls={showVideoControls}
                      onLoadedMetadata={(e) => {
                        const video = e.target as HTMLVideoElement;
                        setDuration(video.duration);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowVideoControls(!showVideoControls)}
                      className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                    >
                      {showVideoControls ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 bg-muted/30 rounded-lg border">
                    <div className="text-center">
                      <FileAudio className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {originalFile.file.name}
                      </p>
                      <audio
                        ref={originalRef as React.RefObject<HTMLAudioElement>}
                        src={originalFile.url}
                        className="hidden"
                        onLoadedMetadata={(e) => {
                          const audio = e.target as HTMLAudioElement;
                          setDuration(audio.duration);
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Original {originalFile.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {(originalFile.file.size / 1024 / 1024).toFixed(1)} MB
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generated Audio */}
        <TabsContent value="generated" className="space-y-4">
          {generatedResult ? (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-center h-32 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-center">
                      <FileAudio className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                        Generated Voiceover
                      </p>
                      <audio
                        ref={generatedRef}
                        src={generatedResult.url}
                        className="hidden"
                        onLoadedMetadata={(e) => {
                          const audio = e.target as HTMLAudioElement;
                          setDuration(audio.duration);
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs bg-green-600">
                      Generated {generatedResult.format}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {generatedResult.size} MB
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(generatedResult.duration)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground">
                  <FileAudio className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No generated voiceover yet</p>
                  <p className="text-sm">Generate a voiceover to see it here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Custom Controls */}
      {(originalFile || generatedResult) && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Play Controls */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlay}
                  disabled={!activePlayer}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetPlayer}
                  disabled={!activePlayer}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  onValueChange={handleSeek}
                  max={duration || 100}
                  step={1}
                  className="w-full"
                  disabled={!activePlayer}
                />
              </div>

              {/* Volume and Speed Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    disabled={!activePlayer}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="w-20">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      onValueChange={handleVolumeChange}
                      max={1}
                      step={0.1}
                      disabled={!activePlayer}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Speed:</span>
                  <div className="flex gap-1">
                    {speedOptions.map((speed) => (
                      <Button
                        key={speed}
                        variant={playbackSpeed === speed ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleSpeedChange(speed)}
                        disabled={!activePlayer}
                        className="text-xs px-2"
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
