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

export function ThemeProvider({
  children,
  defaultTheme = "light",
  ...props
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
} & React.ComponentProps<"div">) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  React.useEffect(() => {
    const stored = localStorage.getItem("uxie-theme") as Theme | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

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
