import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        // Primary: Dark pill button (design.json ButtonPrimary)
        default:
          "bg-primary text-primary-foreground rounded-full hover:bg-primary/90 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
        // Destructive
        destructive:
          "bg-destructive text-white rounded-full hover:bg-destructive/90 focus-visible:ring-destructive/20",
        // Outline: Ghost pill with border (design.json ButtonSecondary)
        outline:
          "border border-border bg-transparent rounded-full hover:bg-accent hover:text-accent-foreground",
        // Secondary: Pastel background
        secondary:
          "bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80",
        // Ghost: No background
        ghost: "rounded-full hover:bg-accent hover:text-accent-foreground",
        // Link style
        link: "text-primary underline-offset-4 hover:underline",
        // Pastel variants for playful UI
        pastelPink:
          "bg-[var(--pastel-pink)] text-foreground rounded-full hover:opacity-90",
        pastelLilac:
          "bg-[var(--pastel-lilac)] text-foreground rounded-full hover:opacity-90",
        pastelBlue:
          "bg-[var(--pastel-blue)] text-foreground rounded-full hover:opacity-90",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
