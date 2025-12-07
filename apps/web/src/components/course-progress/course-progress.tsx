"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CourseProgressProps extends React.ComponentProps<"div"> {
  title: string;
  estimation?: string;
  level?: string;
  progress: number; // 0-100
  completedChapters?: number;
  totalChapters?: number;
  className?: string;
}

export const CourseProgress = React.forwardRef<
  HTMLDivElement,
  CourseProgressProps
>(
  (
    {
      className,
      title,
      estimation,
      level,
      progress,
      completedChapters,
      totalChapters,
      ...props
    },
    ref,
  ) => {
    const progressPercentage = Math.min(Math.max(progress, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl p-6 border border-border/60 glass-sm shadow-md",
          "bg-card",
          className,
        )}
        {...props}
      >
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-foreground mb-1">
            {title}
          </h2>
          {(estimation || level) && (
            <p className="text-[13px] font-normal text-muted-foreground">
              {estimation && `Estimasi: ${estimation}`}
              {estimation && level && " - "}
              {level && `Tingkat: ${level}`}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-muted-foreground">
              Progress Belajar
            </label>
            <span className="text-xs font-semibold text-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="relative h-2 w-full rounded bg-muted overflow-hidden">
            <div
              className={cn(
                "absolute top-0 left-0 h-full rounded transition-all duration-300",
                "bg-gradient-to-r from-primary to-accent",
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        {completedChapters !== undefined && totalChapters !== undefined && (
          <p className="text-[13px] font-normal text-muted-foreground">
            {completedChapters} / {totalChapters} Bab Selesai
          </p>
        )}
      </div>
    );
  },
);

CourseProgress.displayName = "CourseProgress";
