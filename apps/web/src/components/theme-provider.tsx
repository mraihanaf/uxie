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

function getInitialTheme(): Theme {
  // This function will be called during SSR and initial client render
  if (typeof window === "undefined") return "light";

  // Check if theme was already set by the inline script
  const htmlElement = document.documentElement;
  if (htmlElement.classList.contains("dark")) return "dark";
  if (htmlElement.classList.contains("light")) return "light";

  // Fallback to localStorage or system preference
  const stored = localStorage.getItem("uxie-theme") as Theme | null;
  if (stored) return stored;

  return getSystemTheme();
}

export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode;
} & React.ComponentProps<"div">) {
  // Initialize with theme from script/localStorage to avoid flash
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Sync with what was already set by the inline script
    const root = window.document.documentElement;
    const currentTheme = root.classList.contains("dark") ? "dark" : "light";
    setTheme(currentTheme);

    // Listen for system theme changes (only if user hasn't manually set a theme)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const checkAndUpdateTheme = () => {
      const stored = localStorage.getItem("uxie-theme") as Theme | null;
      if (!stored) {
        // No manual preference - follow system
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        setTheme(systemTheme);
        root.classList.remove("light", "dark");
        root.classList.add(systemTheme);
      }
    };

    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("uxie-theme") as Theme | null;
      if (!stored) {
        // Only auto-update if user hasn't manually set a preference
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
      }
    };

    // Check on mount to ensure we're following system if no manual preference
    checkAndUpdateTheme();

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
