"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

export function SettingsButton({
  onClick,
  isActive = false,
  disabled = false,
}: SettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group/settings h-10 w-full rounded-lg",
        "px-4 py-3 flex items-center gap-3",
        "text-sm font-medium text-foreground",
        "transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        // Default state
        "bg-transparent",
        // Hover state
        !disabled &&
          !isActive &&
          "hover:bg-[#F3F3F3] dark:hover:bg-[#383838] hover:scale-[1.02] cursor-pointer",
        // Active state
        isActive && "bg-[#F3F3F3] dark:bg-[#383838] scale-100",
        // Disabled state
        disabled && "opacity-60 cursor-not-allowed",
      )}
      aria-label="Settings"
    >
      <Settings
        className={cn(
          "h-[18px] w-[18px] shrink-0 text-primary transition-transform duration-500 ease-linear",
          !disabled && !isActive && "group-hover/settings:rotate-360",
        )}
      />
      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Settings
      </span>
    </button>
  );
}
