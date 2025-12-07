"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(
  undefined,
);

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange?.(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  return (
    <DialogContext.Provider
      value={{ open, onOpenChange: onOpenChange || (() => {}) }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const context = React.useContext(DialogContext);
  if (!context?.open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm transition-opacity duration-200",
        "opacity-100",
        className,
      )}
      onClick={() => context.onOpenChange(false)}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const context = React.useContext(DialogContext);
  if (!context?.open) return null;

  return (
    <div
      className={cn(
        "fixed left-1/2 top-1/2 z-[1001] w-[500px] max-w-[95vw] max-h-[80vh] -translate-x-1/2 -translate-y-1/2",
        "bg-card border border-border/60 rounded-2xl shadow-xl",
        "glass overflow-hidden flex flex-col",
        "opacity-100 scale-100",
        "md:max-w-[480px]",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      <div className="overflow-y-auto custom-scrollbar flex-1 px-6 py-6 pr-5">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-between mb-4", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-xl font-semibold text-foreground m-0", className)}
      {...props}
    />
  );
}

export function DialogClose({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const context = React.useContext(DialogContext);

  return (
    <button
      type="button"
      onClick={() => context?.onOpenChange(false)}
      className={cn(
        "p-2 rounded-md text-foreground transition-all duration-150",
        "hover:text-primary hover:scale-110 hover:rotate-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      aria-label="Close dialog"
      {...props}
    >
      <X className="h-5 w-5" />
    </button>
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-muted-foreground mb-3", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex justify-end gap-3 mt-6", className)} {...props} />
  );
}
