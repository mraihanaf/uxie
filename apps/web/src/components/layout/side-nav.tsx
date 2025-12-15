"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Plus, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/app",
    icon: <Home className="size-5" />,
  },
  {
    label: "My Courses",
    href: "/app/courses",
    icon: <BookOpen className="size-5" />,
  },
  {
    label: "Create Course",
    href: "/app/create-course",
    icon: <Plus className="size-5" />,
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: "Settings",
    href: "/app/settings",
    icon: <Settings className="size-5" />,
  },
];

interface SideNavProps extends React.ComponentProps<"aside"> {
  onSignOut?: () => void;
}

export function SideNav({ className, onSignOut, ...props }: SideNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      data-slot="side-nav"
      className={cn(
        "fixed left-0 top-0 bottom-0 w-[260px] bg-[var(--background-subtle)] border-r border-border/50",
        "flex flex-col pt-20 pb-6 px-4",
        className,
      )}
      {...props}
    >
      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isActive(item.href)
                ? "bg-[var(--pastel-lilac)] text-foreground shadow-sm"
                : "text-[var(--foreground-secondary)] hover:bg-white hover:text-foreground hover:shadow-sm",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="space-y-1">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isActive(item.href)
                ? "bg-[var(--pastel-lilac)] text-foreground"
                : "text-[var(--foreground-secondary)] hover:bg-white hover:text-foreground",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left text-[var(--foreground-secondary)] hover:bg-white hover:text-foreground transition-all duration-200"
          >
            <LogOut className="size-5" />
            Sign out
          </button>
        )}
      </div>
    </aside>
  );
}

// Mobile bottom navigation
export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border/50 md:hidden",
        "flex items-center justify-around px-4",
        className,
      )}
    >
      {mainNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors",
            isActive(item.href)
              ? "text-[var(--accent-lilac)]"
              : "text-[var(--foreground-muted)]",
          )}
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
