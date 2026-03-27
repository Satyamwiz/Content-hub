"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Twitter, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Loader2,
  RefreshCw,
  Activity
} from "lucide-react";
import { toast } from "sonner";

interface TwitterStatus {
  authenticated: boolean;
  user?: {
    id: string;
    username: string;
    name: string;
    followersCount?: number;
    followingCount?: number;
    tweetCount?: number;
  };
  rateLimited?: boolean;
  cached?: boolean;
  lastChecked?: string;
}

export function TwitterStatus() {
  const [status, setStatus] = useState<TwitterStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/twitter/check-auth');
      const data = await response.json();
      
      setStatus({
        ...data,
        lastChecked: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Failed to check Twitter status:', error);
      toast.error('Failed to check Twitter status');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setIsTestingConnection(true);
      const response = await fetch('/api/twitter/test-connection');
      const data = await response.json();
      
      if (data.success) {
        toast.success('Twitter connection test successful!');
        setStatus(prev => prev ? {
          ...prev,
          user: data.user,
          lastChecked: new Date().toLocaleTimeString()
        } : null);
      } else if (data.rateLimited) {
        toast.warning('Rate limited - using cached data');
      } else {
        toast.error(data.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Checking Twitter status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Twitter className="h-5 w-5 text-blue-500" />
            Twitter Integration Status
          </div>
          <div className="flex items-center gap-2">
            {status?.lastChecked && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {status.lastChecked}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={checkStatus}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Monitor your Twitter API connection and usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status?.authenticated ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium">Not Connected</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {status?.rateLimited && (
              <Badge variant="destructive">Rate Limited</Badge>
            )}
            {status?.cached && (
              <Badge variant="secondary">Cached Data</Badge>
            )}
          </div>
        </div>

        {/* User Information */}
        {status?.authenticated && status.user && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium">Account Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="font-medium">@{status.user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Display Name</p>
                  <p className="font-medium">{status.user.name}</p>
                </div>
                {status.user.followersCount !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Followers</p>
                    <p className="font-medium">{status.user.followersCount.toLocaleString()}</p>
                  </div>
                )}
                {status.user.followingCount !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Following</p>
                    <p className="font-medium">{status.user.followingCount.toLocaleString()}</p>
                  </div>
                )}
                {status.user.tweetCount !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tweets</p>
                    <p className="font-medium">{status.user.tweetCount.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <Separator />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={isTestingConnection || !status?.authenticated}
            className="flex items-center gap-2"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={checkStatus}
            disabled={isLoading}
          >
            Refresh Status
          </Button>
        </div>

        {/* Rate Limiting Info */}
        {status?.rateLimited && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Rate Limit Active
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Twitter API rate limit reached. Using cached data. Limits reset every 15 minutes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Not Connected Info */}
        {!status?.authenticated && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Twitter className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Connect Your Twitter Account
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Connect your Twitter account to start publishing tweets and accessing analytics.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}