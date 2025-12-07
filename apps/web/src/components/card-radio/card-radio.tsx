"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardRadioOption {
  value: string;
  icon?: React.ReactNode;
  title: string;
  duration?: string;
  description?: string;
}

export interface CardRadioProps extends React.ComponentProps<"div"> {
  options: CardRadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const CardRadio = React.forwardRef<HTMLDivElement, CardRadioProps>(
  ({ className, options, value, onChange, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}
        {...props}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <div
              key={option.value}
              onClick={() => onChange?.(option.value)}
              className={cn(
                "relative cursor-pointer rounded-xl p-5 min-h-[120px]",
                "border transition-all duration-200",
                "bg-card shadow-md",
                isSelected
                  ? "border-2 border-primary bg-primary/15"
                  : "border border-border hover:border-2 hover:border-primary hover:bg-primary/15 hover:scale-[1.02] hover:shadow-lg",
              )}
            >
              {/* Checkmark Icon */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <Check className="h-5 w-5 text-accent" />
                </div>
              )}

              {/* Icon */}
              {option.icon && (
                <div className="mb-3 h-12 w-12 text-foreground">
                  {option.icon}
                </div>
              )}

              {/* Title */}
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {option.title}
              </h3>

              {/* Duration */}
              {option.duration && (
                <p className="text-sm font-medium text-accent mb-2">
                  {option.duration}
                </p>
              )}

              {/* Description */}
              {option.description && (
                <p className="text-[13px] font-normal text-muted-foreground">
                  {option.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  },
);

CardRadio.displayName = "CardRadio";
