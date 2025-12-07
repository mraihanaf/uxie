"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuizOptionState =
  | "default"
  | "selected"
  | "correct"
  | "wrong"
  | "disabled";

export interface QuizOptionProps extends React.ComponentProps<"button"> {
  letter: string;
  label: string;
  state?: QuizOptionState;
  showResult?: boolean;
}

export const QuizOption = React.forwardRef<HTMLButtonElement, QuizOptionProps>(
  (
    {
      className,
      letter,
      label,
      state = "default",
      showResult = false,
      onClick,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || showResult || state === "disabled";

    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          "w-full h-14 flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200",
          "border-2",
          state === "default" &&
            "border-border bg-transparent hover:bg-muted hover:border-border/80 hover:scale-[1.02]",
          state === "selected" && "border-primary bg-secondary/30 scale-100",
          state === "correct" && "border-accent bg-accent/20 opacity-100",
          state === "wrong" &&
            "border-destructive bg-destructive/20 opacity-80",
          isDisabled && "cursor-not-allowed",
          className,
        )}
        {...props}
      >
        {/* Left - Letter Badge & Label */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-full shrink-0 text-sm font-semibold",
              "bg-secondary",
            )}
          >
            {letter}
          </div>
          <span
            className={cn(
              "text-[15px] font-normal text-foreground",
              state === "wrong" && "line-through",
            )}
          >
            {label}
          </span>
        </div>

        {/* Right - Indicator */}
        <div className="shrink-0">
          {state === "default" && (
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/40 bg-transparent" />
          )}
          {state === "selected" && (
            <div className="relative h-5 w-5 rounded-full border-2 border-primary bg-primary">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white" />
            </div>
          )}
          {showResult && state === "correct" && (
            <Check className="h-4 w-4 text-accent" />
          )}
          {showResult && state === "wrong" && (
            <X className="h-4 w-4 text-destructive" />
          )}
        </div>
      </button>
    );
  },
);

QuizOption.displayName = "QuizOption";
