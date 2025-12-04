import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-[#6ECDC1]/20 text-[#6ECDC1] border border-[#6ECDC1]",
        error: "bg-[#D94E3D]/20 text-[#D94E3D] border border-[#D94E3D]",
        warning: "bg-orange-500/20 text-orange-500 border border-orange-500",
        info: "bg-primary/20 text-primary border border-primary",
        outline: "bg-transparent border border-border text-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";

export { badgeVariants };
