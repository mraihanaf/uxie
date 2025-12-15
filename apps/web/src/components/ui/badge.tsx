import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-white",
        outline: "border border-border text-foreground",
        // Pastel variants from design.json
        pink: "bg-[var(--pastel-pink)] text-foreground",
        lilac: "bg-[var(--pastel-lilac)] text-foreground",
        blue: "bg-[var(--pastel-blue)] text-foreground",
        yellow: "bg-[var(--pastel-yellow)] text-foreground",
        green: "bg-[var(--pastel-green)] text-foreground",
        // Accent (solid) variants
        accentPink: "bg-[var(--accent-pink)] text-white",
        accentLilac: "bg-[var(--accent-lilac)] text-white",
        accentBlue: "bg-[var(--accent-blue)] text-white",
        accentGreen: "bg-[var(--accent-green)] text-white",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface BadgeProps
  extends React.ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
