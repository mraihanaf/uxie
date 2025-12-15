import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface SelectProps extends React.ComponentProps<"select"> {
  placeholder?: string;
}

function Select({ className, children, placeholder, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          // Base styles
          "h-11 w-full min-w-0 rounded-xl border bg-white px-4 py-2 text-base appearance-none cursor-pointer",
          "border-border",
          // Transitions
          "transition-all duration-200",
          // Focus state
          "focus-visible:outline-none focus-visible:border-[var(--accent-lilac)] focus-visible:ring-2 focus-visible:ring-[var(--accent-lilac)]/20",
          // Disabled
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
          // Padding for icon
          "pr-10",
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-[var(--foreground-muted)] pointer-events-none" />
    </div>
  );
}

function SelectOption({ className, ...props }: React.ComponentProps<"option">) {
  return <option className={cn("py-2", className)} {...props} />;
}

export { Select, SelectOption };
