"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  text?: string;
}

const sizeClasses = {
  sm: "size-4",
  default: "size-8",
  lg: "size-12",
};

export function LoadingSpinner({
  className,
  size = "default",
  text,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-[var(--accent-lilac)]",
          sizeClasses[size],
        )}
      />
      {text && <p className="text-sm text-[var(--foreground-muted)]">{text}</p>}
    </div>
  );
}

export function PageLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function FullScreenLoading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-[var(--background)] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative size-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-[var(--pastel-lilac)] rounded-full" />
          <div className="absolute inset-0 border-4 border-t-[var(--accent-lilac)] border-r-[var(--accent-lilac)] rounded-full animate-spin" />
        </div>
        <p className="text-[var(--foreground-muted)]">{text}</p>
      </div>
    </div>
  );
}
