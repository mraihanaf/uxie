"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

interface TopNavProps extends React.ComponentProps<"header"> {
  items?: NavItem[];
  showAuth?: boolean;
  transparent?: boolean;
}

export function TopNav({
  className,
  items = [],
  showAuth = true,
  transparent = false,
  ...props
}: TopNavProps) {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      data-slot="top-nav"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-200",
        transparent && !scrolled
          ? "bg-transparent"
          : "bg-white/80 backdrop-blur-lg border-b border-border/50",
        scrolled && "shadow-sm",
        className,
      )}
      {...props}
    >
      <nav className="content-grid h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-[var(--accent-lilac)] to-[var(--accent-pink)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Uxie</span>
        </Link>

        {/* Navigation Items */}
        {items.length > 0 && (
          <div className="hidden md:flex items-center gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                  item.active
                    ? "bg-[var(--pastel-lilac)] text-foreground"
                    : "text-[var(--foreground-secondary)] hover:text-foreground hover:bg-muted",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Auth Buttons */}
        {showAuth && (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

// Simplified nav for authenticated pages
interface AppNavProps extends React.ComponentProps<"header"> {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export function AppNav({ className, user, ...props }: AppNavProps) {
  return (
    <header
      data-slot="app-nav"
      className={cn(
        "sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-lg border-b border-border/50",
        className,
      )}
      {...props}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/app" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-[var(--accent-lilac)] to-[var(--accent-pink)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Uxie</span>
        </Link>

        {/* User section */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--foreground-secondary)] hidden sm:block">
              {user.name || user.email}
            </span>
            <div className="size-9 rounded-full bg-gradient-to-br from-[var(--accent-lilac)] to-[var(--accent-pink)] flex items-center justify-center">
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
                  {((user.name || user.email || "U")[0] ?? "U").toUpperCase()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
