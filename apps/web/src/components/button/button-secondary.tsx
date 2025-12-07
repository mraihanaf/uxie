import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const secondaryButtonVariants = cva(
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

export interface SecondaryButtonProps
  extends
    React.ComponentProps<"button">,
    VariantProps<typeof secondaryButtonVariants> {
  asChild?: boolean;
}

const SecondaryButton = React.forwardRef<
  HTMLButtonElement,
  SecondaryButtonProps
>(({ className, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(
        secondaryButtonVariants({ size }),
        "bg-secondary text-secondary-foreground border border-primary shadow-xs",
        "hover:bg-secondary/80 hover:text-primary hover:border-primary/80 hover:shadow-sm",
        "active:scale-[0.98] active:opacity-90",
        className,
      )}
      {...props}
    />
  );
});
SecondaryButton.displayName = "SecondaryButton";

export { SecondaryButton, secondaryButtonVariants };
