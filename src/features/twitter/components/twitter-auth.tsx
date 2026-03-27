"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Twitter, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profileImageUrl?: string;
}

interface TwitterAuthProps {
  onAuthSuccess?: (user: TwitterUser) => void;
  onAuthError?: (error: string) => void;
}

export function TwitterAuth({ onAuthSuccess, onAuthError }: TwitterAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<TwitterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check authentication status on mount and handle URL params
  useEffect(() => {
    checkAuthStatus();
    
    // Check for success/error parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    const twitterAuth = urlParams.get('twitter_auth');
    const twitterError = urlParams.get('twitter_error');
    
    if (twitterAuth === 'success') {
      toast.success('Twitter account connected successfully!');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      // Recheck auth status
      setTimeout(checkAuthStatus, 2000);
    } else if (twitterError) {
      const errorMessages: Record<string, string> = {
        access_denied: 'Twitter access was denied',
        missing_params: 'Missing required parameters',
        invalid_state: 'Invalid authentication state',
        callback_failed: 'Authentication callback failed'
      };
      const errorMessage = errorMessages[twitterError] || 'Twitter authentication failed';
      toast.error(errorMessage);
      onAuthError?.(errorMessage);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/twitter/check-auth', {
        // Add cache control to reduce unnecessary requests
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      
      const data = await response.json();

      if (data.authenticated && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
        onAuthSuccess?.(data.user);
        
        // Show rate limit warning if applicable
        if (data.rateLimited) {
          toast.warning('Twitter API rate limit reached. Using cached data.');
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to check Twitter auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
      
      // Don't show error toast for network issues to avoid spam
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Network error checking Twitter auth, will retry later');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true);
      
      const response = await fetch('/api/twitter/auth');
      const data = await response.json();

      if (data.authUrl) {
        console.log('🔗 Opening Twitter OAuth popup...');
        
        // Open Twitter OAuth in a new popup window
        const authWindow = window.open(
          data.authUrl,
          'twitter-auth',
          'width=600,height=700,scrollbars=yes,resizable=yes,left=' + 
          (window.screen.width / 2 - 300) + ',top=' + (window.screen.height / 2 - 350)
        );

        if (!authWindow) {
          throw new Error('Popup blocked. Please allow popups for this site.');
        }

        // Listen for messages from the popup
        const messageListener = (event: MessageEvent) => {
          // Only accept messages from our domain
          if (event.origin !== window.location.origin) {
            return;
          }

          console.log('📨 Received message from popup:', event.data);

          if (event.data.type === 'TWITTER_AUTH_SUCCESS') {
            console.log('✅ Twitter auth successful');
            window.removeEventListener('message', messageListener);
            authWindow.close();
            setIsAuthenticating(false);
            setTimeout(checkAuthStatus, 1000);
            toast.success('Twitter account connected successfully!');
          } else if (event.data.type === 'TWITTER_AUTH_ERROR') {
            console.error('❌ Twitter auth error:', event.data.error);
            window.removeEventListener('message', messageListener);
            authWindow.close();
            setIsAuthenticating(false);
            const errorMessage = event.data.error || 'Twitter authentication failed';
            toast.error(errorMessage);
            onAuthError?.(errorMessage);
          }
        };

        window.addEventListener('message', messageListener);

        // Fallback: Poll for window closure (in case message doesn't work)
        const pollTimer = setInterval(() => {
          if (authWindow.closed) {
            console.log('🪟 Popup window closed');
            clearInterval(pollTimer);
            window.removeEventListener('message', messageListener);
            setIsAuthenticating(false);
            // Check auth status after window closes
            setTimeout(checkAuthStatus, 1000);
          }
        }, 1000);

        // Cleanup timer after 5 minutes
        setTimeout(() => {
          clearInterval(pollTimer);
          window.removeEventListener('message', messageListener);
          setIsAuthenticating(false);
          if (!authWindow.closed) {
            authWindow.close();
          }
        }, 5 * 60 * 1000);
      } else {
        throw new Error('Failed to get authentication URL');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setIsAuthenticating(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to authenticate with Twitter';
      toast.error(errorMessage);
      onAuthError?.(errorMessage);
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/twitter/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        toast.success('Disconnected from Twitter');
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect from Twitter');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Checking Twitter connection...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Twitter className="h-5 w-5 text-blue-500" />
          Twitter Account
        </CardTitle>
        <CardDescription>
          {isAuthenticated
            ? "Your Twitter account is connected"
            : "Connect your Twitter account to publish tweets and view analytics"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAuthenticated && user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.profileImageUrl} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{user.name}</p>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="w-full"
            >
              Disconnect Twitter
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Not connected to Twitter</span>
            </div>
            <Button
              onClick={handleAuthenticate}
              disabled={isAuthenticating}
              className="w-full"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Twitter className="mr-2 h-4 w-4" />
                  Connect Twitter Account
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}