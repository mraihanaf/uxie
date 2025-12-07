"use client";

import * as React from "react";
import { Lock, Play, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChapterStatus = "locked" | "active" | "completed";

export interface ChapterItem {
  id: string;
  title: string;
  duration?: string;
  status: ChapterStatus;
}

export interface ChapterListProps extends React.ComponentProps<"div"> {
  chapters: ChapterItem[];
  onChapterClick?: (chapter: ChapterItem) => void;
  className?: string;
  simplified?: boolean; // Untuk versi simplified di sidebar
}

export const ChapterList = React.forwardRef<HTMLDivElement, ChapterListProps>(
  (
    { className, chapters, onChapterClick, simplified = false, ...props },
    ref,
  ) => {
    const getStatusIcon = (status: ChapterStatus) => {
      switch (status) {
        case "locked":
          return <Lock className="h-5 w-5" />;
        case "active":
          return <Play className="h-5 w-5" />;
        case "completed":
          return <Check className="h-5 w-5" />;
      }
    };

    const getStatusColor = (status: ChapterStatus) => {
      switch (status) {
        case "locked":
          return "text-muted-foreground opacity-50";
        case "active":
          return "text-primary";
        case "completed":
          return "text-accent";
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-2", className)}
        {...props}
      >
        {chapters.map((chapter) => {
          const isLocked = chapter.status === "locked";
          const isActive = chapter.status === "active";
          const isCompleted = chapter.status === "completed";

          return (
            <div
              key={chapter.id}
              onClick={() => !isLocked && onChapterClick?.(chapter)}
              className={cn(
                "flex items-center justify-between gap-3 min-h-[48px] px-3 py-3 rounded-lg transition-all duration-200",
                isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                isActive
                  ? "bg-secondary/20 border border-border border-l-[3px] border-l-primary shadow-sm"
                  : isCompleted
                    ? ""
                    : "hover:bg-muted/50",
              )}
            >
              {/* Left - Badge/Icon */}
              <div
                className={cn(
                  "flex items-center justify-center h-10 w-10 rounded-full shrink-0",
                  getStatusColor(chapter.status),
                  isLocked
                    ? "bg-muted/30"
                    : isActive
                      ? "bg-primary/10"
                      : isCompleted
                        ? "bg-accent/10"
                        : "",
                )}
              >
                {getStatusIcon(chapter.status)}
              </div>

              {/* Middle - Title */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-[15px] font-medium transition-all",
                    isActive
                      ? "font-semibold text-foreground"
                      : isCompleted
                        ? "text-muted-foreground line-through"
                        : "text-foreground",
                  )}
                >
                  {chapter.title}
                </p>
              </div>

              {/* Right - Duration & Chevron */}
              {!simplified && (
                <div className="flex items-center gap-2 shrink-0">
                  {chapter.duration && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {chapter.duration}
                    </span>
                  )}
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  },
);

ChapterList.displayName = "ChapterList";
