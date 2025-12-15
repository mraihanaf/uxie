"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SideNav, MobileNav } from "./side-nav";
import { AppNav } from "./top-nav";

interface AppShellProps extends React.ComponentProps<"div"> {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  onSignOut?: () => void;
}

export function AppShell({
  className,
  children,
  user,
  onSignOut,
  ...props
}: AppShellProps) {
  return (
    <div
      data-slot="app-shell"
      className={cn("min-h-screen bg-[var(--background-dashboard)]", className)}
      {...props}
    >
      {/* Top Navigation (mobile) */}
      <AppNav user={user} className="md:hidden" />

      {/* Side Navigation (desktop) */}
      <SideNav onSignOut={onSignOut} className="hidden md:flex" />

      {/* Main Content */}
      <main className="md:pl-[260px] min-h-screen pb-20 md:pb-0">
        {/* Desktop header */}
        <div className="hidden md:block sticky top-0 z-30 h-16 bg-[var(--background-dashboard)]/80 backdrop-blur-lg border-b border-border/30">
          <div className="h-full px-8 flex items-center justify-end">
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--foreground-secondary)]">
                  {user.name || user.email}
                </span>
                <div className="size-9 rounded-full bg-gradient-to-br from-[var(--accent-lilac)] to-[var(--accent-pink)] flex items-center justify-center shadow-sm">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name || "User"}
                      width={36}
                      height={36}
                      className="size-full rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {(
                        (user.name || user.email || "U")[0] ?? "U"
                      ).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-8">{children}</div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}

// Marketing page shell (for landing, auth pages)
interface MarketingShellProps extends React.ComponentProps<"div"> {
  showNav?: boolean;
}

export function MarketingShell({
  className,
  children,
  ...props
}: MarketingShellProps) {
  return (
    <div
      data-slot="marketing-shell"
      className={cn("min-h-screen bg-[var(--background)]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Auth page shell (centered card layout)
export function AuthShell({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="auth-shell"
      className={cn(
        "min-h-screen bg-[var(--background)] flex items-center justify-center p-4",
        className,
      )}
      {...props}
    >
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
