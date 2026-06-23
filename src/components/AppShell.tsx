"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

import Navbar from "@/components/navbar";

const HIDE_NAVBAR_PATHS = new Set([
  "/verify",
  "/verify-aadhaar",
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

  // ✅ Normalize path (fixes trailing slash + query bugs)
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
          className:
            "rounded-xl border border-white/10 bg-white/95 px-4 py-3 text-sm text-slate-800 shadow-[0_18px_48px_rgba(15,23,42,0.18)] backdrop-blur-md dark:bg-zinc-900/95 dark:text-white",
          duration: 4000,
        }}
      />
    </>
  );
}
