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

const HIDE_NAVBAR_PATHS = new Set(["/admin/dashboard"]);


const NO_OFFSET_PATHS = new Set<string>([
  "/admin/dashboard",
  
]);

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || ""; 

  // Logic checks
  const showEffects = !EFFECTS_DISABLED_PATHS.has(pathname);
  const showNavbar = !HIDE_NAVBAR_PATHS.has(pathname);
  
  
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