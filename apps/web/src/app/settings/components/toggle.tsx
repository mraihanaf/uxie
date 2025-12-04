"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps extends React.ComponentProps<"button"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: "default" | "small";
}

export function Toggle({
  checked = false,
  onCheckedChange,
  disabled = false,
  size = "default",
  className,
  ...props
}: ToggleProps) {
  const handleClick = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  const sizeClasses = {
    default: "h-6 w-12",
    small: "h-5 w-10",
  };

  const thumbSizeClasses = {
    default: "h-5 w-5 translate-x-6",
    small: "h-4 w-4 translate-x-5",
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        sizeClasses[size],
        checked
          ? "bg-primary"
          : "bg-muted-foreground/30 dark:bg-muted-foreground/20",
        disabled && "opacity-60 cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-300",
          size === "default" ? "h-5 w-5" : "h-4 w-4",
          checked ? thumbSizeClasses[size] : "translate-x-0",
        )}
      />
    </button>
  );
}
