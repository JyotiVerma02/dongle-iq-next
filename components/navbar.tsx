"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cpu, LogIn, LogOut, Menu, Moon, SunMedium, X } from "lucide-react";

import { ThemeProvider, useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

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
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/admin/register",
]);

const LOGOUT_ROUTES = new Set([
  "/user/dashboard",
  "/verify",
  "/verify-aadhaar",
  "/bank-telecom-form",
  "/preview",
]);

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      setIsScrolled(window.scrollY > 8);
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
  const themeIcon = isDarkMode ? <SunMedium size={18} /> : <Moon size={18} />;

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
         className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-3xl border px-3 py-3 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.45)] backdrop-blur-2xl sm:px-4"
        style={{
          backgroundColor: "var(--nav)",
          borderColor: colors.borderSoft,
        }}
      >
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`,
              boxShadow: `0 16px 30px -18px ${colors.accentShadow}`,
            }}
          >
            <Cpu size={18} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[1.05rem] font-semibold tracking-[0.01em]">
              Dongle<span style={{ color: colors.accent }}>IQ</span>
            </p>
            <p className="truncate text-[0.72rem]" style={{ color: colors.subtleText }}>
              Secure digital onboarding
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-[0.92rem] font-medium hover:-translate-y-0.5"
              style={{ color: colors.muted }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {showAuthButtons ? (
            <button
              onClick={() => router.push("/login")}
              className="hidden min-h-11 items-center gap-2 rounded-xl px-4 text-[0.9rem] font-semibold text-white sm:inline-flex"
              style={{
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`,
                boxShadow: `0 16px 28px -20px ${colors.accentShadow}`,
              }}
            >
              <LogIn size={16} />
              Login
            </button>
          ) : null}

          {showLogout ? (
            <button
              onClick={handleLogout}
              className="hidden min-h-11 items-center gap-2 rounded-full border px-4 text-[0.9rem] font-semibold sm:inline-flex"
              style={{
                backgroundColor: colors.card,
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
            className="flex h-11 w-11 items-center justify-center rounded-full border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.borderSoft,
            }}
          >
            {themeIcon}
          </button>

          <button
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-full border lg:hidden"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.borderSoft,
            }}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div
          className="mx-auto mt-3 max-w-7xl rounded-3xl border p-3 backdrop-blur-2xl lg:hidden"
          style={{
            backgroundColor: "var(--overlay)",
            borderColor: colors.borderSoft,
          }}
        >
          <div className="grid gap-2">
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium"
                style={{
                  backgroundColor: colors.card,
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
                router.push("/login");
                setIsMenuOpen(false);
              }}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`,
                boxShadow: `0 16px 28px -20px ${colors.accentShadow}`,
              }}
            >
              <LogIn size={16} />
              Login
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
