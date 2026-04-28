"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  isDarkMode: boolean;
  mounted: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  isDarkMode: false,
  mounted: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = "dongle-iq-theme";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted state and restore theme from localStorage
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedTheme = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
      const initialTheme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "light";
      setThemeState(initialTheme);
      
      // Apply theme immediately
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(initialTheme);
      root.style.colorScheme = initialTheme;
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      root.style.colorScheme = theme;
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme, mounted]);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
  };

  const toggleTheme = () => {
    setThemeState((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const value = useMemo(
    () => ({
      theme,
      isDarkMode: theme === "dark",
      mounted,
      setTheme,
      toggleTheme,
    }),
    [theme, mounted]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
