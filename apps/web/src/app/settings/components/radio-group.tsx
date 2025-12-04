"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroupContext = React.createContext<
  RadioGroupContextValue | undefined
>(undefined);

interface RadioGroupProps extends React.ComponentProps<"div"> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

export function RadioGroup({
  value,
  onValueChange,
  name,
  className,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, name }}>
      <div
        role="radiogroup"
        className={cn("flex flex-col gap-3", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioItemProps extends React.ComponentProps<"button"> {
  value: string;
  checked?: boolean;
}

export function RadioItem({
  value,
  checked: checkedProp,
  className,
  children,
  ...props
}: RadioItemProps) {
  const context = React.useContext(RadioGroupContext);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const isChecked =
    checkedProp !== undefined ? checkedProp : context?.value === value;

  const handleClick = () => {
    if (context?.onValueChange) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 250);
      context.onValueChange(value);
    }
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isChecked}
      onClick={handleClick}
      className={cn(
        "relative flex items-center justify-between h-11 px-4 py-3 rounded-lg border transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isChecked
          ? "bg-secondary/20 border-primary border-2 font-semibold"
          : "bg-transparent border-border hover:bg-muted/50 hover:border-border/80 hover:scale-[1.01]",
        className,
      )}
      {...props}
    >
      {children}
      <div
        className={cn(
          "relative h-[18px] w-[18px] rounded-full border-2 transition-all duration-250",
          isChecked
            ? "border-primary bg-primary"
            : "border-muted-foreground/40 bg-transparent",
        )}
      >
        {isChecked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "h-2 w-2 rounded-full bg-white transition-all duration-250",
                isAnimating && "animate-[pop_250ms_cubic-bezier(0.16,1,0.3,1)]",
              )}
            />
          </div>
        )}
      </div>
    </button>
  );
}
