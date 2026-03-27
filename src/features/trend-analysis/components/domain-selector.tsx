// domain-selector.tsx
"use client";

import React from "react";
import {
  Domain,
  Region,
  DOMAIN_LABELS,
  REGION_LABELS,
  DOMAIN_CATEGORIES,
} from "@/services/trend-analysis.service";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface DomainSelectorProps {
  selectedDomain: Domain | null;
  selectedRegion: Region;
  onDomainChangeAction: (domain: Domain) => void;
  onRegionChangeAction: (region: Region) => void;
  onAnalyzeAction: () => void;
  isLoading: boolean;
}

export function DomainSelector({
  selectedDomain,
  selectedRegion,
  onDomainChangeAction,
  onRegionChangeAction,
  onAnalyzeAction,
  isLoading,
}: DomainSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Trend Analysis Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Region Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Region</label>
          <Select value={selectedRegion} onValueChange={onRegionChangeAction}>
            <SelectTrigger>
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REGION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Domain Categories */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Select Domain</label>

          {Object.entries(DOMAIN_CATEGORIES).map(([category, domains]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {domains.map((domain) => (
                  <Badge
                    key={domain}
                    variant={selectedDomain === domain ? "default" : "outline"}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onDomainChangeAction(domain)}
                  >
                    {DOMAIN_LABELS[domain]}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Analyze Button */}
        <Button
          onClick={onAnalyzeAction}
          disabled={!selectedDomain || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Analyzing Trends...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Analyze Trends
            </>
          )}
        </Button>

        {selectedDomain && (
          <div className="text-sm text-muted-foreground text-center">
            Analyzing trends for{" "}
            <strong>{DOMAIN_LABELS[selectedDomain]}</strong> in{" "}
            <strong>{REGION_LABELS[selectedRegion]}</strong>
          </div>
        )}
      </CardContent>
    </Card>
  );
}