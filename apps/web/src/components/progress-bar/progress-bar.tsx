"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.ComponentProps<"div"> {
  value: number; // 0-100
  label?: string;
  variant?: "thin" | "medium";
  color?: "primary" | "accent" | "success";
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      value,
      label,
      variant = "thin",
      color = "primary",
      showPercentage = true,
      ...props
    },
    ref,
  ) => {
    const progressPercentage = Math.min(Math.max(value, 0), 100);

    const heightClass = variant === "thin" ? "h-2" : "h-3";
    const barHeight = variant === "thin" ? 8 : 12;

    const colorClass = {
      primary: "bg-gradient-to-r from-primary to-accent",
      accent: "bg-accent",
      success: "bg-accent",
    }[color];

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {/* Label and Percentage */}
        {(label || showPercentage) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <label className="text-xs font-semibold text-muted-foreground">
                {label}
              </label>
            )}
            {showPercentage && (
              <span className="text-xs font-semibold text-foreground">
                {Math.round(progressPercentage)}%
              </span>
            )}
          </div>
        )}

        {/* Progress Bar Track */}
        <div
          className={cn(
            "relative w-full rounded bg-muted overflow-hidden",
            heightClass,
          )}
          style={{ height: `${barHeight}px` }}
        >
          {/* Progress Bar Fill */}
          <div
            className={cn(
              "absolute top-0 left-0 h-full rounded transition-all duration-300 ease-out",
              colorClass,
            )}
            style={{
              width: `${progressPercentage}%`,
              transition: "width 300ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
      </div>
    );
  },
);

ProgressBar.displayName = "ProgressBar";
