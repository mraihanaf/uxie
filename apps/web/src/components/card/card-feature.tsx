import * as React from "react";
import { cn } from "@/lib/utils";

export interface FeatureCardProps extends React.ComponentProps<"div"> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  iconColor?: string;
  hoverBorderColor?: string;
}

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    {
      className,
      icon,
      title,
      description,
      iconColor = "text-[#6ECDC1]",
      hoverBorderColor = "hover:border-[#6ECDC1]",
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-sm group cursor-pointer border border-border/60 rounded-xl p-6 shadow-md transition-all duration-250",
          "hover:scale-[1.03] hover:shadow-lg",
          hoverBorderColor,
          className,
        )}
        {...props}
      >
        {icon && <div className={cn("mb-3 h-12 w-12", iconColor)}>{icon}</div>}
        <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    );
  },
);
FeatureCard.displayName = "FeatureCard";
