"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption {
  value: string;
  label: string;
  icon?: React.ReactNode; // Optional icon/flag
}

export interface SegmentedControlProps extends Omit<
  React.ComponentProps<"div">,
  "onChange"
> {
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
      const padding = 4; // 1 * 4px = 4px on each side
      const containerWidth = container.offsetWidth - padding * 2;
      const itemWidth = containerWidth / options.length;
      const left = selectedIndex * itemWidth + padding;

      setIndicatorStyle({
        left: left,
        width: itemWidth,
      });
    }
  }, [selectedIndex, options.length]);

  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      <div
        ref={containerRef}
        className={cn(
          "relative h-11 rounded-xl p-1",
          "bg-muted dark:bg-[#2A2A2A]",
          "border border-border",
        )}
      >
        {/* Sliding Indicator */}
        {selectedIndex >= 0 && (
          <div
            className="absolute top-[3px] h-[38px] rounded-lg bg-background dark:bg-[#1A1A1A] shadow-xl transition-all duration-300 ease-out border-2 border-primary/20 dark:border-primary/30"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        )}

        {/* Options */}
        <div className="relative flex h-full">
          {options.map((option, index) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onChange?.(option.value)}
                className={cn(
                  "flex-1 h-full rounded-lg text-sm font-medium transition-all duration-200",
                  "relative z-10 flex items-center justify-center gap-2.5 px-4",
                  "hover:opacity-90 active:scale-[0.97]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1",
                  "cursor-pointer",
                  isSelected
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground font-medium hover:text-foreground",
                )}
                type="button"
              >
                {option.icon && (
                  <span className="text-base leading-none flex items-center justify-center shrink-0 w-5 h-5">
                    {option.icon}
                  </span>
                )}
                <span className="truncate select-none leading-normal">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

SegmentedControl.displayName = "SegmentedControl";
