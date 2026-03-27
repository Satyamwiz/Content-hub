"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Youtube, LogIn, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

enum AuthStatus {
  UNKNOWN = "unknown",
  AUTHENTICATED = "authenticated",
  UNAUTHENTICATED = "unauthenticated",
  AUTHENTICATING = "authenticating",
  ERROR = "error",
}

export function YouTubeAuth() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.UNKNOWN);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/check-auth");
        const data = await response.json();

        if (data.authenticated) {
          setAuthStatus(AuthStatus.AUTHENTICATED);
        } else {
          setAuthStatus(AuthStatus.UNAUTHENTICATED);
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setAuthStatus(AuthStatus.UNAUTHENTICATED);
      } finally {
        setLoading(false);
      }
    };

    // Check auth on mount
    checkAuth();

    // Also check if we just got redirected from auth flow
    const authParam = searchParams.get("auth");
    if (authParam === "success") {
      setAuthStatus(AuthStatus.AUTHENTICATED);
    } else if (authParam === "error") {
      setAuthStatus(AuthStatus.ERROR);
    }
  }, [searchParams]);

  const handleAuth = async () => {
    try {
      setAuthStatus(AuthStatus.AUTHENTICATING);

      // Direct window location to auth endpoint which will redirect to Google OAuth
      window.location.href = "/api/auth";
    } catch (error) {
      console.error("Authentication error:", error);
      setAuthStatus(AuthStatus.ERROR);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5" />
            Checking YouTube Authentication
          </CardTitle>
          <CardDescription>
            Verifying your YouTube connection status...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (authStatus === AuthStatus.AUTHENTICATED) {
    return (
      <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle>Connected to YouTube</AlertTitle>
        <AlertDescription>
          Your account is connected to YouTube. You can now upload videos and
          view analytics.
        </AlertDescription>
      </Alert>
    );
  }

  if (authStatus === AuthStatus.ERROR) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Authentication Failed</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <span>
            There was an error connecting to YouTube. Please try again.
          </span>
          <Button variant="outline" onClick={handleAuth}>
            Retry Authentication
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5" />
          Connect to YouTube
        </CardTitle>
        <CardDescription>
          Authenticate with YouTube to upload videos and access analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleAuth}
          className="w-full flex items-center gap-2"
          disabled={authStatus === AuthStatus.AUTHENTICATING}
        >
          {authStatus === AuthStatus.AUTHENTICATING ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Authenticate with YouTube
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
