"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Info, LayoutDashboard, Mail, Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  animationClass: string;
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    iconColor: "text-[#6ECDC1]",
    animationClass: "group-hover:animate-icon-rotate-bounce",
  },
  {
    label: "About",
    href: "/about",
    icon: Info,
    iconColor: "text-primary",
    animationClass: "group-hover:animate-icon-pulse-jitter",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    iconColor: "text-[#E6D9F3] dark:text-[#E6D9F3]",
    animationClass:
      "group-hover:animate-icon-zoom-particles group-hover:animate-glow-blue",
  },
  {
    label: "Contact",
    href: "/contact",
    icon: Mail,
    iconColor: "text-[#E88B9E]",
    animationClass: "group-hover:animate-icon-tilt-flip",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    return null;
  }

  return (
    <aside className="group fixed left-0 top-0 z-40 h-screen w-16 lg:w-20 border-r border-border/50 glass-sm transition-all duration-300 hover:w-[240px] lg:hover:w-[280px] overflow-hidden">
      <div className="flex h-full flex-col overflow-y-auto">
        {/* Logo Section */}
        <div className="flex items-center justify-between px-3 lg:px-4 py-4 border-b border-border/50 group-hover:px-4">
          <Link
            href="/"
            className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
          >
            <div className="relative h-8 w-8 shrink-0">
              <Image
                src={theme === "light" ? "/logo/white.png" : "/logo/black.png"}
                alt="Uxie Logo"
                fill
                className="object-contain transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(91,127,238,0.6)] dark:hover:drop-shadow-[0_0_8px_rgba(110,205,193,0.6)]"
                priority
              />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm font-semibold">
              Uxie
            </span>
          </Link>
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-md transition-all duration-300 shrink-0",
              "hover:scale-110 hover:rotate-180",
              theme === "light"
                ? "text-primary hover:text-primary/80"
                : "text-[#6ECDC1] hover:text-[#6ECDC1]/80",
            )}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-2 px-2 lg:px-3 pt-5 pb-5 group-hover:px-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group/item flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-250",
                  "hover:bg-accent/30",
                  isActive
                    ? "bg-[#E6D9F3]/60 dark:bg-[#3D2D5C]/60 border-l-[3px] border-primary text-primary"
                    : "text-foreground bg-transparent",
                )}
                title={item.label}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-all duration-250",
                    !isActive && item.iconColor,
                    "group-hover/item:scale-[1.15]",
                    item.animationClass,
                    isActive && "text-primary",
                  )}
                />
                <span
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap",
                    "group-hover/item:translate-x-1",
                    isActive && "text-primary font-medium",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
