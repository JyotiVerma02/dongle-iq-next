"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cpu, LogIn, LogOut, Moon, SunMedium } from "lucide-react";

import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { mounted, isDarkMode, toggleTheme } = useTheme();

  if (pathname === "/admin/dashboard") {
    return null;
  }

  const colors = getThemePalette(isDarkMode);
  const navLinks = ["Apply", "Why Us", "Agents", "FAQs", "Contact"];
  const showAuthButtons = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password"
].includes(pathname);
  const themeLabel = mounted ? (isDarkMode ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme";
  const showLogout = [
    "/user/dashboard",
    "/verify",
    "/verify-aadhaar",
    "/bank-telecom-form",
    "/preview",
  ].includes(pathname);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // Redirect even if the request fails so the user is not stuck.
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <nav
      className="theme-transition fixed top-0 z-50 w-full border-b p-5 backdrop-blur-2xl"
      style={{
        backgroundColor: "var(--nav)",
        borderColor: colors.borderSoft,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-md shadow-lg transition-all duration-500 group-hover:rotate-180"
            style={{
              backgroundColor: colors.accent,
              boxShadow: `0 0 24px ${colors.glow}`,
            }}
          >
            <Cpu size={20} className="text-white" />
          </div>

          <span className="text-xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>
            Dongle<span style={{ color: colors.accentLight }}>IQ</span>
          </span>
        </Link>

        <div className="hidden items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`/#${link.toLowerCase().replace(" ", "")}`}
              className="relative group transition-all duration-300"
              style={{ color: colors.muted }}
            >
              {link}
              <span
                className="absolute -bottom-1 left-0 h-px w-0 transition-all group-hover:w-full"
                style={{ backgroundColor: colors.accent }}
              />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
         {showAuthButtons && (
  <>
    <button
      onClick={() => router.push("/login")}
      className="hidden items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors sm:flex"
      style={{ color: colors.muted }}
    >
      <LogIn size={14} /> Login
    </button>

    <button
      onClick={() => router.push("/signup")}
      className="theme-transition rounded-md px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white"
      style={{
        backgroundColor: colors.accent,
        boxShadow: `0 4px 12px ${colors.accentShadow}`,
      }}
    >
      Register
    </button>
  </>
)}

          {showLogout ? (
            <button
              onClick={handleLogout}
              className="theme-transition hidden items-center gap-2 rounded-md px-4 py-2.5 text-[11px] font-black uppercase tracking-widest sm:flex"
              style={{
                color: colors.text,
                backgroundColor: colors.panel,
                border: `1px solid ${colors.borderSoft}`,
              }}
            >
              Logout
            </button>
          ) : null}

          <button
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
            className="theme-transition rounded-md border p-3"
            style={{
              color: colors.text,
              backgroundColor: colors.panel,
              borderColor: colors.borderSoft,
            }}
          >
            {mounted && isDarkMode ? <SunMedium size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
