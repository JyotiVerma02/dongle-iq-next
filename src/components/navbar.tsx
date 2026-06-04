"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  LogIn,
  LogOut,
  Menu,
  Moon,
  SunMedium,
  UserPlus,
  X,
} from "lucide-react";

import BrandLogo from "@/components/BrandLogo";
import { useTheme } from "@/components/ThemeContext";
import { useRealtimeEvents } from "@/lib/useRealtimeEvents";

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

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode, mounted, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsMenuOpen(false);
    setNotificationOpen(false);
  }, [pathname]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("mobile-menu-open", isMenuOpen);

    return () => {
      html.classList.remove("mobile-menu-open");
    };
  }, [isMenuOpen]);

  const refreshNotifications = useCallback(async () => {
    console.log("[navbar:refresh]", { reason: "manual-or-scheduled" });
    try {
      const res = await fetch("/api/notifications");

      if (!res.ok) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const data = (await res.json()) as {
        notifications?: NotificationItem[];
        unreadCount?: number;
      };

      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const scheduleRefreshNotifications = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    refreshTimerRef.current = setTimeout(() => {
      void refreshNotifications();
    }, 75);
  }, [refreshNotifications]);

  const handleRealtimeEvent = useCallback(
    (event: { type: string }) => {
      console.log("[navbar:realtime]", event);

      const refreshEvents = new Set([
        "NOTIFICATION_CREATED",
        "STATUS_UPDATE",
        "APPLICATION_UPDATED",
        "PAYMENT_UPDATED",
        "SUPPORT_TICKET_UPDATED",
      ]);

      if (refreshEvents.has(event.type)) {
        scheduleRefreshNotifications();
      }
    },
    [scheduleRefreshNotifications],
  );

  useEffect(() => {
    void refreshNotifications();
  }, [refreshNotifications]);

  useRealtimeEvents(handleRealtimeEvent);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  if (
    pathname === "/admin/dashboard" ||
    pathname === "/admin/create-application"
  ) {
    return null;
  }

  const showAuthButtons = AUTH_ROUTES.has(pathname);
  const showLogout = LOGOUT_ROUTES.has(pathname);
  const themeIcon = !mounted ? null : isDarkMode ? (
    <SunMedium size={18} />
  ) : (
    <Moon size={18} />
  );
  const authAction =
    pathname === "/login"
      ? { href: "/register", label: "Register", icon: <UserPlus size={16} /> }
      : pathname === "/register" || pathname === "/signup"
        ? { href: "/login", label: "Login", icon: <LogIn size={16} /> }
        : { href: "/login", label: "Login", icon: <LogIn size={16} /> };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });

    router.replace("/login");
    router.refresh();
  };

  return (
    <nav className="navbar-coder">
      <div className="navbar-coder-content mx-auto flex w-full max-w-7xl flex-nowrap items-center justify-between gap-2 px-3 py-3 sm:px-4 lg:px-8">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <BrandLogo size="md" />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="nav-link group relative px-4 py-2 text-[0.9rem] font-medium transition-colors"
              style={{ color: "var(--muted)" }}
            >
              <span
                className="nav-link-label opacity-80 transition-opacity group-hover:opacity-100"
                style={{ color: "var(--foreground)" }}
              >
                {item.label}
              </span>
              <span
                className="absolute bottom-1 left-4 right-4 h-[2px] scale-x-0 rounded-full transition-transform duration-300 ease-out group-hover:scale-x-100"
                style={{ backgroundColor: "var(--accent)" }}
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
                backgroundColor: "var(--accent)",
                boxShadow: "0 18px 34px -22px var(--accent-shadow)",
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
                backgroundColor: "var(--card)",
                borderColor: "var(--border-soft)",
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : null}

          <div className="relative hidden md:block">
            <button
              onClick={() => setNotificationOpen((prev) => !prev)}
              aria-label="Open notifications"
              aria-expanded={notificationOpen}
              className="nav-action flex h-11 w-11 items-center justify-center rounded-xl border shadow-[0_16px_28px_-24px_var(--accent-shadow)]"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border-soft)",
              }}
            >
              <Bell size={18} />

              {unreadCount > 0 ? (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {unreadCount}
                </span>
              ) : null}
            </button>

            {notificationOpen ? (
              <div
                className="absolute right-0 top-14 z-50 w-80 rounded-xl border p-3 shadow-[0_24px_60px_-30px_var(--accent-shadow)]"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border-soft)",
                }}
              >
                <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                  Notifications
                </h3>

                <div className="max-h-72 space-y-2 overflow-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item._id}
                        role="button"
                        tabIndex={0}
                        onClick={() => markNotificationRead(item._id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            void markNotificationRead(item._id);
                          }
                        }}
                        className={`cursor-pointer rounded-lg border p-2 transition-colors ${
                          item.isRead ? "opacity-70" : "font-semibold"
                        }`}
                        style={{
                          backgroundColor: item.isRead
                            ? "transparent"
                            : "rgba(59,130,246,.08)",
                          borderColor: "var(--border-soft)",
                        }}
                      >
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          {item.title}
                        </div>
                        <div className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          {item.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="nav-action flex h-11 w-11 items-center justify-center rounded-xl border shadow-[0_16px_28px_-24px_var(--accent-shadow)]"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border-soft)",
            }}
          >
            {themeIcon}
          </button>

          <button
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="nav-action flex h-11 w-11 items-center justify-center rounded-xl border shadow-[0_16px_28px_-24px_var(--accent-shadow)] md:hidden"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border-soft)",
            }}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div
          className="mobile-menu-container mx-auto mt-3 rounded-[1.35rem] border p-3 shadow-[0_28px_80px_-40px_var(--accent-shadow)] backdrop-blur-2xl lg:hidden"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--overlay) 88%, transparent)",
            borderColor: "var(--border-soft)",
            boxShadow:
              "0 20px 60px -34px var(--accent-shadow), inset 0 1px 0 rgba(255,255,255,0.12)",
          }}
        >
          <div className="grid gap-2">
            {NAV_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="rounded-2xl px-4 py-3 text-sm font-medium shadow-[0_16px_28px_-26px_var(--accent-shadow)]"
                style={{
                  backgroundColor: "var(--card)",
                  color: "var(--foreground)",
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
                backgroundColor: "var(--accent)",
                boxShadow: "0 16px 28px -20px var(--accent-shadow)",
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
                backgroundColor: "var(--card)",
                borderColor: "var(--border-soft)",
                color: "var(--foreground)",
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
