import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  maxLength?: number;
  showCounter?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error = false,
      errorMessage,
      maxLength,
      showCounter = false,
      ...props
    },
    ref,
  ) => {
    const [charCount, setCharCount] = React.useState(0);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            maxLength={maxLength}
            onChange={(e) => {
              setCharCount(e.target.value.length);
              props.onChange?.(e);
            }}
            className={cn(
              "min-h-[120px] w-full resize-y rounded-lg border bg-input px-3 py-2 text-sm transition-all duration-150",
              "placeholder:text-muted-foreground placeholder:italic",
              "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
              error &&
                "border-[#D94E3D] focus:border-[#D94E3D] focus:ring-[#D94E3D]/20",
              "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-muted/50",
              className,
            )}
            {...props}
          />
          {showCounter && maxLength && (
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {charCount} / {maxLength} characters
            </div>
          )}
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
Textarea.displayName = "Textarea";
