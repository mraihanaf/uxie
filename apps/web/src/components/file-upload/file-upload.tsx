"use client";

import * as React from "react";
import {
  CloudUpload,
  FileText,
  Image as ImageIcon,
  File,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileUploadProps extends Omit<
  React.ComponentProps<"div">,
  "onChange"
> {
  acceptedFormats?: string[];
  maxFiles?: number;
  onChange?: (files: File[]) => void;
  value?: File[];
}

const getFileIcon = (file: File) => {
  const type = file.type;
  if (type.includes("pdf")) return FileText;
  if (type.includes("image")) return ImageIcon;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  (
    {
      className,
      acceptedFormats = ["pdf", "docx", "jpg", "jpeg", "png", "txt"],
      maxFiles,
      onChange,
      value = [],
      ...props
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [files, setFiles] = React.useState<File[]>(value);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      setFiles(value);
    }, [value]);

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const validateAndAddFiles = (fileList: FileList | null) => {
      if (!fileList) return;

      const newFiles: File[] = [];
      Array.from(fileList).forEach((file) => {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        if (
          fileExtension &&
          acceptedFormats.some((format) =>
            format.toLowerCase().includes(fileExtension),
          )
        ) {
          if (!maxFiles || files.length + newFiles.length < maxFiles) {
            newFiles.push(file);
          }
        }
      });

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      validateAndAddFiles(e.dataTransfer.files);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      validateAndAddFiles(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleRemoveFile = (index: number) => {
      const updatedFiles = files.filter((_, i) => i !== index);
      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    };

    const handleClick = () => {
      fileInputRef.current?.click();
    };

    const acceptedFormatsText = acceptedFormats
      .map((f) => f.toUpperCase())
      .join(", ");

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {/* Upload Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "relative w-full min-h-[150px] rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer",
            "bg-card",
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-border",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxFiles !== 1}
            accept={acceptedFormats.map((f) => `.${f}`).join(",")}
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div
            className={cn(
              "flex flex-col items-center justify-center h-full min-h-[150px] gap-3 p-6 transition-transform duration-200",
              isDragging && "scale-105",
            )}
          >
            <CloudUpload
              className={cn(
                "h-12 w-12 transition-colors duration-200",
                isDragging ? "text-primary" : "text-primary",
              )}
            />
            <div className="text-center">
              <p className="text-base font-normal text-foreground">
                Seret file ke sini atau klik browse
              </p>
              <p className="text-xs font-normal text-muted-foreground mt-1">
                Format: {acceptedFormatsText}
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    className="p-1 rounded-md hover:bg-destructive/10 transition-colors shrink-0"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

FileUpload.displayName = "FileUpload";
