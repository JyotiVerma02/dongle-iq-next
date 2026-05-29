/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  isDarkMode: boolean;
  mounted: boolean;
  toggleTheme: () => void;
};

type ThemeProviderProps = {
  children: React.ReactNode;
  initialTheme: Theme;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "dongle-iq-theme";

const getStoredTheme = (): Theme | null => {
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${STORAGE_KEY}=([^;]*)`)
    );
    const saved = match ? decodeURIComponent(match[1]) : null;
    return saved === "dark" || saved === "light" ? saved : null;
  } catch {
    return null;
  }
};

const getResolvedTheme = (): Theme => {
  if (typeof window === "undefined") return "light";

  const documentTheme = document.documentElement.dataset.theme;
  if (documentTheme === "dark" || documentTheme === "light") {
    return documentTheme;
  }

  const saved = getStoredTheme();
  if (saved) return saved;

  if (document.documentElement.classList.contains("dark")) return "dark";
  return "light";
};

export const ThemeProvider = ({ children, initialTheme }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const resolved = getResolvedTheme();
    setTheme(resolved);
    
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.remove("light");
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.colorScheme = "light";
    }
    root.dataset.theme = resolved;
    root.setAttribute("data-theme-ready", "true");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      document.cookie = `${STORAGE_KEY}=${nextTheme}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // Ignore storage errors
    }
    const root = document.documentElement;
    if (nextTheme === "dark") {
      root.classList.remove("light");
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.colorScheme = "light";
    }
    root.dataset.theme = nextTheme;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDarkMode: theme === "dark",
        mounted,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
};
