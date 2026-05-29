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
  UserPlus,
  X,
} from "lucide-react";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

const NAV_LINKS = [
  { label: "Why us", href: "/#whyus" },
  { label: "Apply", href: "/#apply" },
  { label: "Agents", href: "/#agents" },
  { label: "FAQs", href: "/#faqs" },
  { label: "Contact", href: "/#contact" },
];

const AUTH_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/admin/register",
]);

const LOGOUT_ROUTES = new Set([
  "/verify",
  "/verify-aadhaar",
  "/bank-telecom-form",
  "/preview",
]);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode, mounted, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

 if (
  pathname === "/admin/dashboard" ||
  pathname === "/admin/create-application"
) {
  return null;
}

  const colors = getThemePalette(isDarkMode);
  const showAuthButtons = AUTH_ROUTES.has(pathname);
  const showLogout = LOGOUT_ROUTES.has(pathname);
  const themeIcon = !mounted ? null : isDarkMode ? <SunMedium size={18} /> : <Moon size={18} />;
  const authAction =
    pathname === "/login"
      ? { href: "/register", label: "Register", icon: <UserPlus size={16} /> }
      : pathname === "/register" || pathname === "/signup"
        ? { href: "/login", label: "Login", icon: <LogIn size={16} /> }
        : { href: "/login", label: "Login", icon: <LogIn size={16} /> };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // Keep the user moving even if logout request fails.
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <nav
      className="theme-transition fixed inset-x-0 top-0 z-50 px-3 pt-2 sm:px-4"
      style={{ color: colors.text }}
    >
      <div
         className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full border px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-500 ease-in-out mt-4 sm:px-5"
        style={{
          backgroundColor: isDarkMode ? "rgba(11, 11, 18, 0.75)" : "rgba(255, 255, 255, 0.75)",
          borderColor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        <Link href="/" className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`,
              boxShadow: `0 16px 30px -18px ${colors.accentShadow}`,
            }}
          >
            <Cpu size={18} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[1.05rem] font-semibold tracking-wide" style={{ color: colors.text }}>
              Dongle<span style={{ color: colors.accent }}>IQ</span>
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group relative px-4 py-2 text-[0.9rem] font-medium transition-colors"
              style={{ color: colors.muted }}
            >
              <span className="group-hover:opacity-100 opacity-80 transition-opacity" style={{ color: colors.text }}>
                {item.label}
              </span>
              <span 
                className="absolute bottom-1 left-4 right-4 h-[2px] scale-x-0 rounded-full transition-transform duration-300 ease-out group-hover:scale-x-100" 
                style={{ backgroundColor: colors.accent }}
              />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {showAuthButtons ? (
            <button
              onClick={() => router.push(authAction.href)}
              className="hidden min-h-11 items-center gap-2 rounded-xl px-4 text-[0.9rem] font-semibold text-white sm:inline-flex"
              style={{
                background: colors.accent,
                boxShadow: `0 22px 40px -24px ${colors.accentShadow}, 0 0 32px -10px ${colors.accentShadow}`,
              }}
            >
              {authAction.icon}
              {authAction.label}
            </button>
          ) : null}

          {showLogout ? (
            <button
              onClick={handleLogout}
              className="hidden min-h-11 items-center gap-2 rounded-xl border px-4 text-[0.9rem] font-semibold sm:inline-flex"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08)), var(--card)",
                borderColor: colors.borderSoft,
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : null}

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="flex h-11 w-11 items-center justify-center rounded-xl border shadow-[0_16px_28px_-24px_var(--accent-shadow)]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08)), var(--card)",
              borderColor: colors.borderSoft,
            }}
          >
            {themeIcon}
          </button>

          <button
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-xl border shadow-[0_16px_28px_-24px_var(--accent-shadow)] lg:hidden"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08)), var(--card)",
              borderColor: colors.borderSoft,
            }}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div
          className="ud-enter mx-auto mt-3 max-w-7xl rounded-[1.35rem] border p-3 shadow-[0_28px_80px_-40px_var(--accent-shadow)] backdrop-blur-2xl lg:hidden"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.10)), var(--overlay)",
            borderColor: colors.borderSoft,
          }}
        >
          <div className="grid gap-2">
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium shadow-[0_16px_28px_-26px_var(--accent-shadow)]"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08)), var(--card)",
                  color: colors.text,
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {showAuthButtons ? (
            <button
              onClick={() => {
                router.push(authAction.href);
                setIsMenuOpen(false);
              }}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`,
                boxShadow: `0 16px 28px -20px ${colors.accentShadow}`,
              }}
            >
              {authAction.icon}
              {authAction.label}
            </button>
          ) : null}

          {showLogout ? (
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border text-sm font-semibold"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.borderSoft,
                color: colors.text,
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
