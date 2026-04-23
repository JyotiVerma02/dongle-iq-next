"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

import Navbar from "@/components/navbar";
import ParticleBackground from "@/components/ParticleBackground";
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

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showEffects = !EFFECTS_DISABLED_PATHS.has(pathname);

  return (
    <>
      {showEffects ? <ParticleBackground /> : null}
      <Navbar />
      <div className="relative z-10">{children}</div>
      {showEffects ? <CursorEffect /> : null}
      <Toaster position="top-right" />
    </>
  );
}
