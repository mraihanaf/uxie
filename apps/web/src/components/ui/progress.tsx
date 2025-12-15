import * as React from "react";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number;
  max?: number;
  variant?: "default" | "pink" | "lilac" | "blue" | "green";
  size?: "sm" | "default" | "lg";
}

const variantColors = {
  default: "bg-[var(--accent-lilac)]",
  pink: "bg-[var(--accent-pink)]",
  lilac: "bg-[var(--accent-lilac)]",
  blue: "bg-[var(--accent-blue)]",
  green: "bg-[var(--accent-green)]",
};

const sizeClasses = {
  sm: "h-1.5",
  default: "h-2",
  lg: "h-3",
};

function Progress({
  className,
  value = 0,
  max = 100,
  variant = "default",
  size = "default",
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        "w-full rounded-full bg-muted overflow-hidden",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          variantColors[variant],
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// Progress with label
interface ProgressWithLabelProps extends ProgressProps {
  label?: string;
  showPercentage?: boolean;
}

function ProgressWithLabel({
  label,
  showPercentage = true,
  value = 0,
  max = 100,
  ...props
}: ProgressWithLabelProps) {
  const percentage = Math.round(
    Math.min(Math.max((value / max) * 100, 0), 100),
  );

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        {label && <span className="font-medium">{label}</span>}
        {showPercentage && (
          <span className="text-[var(--foreground-muted)]">{percentage}%</span>
        )}
      </div>
      <Progress value={value} max={max} {...props} />
    </div>
  );
}

export { Progress, ProgressWithLabel };
