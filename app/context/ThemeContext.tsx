"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

// 1. Define what data our "Theme Brain" will hold
const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("dongle-iq-theme");
      return savedTheme ? savedTheme === "dark" : false;
    }
    return false;
  });

  // 3. Function to switch themes and save the choice
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const nextTheme = !prev;
      localStorage.setItem("dongle-iq-theme", nextTheme ? "dark" : "light");
      return nextTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. Custom hook to easily use the theme in any component
export const useTheme = () => useContext(ThemeContext);