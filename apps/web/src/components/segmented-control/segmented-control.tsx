"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps extends React.ComponentProps<"div"> {
  options: SegmentedControlOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const SegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(({ className, options, value, onChange, ...props }, ref) => {
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    left: 0,
    width: 0,
  });

  React.useEffect(() => {
    if (containerRef.current && selectedIndex >= 0) {
      const container = containerRef.current;
      const itemWidth = container.offsetWidth / options.length;
      const left = selectedIndex * itemWidth;
      setIndicatorStyle({ left, width: itemWidth });
    }
  }, [selectedIndex, options.length]);

  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      <div
        ref={containerRef}
        className={cn("relative h-11 rounded-full p-1", "bg-muted")}
      >
        {/* Sliding Indicator */}
        {selectedIndex >= 0 && (
          <div
            className="absolute top-1 h-9 rounded-[20px] bg-card shadow-sm transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        )}

        {/* Options */}
        <div className="relative flex h-full">
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onChange?.(option.value)}
                className={cn(
                  "flex-1 h-full rounded-[20px] text-sm font-medium transition-all duration-200",
                  "relative z-10",
                  isSelected
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground font-medium",
                )}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

SegmentedControl.displayName = "SegmentedControl";
