"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

import Navbar from "@/components/navbar";

const HIDE_NAVBAR_PATHS = new Set([
  "/verify",
  "/bank-telecom-form",
  "/preview",
  "/user/dashboard",
  "/admin/dashboard",
  "/apply-dsc",
]);

const HIDE_NAVBAR_PREFIXES = ["/admin/dashboard", "/admin/create-application", "/user"];

function shouldHideNavbar(pathname: string) {
  if (HIDE_NAVBAR_PATHS.has(pathname)) {
    return true;
  }

  return HIDE_NAVBAR_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  // âœ… Normalize path (fixes trailing slash + query bugs)
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "");

  const showNavbar = !shouldHideNavbar(cleanPath);

  return (
    <>
      {/* <a href="#main-content" className="skip-to-content">
        Skip to content
      </a> */}
      {showNavbar && <Navbar />}

      <main
        id="main-content"
        className={`relative z-10 min-h-dvh overflow-x-hidden transition-all duration-300 ${showNavbar ? "app-shell-content" : ""}`}
      >
        {children}
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: colors.card,
            color: colors.text,
            border: `1px solid ${colors.borderSoft}`,
            borderRadius: "14px",
            boxShadow: "0 18px 48px rgba(15,23,42,0.18)",
          },
        }}
      />
    </>
  );
}





