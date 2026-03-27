"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { format } from "date-fns";

interface AnalyticsSyncStatusProps {
  loading?: boolean;
  syncing?: boolean;
  lastSync?: Date | null;
  error?: string | null;
  onSync?: () => void;
  dataPoints?: number;
}

export function AnalyticsSyncStatus({
  loading = false,
  syncing = false,
  lastSync,
  error,
  onSync,
  dataPoints = 0,
}: AnalyticsSyncStatusProps) {
  const getStatusColor = () => {
    if (error) return "destructive";
    if (syncing || loading) return "secondary";
    if (lastSync) return "default";
    return "outline";
  };

  const getStatusText = () => {
    if (error) return "Sync Error";
    if (syncing) return "Syncing...";
    if (loading) return "Loading...";
    if (lastSync) return "Synced";
    return "Not Synced";
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-3 w-3" />;
    if (syncing || loading)
      return <RefreshCw className="h-3 w-3 animate-spin" />;
    if (lastSync) return <CheckCircle className="h-3 w-3" />;
    return <Calendar className="h-3 w-3" />;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-3">
        <Badge variant={getStatusColor()} className="gap-1">
          {getStatusIcon()}
          {getStatusText()}
        </Badge>

        <div className="text-sm text-muted-foreground">
          {lastSync ? (
            <span>
              Last sync: {format(lastSync, "MMM dd, yyyy 'at' h:mm a")}
            </span>
          ) : (
            <span>No recent sync data</span>
          )}
        </div>

        {dataPoints > 0 && (
          <Badge variant="outline" className="text-xs">
            {dataPoints} days of data
          </Badge>
        )}
      </div>

      {onSync && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSync}
          disabled={syncing || loading}
          className="gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
          Sync Now
        </Button>
      )}
    </div>
  );
}
