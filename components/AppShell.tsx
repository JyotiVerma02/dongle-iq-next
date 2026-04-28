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
 const NO_OFFSET_PATHS = new Set([
  "/", // landing page
]);

const useShellOffset = showNavbar && !NO_OFFSET_PATHS.has(pathname);

  return (
    <>
      {showNavbar ? <Navbar /> : null}
    <div
  className={`relative z-10 ${
    useShellOffset ? "app-shell-content" : ""
  }`}
>
  <div className="container-shell">
    {children}
  </div>
</div>
      {showEffects ? <CursorEffect /> : null}
      <Toaster position="top-right" />
    </>
  );
}
