"use client";

import * as React from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertBannerVariant = "success" | "error" | "warning" | "info";

export interface AlertBannerProps extends React.ComponentProps<"div"> {
  variant: AlertBannerVariant;
  title: string;
  message?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles = {
  success: {
    container: "bg-accent/20 border-accent",
    icon: "text-accent",
    border: "border-accent",
  },
  error: {
    container: "bg-destructive/20 border-destructive",
    icon: "text-destructive",
    border: "border-destructive",
  },
  warning: {
    container: "bg-orange-500/20 border-orange-500",
    icon: "text-orange-500",
    border: "border-orange-500",
  },
  info: {
    container: "bg-primary/20 border-primary",
    icon: "text-primary",
    border: "border-primary",
  },
};

const defaultIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export const AlertBanner = React.forwardRef<HTMLDivElement, AlertBannerProps>(
  (
    {
      className,
      variant,
      title,
      message,
      icon,
      dismissible = true,
      onDismiss,
      ...props
    },
    ref,
  ) => {
    const [isDismissed, setIsDismissed] = React.useState(false);
    const IconComponent = defaultIcons[variant];
    const styles = variantStyles[variant];

    const handleDismiss = () => {
      setIsDismissed(true);
      onDismiss?.();
    };

    if (isDismissed) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "w-full min-h-[48px] rounded-lg p-4 border shadow-sm",
          "flex items-start gap-3",
          styles.container,
          styles.border,
          className,
        )}
        {...props}
      >
        {/* Icon */}
        <div className={cn("shrink-0", styles.icon)}>
          {icon ? (
            <div className="h-5 w-5">{icon}</div>
          ) : (
            <IconComponent className="h-5 w-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground mb-1">
            {title}
          </h4>
          {message && (
            <p className="text-[13px] font-normal text-foreground leading-relaxed">
              {message}
            </p>
          )}
        </div>

        {/* Close Button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={cn(
              "shrink-0 p-1 rounded-md transition-colors duration-150",
              "hover:bg-black/5 dark:hover:bg-white/5",
              "text-muted-foreground hover:text-foreground",
            )}
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  },
);

AlertBanner.displayName = "AlertBanner";
