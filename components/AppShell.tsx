"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

import Navbar from "@/components/navbar";
import CursorEffect from "@/components/CursorEffect";

/** * Configurations moved outside component for performance.
 * This prevents the Sets from being re-allocated on every re-render.
 */
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

const HIDE_NAVBAR_PATHS = new Set(["/admin/dashboard"]);

/**
 * Paths that should NOT have the top padding (offset).
 * Explicitly typed as <string> to avoid the TypeScript 'never' error.
 */
const NO_OFFSET_PATHS = new Set<string>([
  "/admin/dashboard",
  // Add other full-screen or custom layout paths here
]);

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || ""; // Fallback to empty string for safety

  // Logic checks
  const showEffects = !EFFECTS_DISABLED_PATHS.has(pathname);
  const showNavbar = !HIDE_NAVBAR_PATHS.has(pathname);
  
  // Only apply the "app-shell-content" padding if navbar is visible 
  // AND the path isn't explicitly excluded from offsets.
  const useShellOffset = showNavbar && !NO_OFFSET_PATHS.has(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      
      <main
        className={`relative z-10 transition-all duration-300 ${
          useShellOffset ? "app-shell-content" : ""
        }`}
      >
        {children}
      </main>

      {showEffects && <CursorEffect />}
      
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'dark:bg-zinc-900 dark:text-white border border-white/10',
          duration: 4000,
        }}
      />
    </>
  );
}