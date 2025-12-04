"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export function NavigationBar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 h-14 md:h-16 glass border-b border-border/50 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-5 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8 md:h-8 md:w-8">
            <Image
              src="/logo/uxie.png"
              alt="Uxie Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Menu Links */}
        {!isAuthPage && (
          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium text-foreground transition-all duration-150",
                  "hover:scale-[1.02] hover:border-b-2 hover:border-primary",
                  pathname === item.href && "border-b-2 border-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Hamburger Menu (Mobile Only) */}
          {!isAuthPage && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-primary transition-all duration-200 hover:scale-110 hover:text-primary/80"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-md transition-all duration-300",
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
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && !isAuthPage && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity duration-250"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-[280px] glass-sm border-r border-border/50 p-5 transition-transform duration-250 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium text-foreground transition-all duration-150",
                    "hover:bg-accent/50",
                    pathname === item.href &&
                      "bg-accent/50 border-l-[3px] border-primary",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
