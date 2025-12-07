import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const outlineButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      size: {
        sm: "h-8 px-4 py-2 text-xs rounded-md",
        default: "h-9 px-8 py-3 text-sm",
        lg: "h-11 px-10 py-4 text-base rounded-xl",
        full: "h-9 px-8 py-3 text-sm w-full",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface OutlineButtonProps
  extends
    React.ComponentProps<"button">,
    VariantProps<typeof outlineButtonVariants> {
  asChild?: boolean;
}

const OutlineButton = React.forwardRef<HTMLButtonElement, OutlineButtonProps>(
  ({ className, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          outlineButtonVariants({ size }),
          "bg-transparent border border-border text-foreground",
          "hover:bg-muted hover:border-primary hover:text-primary",
          "active:bg-muted/80",
          className,
        )}
        {...props}
      />
    );
  },
);
OutlineButton.displayName = "OutlineButton";

export { OutlineButton, outlineButtonVariants };
