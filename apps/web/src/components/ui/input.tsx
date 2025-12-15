import * as React from "react";

import { cn } from "@/lib/utils";

// Standard Input - matches design.json TextInput
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "h-11 w-full min-w-0 rounded-xl border bg-white px-4 py-2 text-base",
        "border-border",
        // Placeholder
        "placeholder:text-[var(--foreground-muted)]",
        // Selection
        "selection:bg-[var(--accent-lilac)] selection:text-white",
        // Transitions
        "transition-all duration-200",
        // Focus state
        "focus-visible:outline-none focus-visible:border-[var(--accent-lilac)] focus-visible:ring-2 focus-visible:ring-[var(--accent-lilac)]/20",
        // Error state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        // File input
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

// Search Input - pill shaped with icon support (design.json SearchField)
function SearchInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <div className="relative">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[var(--foreground-muted)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="search"
        data-slot="search-input"
        className={cn(
          // Base styles
          "h-10 w-full min-w-0 rounded-full border bg-muted/50 pl-11 pr-4 text-sm",
          "border-border/50",
          // Placeholder
          "placeholder:text-[var(--foreground-muted)]",
          // Transitions
          "transition-all duration-200",
          // Focus state
          "focus-visible:outline-none focus-visible:bg-white focus-visible:border-[var(--accent-lilac)] focus-visible:shadow-sm",
          className,
        )}
        {...props}
      />
    </div>
  );
}

// Textarea - for longer text input
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles
        "w-full min-w-0 rounded-xl border bg-white px-4 py-3 text-base min-h-[120px] resize-y",
        "border-border",
        // Placeholder
        "placeholder:text-[var(--foreground-muted)]",
        // Transitions
        "transition-all duration-200",
        // Focus state
        "focus-visible:outline-none focus-visible:border-[var(--accent-lilac)] focus-visible:ring-2 focus-visible:ring-[var(--accent-lilac)]/20",
        // Error state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

export { Input, SearchInput, Textarea };
