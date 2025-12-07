"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <main
      className={cn(
        "flex-1 min-h-screen transition-all duration-300",
        !isAuthPage && "ml-16 lg:ml-20",
      )}
    >
      {children}
    </main>
  );
}
