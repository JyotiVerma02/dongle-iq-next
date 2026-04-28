"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

import Navbar from "@/components/navbar";
import CursorEffect from "@/components/CursorEffect";

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
  "/admin/dashboard",
]);

const USE_SHELL_OFFSET_PATHS = new Set([
  "/admin/dashboard",
]);

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showEffects = !EFFECTS_DISABLED_PATHS.has(pathname);
  const showNavbar = !HIDE_NAVBAR_PATHS.has(pathname);
  const useShellOffset = showNavbar && !USE_SHELL_OFFSET_PATHS.has(pathname);

  return (
    <>
      {showNavbar ? <Navbar /> : null}
      <div className={useShellOffset ? "app-shell-content relative z-10" : "relative z-10"}>
        {children}
      </div>
      {showEffects ? <CursorEffect /> : null}
      <Toaster position="top-right" />
    </>
  );
}
