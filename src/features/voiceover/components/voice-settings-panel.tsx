"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Languages,
  Volume2,
  Gauge,
  Music,
  Globe,
  User,
  Users,
} from "lucide-react";

interface VoiceSettings {
  language: string;
  voiceStyle: string;
  speed: number;
  pitch: number;
}

interface VoiceSettingsPanelProps {
  settings: VoiceSettings;
  onSettingsChange: (settings: VoiceSettings) => void;
}

const LANGUAGES = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
  { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
  { code: "ta-IN", name: "Tamil", flag: "🇮🇳" },
  { code: "te-IN", name: "Telugu", flag: "🇮🇳" },
  { code: "kn-IN", name: "Kannada", flag: "🇮🇳" },
  { code: "ml-IN", name: "Malayalam", flag: "🇮🇳" },
  { code: "bn-IN", name: "Bengali", flag: "🇮🇳" },
  { code: "gu-IN", name: "Gujarati", flag: "🇮🇳" },
  { code: "mr-IN", name: "Marathi", flag: "🇮🇳" },
  { code: "pa-IN", name: "Punjabi", flag: "🇮🇳" },
  { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
  { code: "fr-FR", name: "French", flag: "🇫🇷" },
  { code: "de-DE", name: "German", flag: "🇩🇪" },
  { code: "it-IT", name: "Italian", flag: "🇮🇹" },
  { code: "pt-BR", name: "Portuguese", flag: "🇧🇷" },
  { code: "ru-RU", name: "Russian", flag: "🇷🇺" },
  { code: "ja-JP", name: "Japanese", flag: "🇯🇵" },
  { code: "ko-KR", name: "Korean", flag: "🇰🇷" },
  { code: "zh-CN", name: "Chinese (Mandarin)", flag: "🇨🇳" },
  { code: "ar-SA", name: "Arabic", flag: "🇸🇦" },
  { code: "tr-TR", name: "Turkish", flag: "🇹🇷" },
  { code: "nl-NL", name: "Dutch", flag: "🇳🇱" },
  { code: "sv-SE", name: "Swedish", flag: "🇸🇪" },
  { code: "pl-PL", name: "Polish", flag: "🇵🇱" },
];

const VOICE_STYLES = [
  {
    id: "neutral",
    name: "Neutral",
    description: "Professional, clear tone",
    icon: User,
    category: "Standard",
  },
  {
    id: "friendly",
    name: "Friendly",
    description: "Warm, approachable tone",
    icon: User,
    category: "Standard",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Authoritative, business tone",
    icon: Users,
    category: "Standard",
  },
  {
    id: "cheerful",
    name: "Cheerful",
    description: "Upbeat, energetic tone",
    icon: User,
    category: "Expressive",
  },
  {
    id: "calm",
    name: "Calm",
    description: "Relaxed, soothing tone",
    icon: User,
    category: "Expressive",
  },
  {
    id: "serious",
    name: "Serious",
    description: "Formal, serious tone",
    icon: Users,
    category: "Expressive",
  },
  {
    id: "excited",
    name: "Excited",
    description: "Enthusiastic, animated tone",
    icon: User,
    category: "Expressive",
  },
  {
    id: "sad",
    name: "Sad",
    description: "Melancholic, somber tone",
    icon: User,
    category: "Expressive",
  },
  {
    id: "angry",
    name: "Angry",
    description: "Intense, aggressive tone",
    icon: User,
    category: "Expressive",
  },
  {
    id: "whispering",
    name: "Whispering",
    description: "Soft, intimate tone",
    icon: User,
    category: "Special",
  },
  {
    id: "newscast",
    name: "Newscast",
    description: "News anchor style",
    icon: Users,
    category: "Special",
  },
  {
    id: "narration",
    name: "Narration",
    description: "Storytelling style",
    icon: User,
    category: "Special",
  },
];

export function VoiceSettingsPanel({
  settings,
  onSettingsChange,
}: VoiceSettingsPanelProps) {
  const updateSetting = (key: keyof VoiceSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const selectedLanguage = LANGUAGES.find(
    (lang) => lang.code === settings.language
  );
  const selectedVoiceStyle = VOICE_STYLES.find(
    (style) => style.id === settings.voiceStyle
  );

  // Group voice styles by category
  const groupedVoiceStyles = VOICE_STYLES.reduce((groups, style) => {
    const category = style.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(style);
    return groups;
  }, {} as Record<string, typeof VOICE_STYLES>);

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Globe className="h-4 w-4" />
          Language
        </Label>
        <Select
          value={settings.language}
          onValueChange={(value) => updateSetting("language", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{selectedLanguage?.flag}</span>
                <span>{selectedLanguage?.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <div className="flex items-center gap-2">
                  <span>{language.flag}</span>
                  <span>{language.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Voice Style Selection */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Volume2 className="h-4 w-4" />
          Voice Style
        </Label>
        <Select
          value={settings.voiceStyle}
          onValueChange={(value) => updateSetting("voiceStyle", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex items-center gap-2">
                {selectedVoiceStyle && (
                  <>
                    <selectedVoiceStyle.icon className="h-4 w-4" />
                    <span>{selectedVoiceStyle.name}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {selectedVoiceStyle.category}
                    </Badge>
                  </>
                )}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(groupedVoiceStyles).map(([category, styles]) => (
              <div key={category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {category}
                </div>
                {styles.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    <div className="flex items-center gap-2 w-full">
                      <style.icon className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{style.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {style.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
        {selectedVoiceStyle && (
          <p className="text-xs text-muted-foreground">
            {selectedVoiceStyle.description}
          </p>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Advanced Settings</Label>

        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm">
              <Gauge className="h-3 w-3" />
              Speed
            </Label>
            <Badge variant="outline" className="text-xs">
              {settings.speed}x
            </Badge>
          </div>
          <Slider
            value={[settings.speed]}
            onValueChange={(value) => updateSetting("speed", value[0])}
            min={0.5}
            max={2.0}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.5x (Slow)</span>
            <span>1.0x (Normal)</span>
            <span>2.0x (Fast)</span>
          </div>
        </div>

        {/* Pitch Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm">
              <Music className="h-3 w-3" />
              Pitch
            </Label>
            <Badge variant="outline" className="text-xs">
              {settings.pitch > 1 ? "+" : settings.pitch < 1 ? "-" : ""}
              {Math.round((settings.pitch - 1) * 100)}%
            </Badge>
          </div>
          <Slider
            value={[settings.pitch]}
            onValueChange={(value) => updateSetting("pitch", value[0])}
            min={0.5}
            max={1.5}
            step={0.05}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>-50% (Lower)</span>
            <span>0% (Normal)</span>
            <span>+50% (Higher)</span>
          </div>
        </div>
      </div>

      {/* Preview Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Settings</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Language:</span>
                <br />
                <span className="font-medium">{selectedLanguage?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Voice:</span>
                <br />
                <span className="font-medium">{selectedVoiceStyle?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Speed:</span>
                <br />
                <span className="font-medium">{settings.speed}x</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pitch:</span>
                <br />
                <span className="font-medium">
                  {settings.pitch > 1 ? "+" : settings.pitch < 1 ? "-" : ""}
                  {Math.round((settings.pitch - 1) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
