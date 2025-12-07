"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.ComponentProps<"div"> {
  size?: "small" | "medium" | "large";
  color?: "primary" | "white" | "accent";
  className?: string;
}

const sizeConfig = {
  small: {
    size: 24,
    strokeWidth: 2,
  },
  medium: {
    size: 32,
    strokeWidth: 2.5,
  },
  large: {
    size: 48,
    strokeWidth: 3,
  },
};

const colorConfig = {
  primary: "text-primary",
  white: "text-white",
  accent: "text-accent",
};

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "medium", color = "primary", ...props }, ref) => {
    const config = sizeConfig[size];
    const { size: svgSize, strokeWidth } = config;
    const radius = (svgSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${circumference * 0.75} ${circumference * 0.25}`;

    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center justify-center", className)}
        {...props}
      >
        <svg
          className={cn("animate-spin", colorConfig[color])}
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={circumference * 0.25}
            className="opacity-75"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    );
  },
);

Spinner.displayName = "Spinner";
