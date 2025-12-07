"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends Omit<
  React.ComponentProps<"input">,
  "type"
> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(
  (
    { className, label, helperText, error = false, errorMessage, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn(
              "h-10 w-full rounded-lg border bg-input px-3 py-2 pr-10 text-sm transition-all duration-150",
              "placeholder:text-muted-foreground placeholder:italic",
              "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
              error &&
                "border-[#D94E3D] focus:border-[#D94E3D] focus:ring-[#D94E3D]/20",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted/50",
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
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
PasswordInput.displayName = "PasswordInput";
