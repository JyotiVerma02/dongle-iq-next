"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

import Navbar from "@/components/navbar";
import CursorEffect from "@/components/CursorEffect";
import PremiumBackground from "@/components/PremiumBackground";

const EFFECTS_DISABLED_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/verify-aadhaar",
  "/preview",
  "/user/dashboard",
  "/admin/dashboard",
]);

const HIDE_NAVBAR_PATHS = new Set([
  "/verify",
  "/verify-aadhaar",
  "/bank-telecom-form",
  "/preview",
  "/user/dashboard",
  "/admin/dashboard",
]);

const BACKGROUND_DISABLED_PATHS = new Set<string>();

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

  // ✅ Normalize path (fixes trailing slash + query bugs)
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "");

  const showEffects = !EFFECTS_DISABLED_PATHS.has(cleanPath);
  const showNavbar = !shouldHideNavbar(cleanPath);
  const showBackground = !BACKGROUND_DISABLED_PATHS.has(cleanPath);

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      {showBackground && <PremiumBackground />}
      {showNavbar && <Navbar />}

      <main id="main-content"
        className={`relative z-10 transition-all duration-300 ${showNavbar ? "app-shell-content" : ""}`}
      >
        {children}
      </main>

      {showEffects && <CursorEffect />}

      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "dark:bg-zinc-900 dark:text-white border border-white/10",
          duration: 4000,
        }}
      />
    </>
  );
  
}
