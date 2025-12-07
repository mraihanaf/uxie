import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatsCardProps extends React.ComponentProps<"div"> {
  icon?: React.ReactNode;
  value: string | number;
  label: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "success" | "warning" | "error" | "info";
}

export const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  (
    { className, icon, value, label, trend, variant = "info", ...props },
    ref,
  ) => {
    const variantColors = {
      success: "text-[#6ECDC1]",
      warning: "text-orange-500",
      error: "text-[#D94E3D]",
      info: "text-primary",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-muted border border-border/60 rounded-lg p-4 shadow-sm transition-all duration-200",
          "hover:scale-[1.02] hover:shadow-md",
          className,
        )}
        {...props}
      >
        {icon && (
          <div
            className={cn(
              "mb-3 h-10 w-10 rounded-lg bg-secondary/30 flex items-center justify-center",
              variantColors[variant],
            )}
          >
            {icon}
          </div>
        )}
        <div className={cn("text-2xl font-bold text-foreground mb-1")}>
          {value}
        </div>
        <div className="text-xs text-muted-foreground mb-2">{label}</div>
        {trend && (
          <div
            className={cn(
              "text-xs font-medium inline-flex items-center gap-1",
              trend.isPositive ? "text-[#6ECDC1]" : "text-[#D94E3D]",
            )}
          >
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    );
  },
);
StatsCard.displayName = "StatsCard";
