"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Cpu,
  LogIn,
  LogOut,
  Menu,
  Moon,
  SunMedium,
  X,
} from "lucide-react";

import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { mounted, isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

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
  const themeLabel = "Toggle theme";
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

  const navHrefMap: Record<string, string> = {
    Apply: "/#apply",
    "Why Us": "/#whyus",
    Agents: "/#agents",
    FAQs: "/#faqs",
    Contact: "/#contact",
  };

  const themeIcon = mounted && isDarkMode ? <SunMedium size={18} /> : <Moon size={18} />;

  return (
    <nav
      className="theme-transition fixed top-0 z-50 w-full border-b px-5 py-3.5 backdrop-blur-2xl"
      style={{
        backgroundColor: "var(--nav)",
        borderColor: colors.borderSoft,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <Link href="/" className="group flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md shadow-lg transition-all duration-500 group-hover:rotate-180 sm:h-11 sm:w-11"
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

        <div className="hidden items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href={navHrefMap[link]}
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

        <div className="flex items-center gap-2 sm:gap-3">
          {showAuthButtons && (
            <button
              onClick={() => router.push("/login")}
              className="theme-transition flex items-center gap-2 rounded-md px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white sm:px-5 sm:py-2 sm:text-[11px]"
              style={{
                backgroundColor: colors.accent,
                boxShadow: `0 4px 12px ${colors.accentShadow}`,
              }}
            >
              <LogIn size={14} /> <span className="hidden sm:inline">Login</span>
            </button>
          )}

          {showLogout ? (
            <button
              onClick={handleLogout}
              className="theme-transition flex items-center gap-2 rounded-md px-3 py-2 text-[10px] font-black uppercase tracking-widest sm:px-4 sm:py-2 sm:text-[11px]"
              style={{
                color: colors.text,
                backgroundColor: colors.panel,
                border: `1px solid ${colors.borderSoft}`,
              }}
            >
              <LogOut size={14} /> <span className="hidden xs:inline">Logout</span>
            </button>
          ) : null}

          <button
            onClick={() => {
              toggleTheme();
            }}
            aria-label={themeLabel}
            title={themeLabel}
            className="theme-transition rounded-md border p-2.5 transition-all duration-300"
            style={{
              color: colors.text,
              backgroundColor: colors.panel,
              borderColor: colors.borderSoft,
            }}
          >
            {themeIcon}
          </button>

          <button
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="theme-transition rounded-md border p-2.5 sm:hidden"
            style={{
              color: colors.text,
              backgroundColor: colors.panel,
              borderColor: colors.borderSoft,
            }}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div
          className="mx-auto mt-4 flex max-w-7xl flex-col gap-4 rounded-2xl border p-4 sm:hidden"
          style={{
            borderColor: colors.borderSoft,
            backgroundColor: colors.card,
          }}
        >
          <div className="flex flex-col gap-3 text-[11px] font-black uppercase tracking-[0.22em]">
            {navLinks.map((link) => (
              <a
                key={link}
                href={navHrefMap[link]}
                className="rounded-lg px-3 py-2"
                style={{ color: colors.text, backgroundColor: colors.panel }}
              >
                {link}
              </a>
            ))}
          </div>

          {showAuthButtons ? (
            <button
              onClick={() => {
                router.push("/login");
                setIsMenuOpen(false);
              }}
              className="theme-transition flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-all duration-200"
              style={{
                backgroundColor: colors.accent,
                boxShadow: `0 4px 12px ${colors.accentShadow}`,
              }}
            >
              <LogIn size={14} /> Login
            </button>
          ) : null}

          {showLogout ? (
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="theme-transition flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all duration-200"
              style={{
                color: colors.text,
                backgroundColor: colors.panel,
                borderColor: colors.borderSoft,
              }}
            >
              <LogOut size={14} /> Logout
            </button>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
