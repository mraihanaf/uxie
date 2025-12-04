"use client";

import * as React from "react";

type Theme = "light" | "dark";

interface ThemeProviderContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeProviderContext = React.createContext<
  ThemeProviderContextValue | undefined
>(undefined);

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ComponentProps<"div">) {
  const [theme, setTheme] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Check localStorage first, if not found, use system theme
    const stored = localStorage.getItem("uxie-theme") as Theme | null;
    const initialTheme = stored || getSystemTheme();
    setTheme(initialTheme);

    // Listen for system theme changes (only if user hasn't manually set a theme)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("uxie-theme") as Theme | null;
      if (!stored) {
        // Only auto-update if user hasn't manually set a preference
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  React.useEffect(() => {
    if (mounted) {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [theme, mounted]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem("uxie-theme", newTheme);
      },
      toggleTheme: () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("uxie-theme", newTheme);
      },
    }),
    [theme],
  );

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
