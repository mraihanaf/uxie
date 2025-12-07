import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps extends React.ComponentProps<"input"> {
  label?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={ref}
            type="search"
            className={cn(
              "h-10 w-full rounded-lg border bg-input pl-10 pr-3 py-2 text-sm transition-all duration-150",
              "placeholder:text-muted-foreground placeholder:italic",
              "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted/50",
              className,
            )}
            {...props}
          />
        </div>
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
