"use client";

import * as React from "react";
import Image from "next/image";
import { Home, Info, LayoutDashboard } from "lucide-react";
import { SettingsButton } from "@/app/settings/settings-button";
import { SettingsModal } from "@/app/settings/settings-modal";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { t } = useLanguage();

  const navigationItems = [
    {
      href: "/home",
      icon: Home,
      label: t("common.home"),
      iconColor: "text-[#6ECDC1]",
      animationClass: "group-hover:animate-icon-rotate-bounce",
    },
    {
      href: "/about",
      icon: Info,
      label: t("common.about"),
      iconColor: "text-primary",
      animationClass: "group-hover:animate-icon-pulse-jitter",
    },
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: t("common.dashboard"),
      iconColor: "text-[#E6D9F3] dark:text-[#E6D9F3]",
      animationClass:
        "group-hover:animate-icon-zoom-particles group-hover:animate-glow-blue",
    },
  ];

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      <aside className="group fixed left-0 top-0 z-40 h-screen w-16 lg:w-20 border-r border-border/50 glass-sm transition-all duration-300 hover:w-[240px] lg:hover:w-[280px] overflow-hidden">
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-3 lg:px-4 py-4 border-b border-border/50 group-hover:px-4">
            <Link href="/home" className="flex items-center gap-2">
              <div className="relative h-8 w-8 shrink-0">
                <Image
                  src="/logo/uxie.png"
                  alt="Uxie Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm font-semibold">
                Uxie
              </span>
            </Link>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-2 px-2 lg:px-3 pt-5 pb-5 group-hover:px-4">
            {navigationItems.map((item) => {
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

          {/* Settings Button - Bottom */}
          <div className="mt-auto pb-4 px-2 lg:px-3 group-hover:px-4">
            <SettingsButton
              onClick={() => setIsSettingsOpen(true)}
              isActive={isSettingsOpen}
            />
          </div>
        </div>
      </aside>
      {isSettingsOpen && (
        <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      )}
    </>
  );
}
