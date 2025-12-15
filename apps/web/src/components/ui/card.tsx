import * as React from "react";

import { cn } from "@/lib/utils";

// Base Card - matches design.json CardDashboardWidget / CardFeature
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-2xl border border-border/50 p-6",
        "shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)]",
        "transition-all duration-200",
        className,
      )}
      {...props}
    />
  );
}

// Hero Card - larger shadow, more prominent (design.json CardHero)
function CardHero({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-hero"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-3xl overflow-hidden",
        "shadow-[0_16px_40px_-8px_rgba(15,23,42,0.12)]",
        className,
      )}
      {...props}
    />
  );
}

// Feature Card - with hover effect (design.json CardFeature)
function CardFeature({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-feature"
      className={cn(
        "bg-card text-card-foreground flex flex-col rounded-2xl overflow-hidden",
        "shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)]",
        "transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-[0_16px_40px_-8px_rgba(15,23,42,0.12)]",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-xl font-semibold leading-snug tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-[var(--foreground-secondary)]", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("flex items-center justify-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center pt-4 border-t border-border/50",
        className,
      )}
      {...props}
    />
  );
}

// Pastel surface cards for different themes
function CardPastel({
  className,
  variant = "lilac",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "pink" | "lilac" | "blue" | "yellow" | "green";
}) {
  const variantClasses = {
    pink: "bg-[var(--pastel-pink)]",
    lilac: "bg-[var(--pastel-lilac)]",
    blue: "bg-[var(--pastel-blue)]",
    yellow: "bg-[var(--pastel-yellow)]",
    green: "bg-[var(--pastel-green)]",
  };

  return (
    <div
      data-slot="card-pastel"
      className={cn(
        "text-card-foreground flex flex-col gap-4 rounded-2xl p-6",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHero,
  CardFeature,
  CardPastel,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
