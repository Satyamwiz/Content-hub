"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface InstagramDisconnectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function InstagramDisconnectDialog({
  open,
  onClose,
  onConfirm,
}: InstagramDisconnectDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Disconnect Instagram Account?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Are you sure you want to disconnect your Instagram account? This will:
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-sm">
                <li>Remove your stored credentials</li>
                <li>Disable Instagram publishing</li>
                <li>Clear analytics data from view</li>
              </ul>
              <p className="text-sm font-medium mt-3">
                You can reconnect anytime by entering your credentials again.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Disconnect
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
