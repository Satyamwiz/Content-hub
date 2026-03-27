"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileAudio,
  FileVideo,
  X,
  Clock,
  HardDrive,
} from "lucide-react";

interface UploadedFile {
  file: File;
  url: string;
  type: "audio" | "video";
  duration?: number;
}

interface FileUploadZoneProps {
  onFileUpload: (file: File) => void;
  uploadedFile: UploadedFile | null;
}

const ACCEPTED_FORMATS = {
  "audio/*": [".mp3", ".wav", ".m4a", ".aac"],
  "video/*": [".mp4", ".mov", ".avi", ".mkv"],
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function FileUploadZone({
  onFileUpload,
  uploadedFile,
}: FileUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: ACCEPTED_FORMATS,
      maxSize: MAX_FILE_SIZE,
      multiple: false,
    });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const removeFile = () => {
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.url);
    }
    // Reset by uploading null - parent component should handle this
  };

  if (uploadedFile) {
    return (
      <div className="space-y-4">
        {/* Uploaded File Display */}
        <div className="border-2 border-dashed border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              {uploadedFile.type === "video" ? (
                <FileVideo className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <FileAudio className="h-5 w-5 text-green-600 dark:text-green-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-green-900 dark:text-green-100 truncate">
                {uploadedFile.file.name}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-sm text-green-700 dark:text-green-300">
                  <HardDrive className="h-3 w-3" />
                  {formatFileSize(uploadedFile.file.size)}
                </div>
                {uploadedFile.duration && (
                  <div className="flex items-center gap-1 text-sm text-green-700 dark:text-green-300">
                    <Clock className="h-3 w-3" />
                    {formatDuration(uploadedFile.duration)}
                  </div>
                )}
                <Badge
                  variant="outline"
                  className="text-xs border-green-300 text-green-700 dark:border-green-700 dark:text-green-300"
                >
                  {uploadedFile.type.toUpperCase()}
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* File Preview */}
        {uploadedFile.type === "video" ? (
          <video
            src={uploadedFile.url}
            controls
            className="w-full max-h-48 rounded-lg border bg-black"
            onLoadedMetadata={(e) => {
              const video = e.target as HTMLVideoElement;
              // Could update duration here if needed
            }}
          />
        ) : (
          <audio
            src={uploadedFile.url}
            controls
            className="w-full"
            onLoadedMetadata={(e) => {
              const audio = e.target as HTMLAudioElement;
              // Could update duration here if needed
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <input {...getInputProps()} />

        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
          <Upload className="h-6 w-6 text-primary" />
        </div>

        {isDragActive ? (
          <div>
            <p className="text-lg font-medium">Drop your file here</p>
            <p className="text-sm text-muted-foreground">Release to upload</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium">Drag & drop your media file</p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <Button variant="outline" className="mb-4">
              Select File
            </Button>
          </div>
        )}
      </div>

      {/* Supported Formats */}
      <div className="text-center space-y-2">
        <p className="text-sm font-medium">Supported Formats</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary" className="text-xs">
            MP3
          </Badge>
          <Badge variant="secondary" className="text-xs">
            WAV
          </Badge>
          <Badge variant="secondary" className="text-xs">
            M4A
          </Badge>
          <Badge variant="secondary" className="text-xs">
            MP4
          </Badge>
          <Badge variant="secondary" className="text-xs">
            MOV
          </Badge>
          <Badge variant="secondary" className="text-xs">
            AVI
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
        </p>
      </div>

      {/* Error Messages */}
      {fileRejections.length > 0 && (
        <div className="text-center">
          {fileRejections.map(({ file, errors }) => (
            <div
              key={file.name}
              className="text-sm text-red-600 dark:text-red-400"
            >
              {errors.map((error) => (
                <p key={error.code}>
                  {error.code === "file-too-large"
                    ? `File too large. Maximum size is ${formatFileSize(
                        MAX_FILE_SIZE
                      )}`
                    : error.code === "file-invalid-type"
                    ? "File type not supported"
                    : error.message}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
