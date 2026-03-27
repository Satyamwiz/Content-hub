"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Instagram, AlertCircle, CheckCircle, Info } from "lucide-react";
import { InstagramAuth } from "@/lib/instagram-auth";

interface InstagramAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InstagramAuthModal({
  open,
  onClose,
  onSuccess,
}: InstagramAuthModalProps) {
  const [accessToken, setAccessToken] = useState("EAALNqJXydU4BPnBHgTZBSEtsSZCgDwtfxAtdbIcQrPx6sVU6pI6O9x9nKfhNZCp2ZA292FHk22VTceS2o3lHHE0s3ULPIZALkrGbbLjmbVKHLNFnlt2KV6EgkpEJdBhm4NJdVhKZCkZAoBVCcR7huUCRXvZCVg0cfSLxLGB0HtkfiWeNUIERBoKrXGVUajjWQoLj");
  const [userId, setUserId] = useState("17841477241642522");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate token format
      const tokenValidation = InstagramAuth.validateTokenFormat(accessToken.trim());
      if (!tokenValidation.valid) {
        setError(tokenValidation.error || "Invalid access token");
        setIsSubmitting(false);
        return;
      }

      // Validate user ID format
      const userIdValidation = InstagramAuth.validateUserIdFormat(userId.trim());
      if (!userIdValidation.valid) {
        setError(userIdValidation.error || "Invalid user ID");
        setIsSubmitting(false);
        return;
      }

      // Save credentials
      InstagramAuth.saveCredentials(accessToken.trim(), userId.trim());

      // Success
      setAccessToken("");
      setUserId("");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAccessToken("");
    setUserId("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Connect Instagram Account
          </DialogTitle>
          <DialogDescription>
            Enter your Instagram API credentials to enable publishing and analytics
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Demo Credentials Info */}
          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-xs text-blue-900 dark:text-blue-100">
              <strong>Demo credentials pre-filled!</strong> You can test the integration with the provided demo account or replace with your own credentials from{" "}
              <a
                href="https://developers.facebook.com/docs/instagram-api"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Meta Developer Portal
              </a>.
            </AlertDescription>
          </Alert>

          {/* Access Token Input */}
          <div className="space-y-2">
            <Label htmlFor="access-token">
              Access Token <span className="text-red-500">*</span>
            </Label>
            <Input
              id="access-token"
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Enter your Instagram access token"
              className="font-mono text-sm"
              required
            />
            {accessToken && (
              <p className="text-xs text-muted-foreground">
                Token preview: {InstagramAuth.truncateToken(accessToken)}
              </p>
            )}
          </div>

          {/* User ID Input */}
          <div className="space-y-2">
            <Label htmlFor="user-id">
              Instagram User ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="user-id"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your Instagram user ID (numeric)"
              required
            />
            <p className="text-xs text-muted-foreground">
              This is your Instagram Business Account ID (numeric only)
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Footer Buttons */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !accessToken || !userId}>
              {isSubmitting ? "Connecting..." : "Connect Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}