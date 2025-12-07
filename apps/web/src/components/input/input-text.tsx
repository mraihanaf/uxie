import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextInputProps extends React.ComponentProps<"input"> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      className,
      label,
      helperText,
      error = false,
      errorMessage,
      type = "text",
      ...props
    },
    ref,
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "h-10 w-full rounded-lg border bg-input px-3 py-2 text-sm transition-all duration-150",
            "placeholder:text-muted-foreground placeholder:italic",
            "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
            error &&
              "border-[#D94E3D] focus:border-[#D94E3D] focus:ring-[#D94E3D]/20",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted/50",
            className,
          )}
          {...props}
        />
        {error && errorMessage && (
          <p className="mt-1 text-xs text-[#D94E3D]">{errorMessage}</p>
        )}
        {!error && helperText && (
          <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  },
);
TextInput.displayName = "TextInput";
