"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Loader2,
  Menu,
  Moon,
  RefreshCw,
  SunMedium,
} from "lucide-react";

import { useTheme } from "@/components/ThemeContext";
import type { AdminProfile } from "@/components/admin-dashboard/types";

export function Header({
  admin,
  onSidebarToggle,
  onRefresh,
  onLogout,
  refreshing,
  onOpenAdminSettings,
}: {
  admin: AdminProfile | null;
  onSidebarToggle: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  refreshing: boolean;
  onOpenAdminSettings: () => void;
}) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const colors = {
    text: "var(--foreground)",
    muted: "var(--muted)",
    subtleText: "var(--subtle-text)",
    panel: "var(--card)",
    overlay: "var(--overlay)",
  };

  const adminInitials = useMemo(() => {
    const name = admin?.name?.trim();
    if (!name) return "A";
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [admin?.name]);

  return (
    <header
      className="theme-transition sticky top-0 z-30 flex flex-col gap-3 border-b px-4 py-3 backdrop-blur-xl sm:flex-row sm:items-start sm:justify-between lg:px-6"
      style={{
        borderColor: "var(--border-soft)",
        backgroundColor: colors.overlay,
        boxShadow: "0 14px 36px -28px var(--accent-shadow)",
        overflow: "visible",
      }}
    >
      <div className="flex min-w-0 items-start gap-3">
        <button
          onClick={onSidebarToggle}
          className="theme-transition flex h-10 w-10 items-center justify-center rounded-xl border transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_var(--accent-shadow)]"
          style={{
            borderColor: "var(--border-soft)",
            backgroundColor: colors.panel,
            color: colors.text,
          }}
        >
          <Menu size={18} />
        </button>

        <div className="flex min-w-0 flex-col">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: colors.subtleText }}
          >
            Admin workspace
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
            <span className="break-words" style={{ color: "var(--accent)" }}>
              Support call: 020-49105678, 7777090977
            </span>
            <span className="break-all" style={{ color: colors.muted }}>
              Support Email: info@dongleiq.com
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-end gap-2 self-stretch sm:w-auto sm:gap-3 sm:self-center lg:self-auto">
        <button
          onClick={toggleTheme}
          className="theme-transition inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_var(--accent-shadow)]"
          style={{
            borderColor: "var(--border-soft)",
            backgroundColor: colors.panel,
            color: colors.text,
          }}
        >
          {isDarkMode ? <SunMedium size={16} /> : <Moon size={16} />}
          {isDarkMode ? "Light" : "Dark"}
        </button>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="theme-transition inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_var(--accent-shadow)] disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            borderColor: "var(--border-soft)",
            backgroundColor: colors.panel,
            color: colors.text,
          }}
        >
          {refreshing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          Refresh
        </button>

        <div
          className="theme-transition rounded-xl border p-2.5"
          style={{
            borderColor: "var(--border-soft)",
            backgroundColor: colors.panel,
            color: colors.text,
          }}
        >
          <Bell size={18} />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            className="theme-transition flex h-12 min-w-[52px] items-center justify-center rounded-xl border px-3 sm:h-[70px] sm:min-w-[70px] sm:px-4"
            style={{
              borderColor: isDarkMode
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.06)",
              backgroundColor: colors.panel,
              color: isDarkMode ? "#ffffff" : "#000000",
            }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d6c0b8] text-xs font-semibold text-slate-800 shadow sm:h-12 sm:w-12">
              {adminInitials}
            </span>
          </button>

          {isProfileOpen && (
            <div
              className="absolute right-0 top-[115%] z-[999] w-[min(22rem,calc(100vw-1rem))] rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl"
              style={{
                borderColor: isDarkMode
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.08)",
                background: isDarkMode
                  ? "linear-gradient(180deg, rgba(14,23,40,0.98), rgba(10,18,34,0.98))"
                  : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,247,251,0.98))",
                boxShadow: isDarkMode
                  ? "0 10px 40px rgba(0,0,0,0.6)"
                  : "0 10px 25px rgba(0,0,0,0.08)",
              }}
            >
              {/* HEADER */}
              <div
                className="flex items-center gap-3 px-5 py-4 border-b"
                style={{
                  borderColor: isDarkMode
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d6c0b8] text-sm font-bold text-slate-800 shadow">
                  {adminInitials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {admin?.name || "Admin"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {admin?.role || "Admin"}
                  </p>
                </div>
              </div>

              {/* DETAILS */}
              <div className="px-5 py-4 space-y-3 text-sm">
                <ProfileRow label="Email" value={admin?.email || "N/A"} />
                <Divider isDarkMode={isDarkMode} />

                <ProfileRow label="Mobile" value={admin?.number || "N/A"} />
                <Divider isDarkMode={isDarkMode} />

                <ProfileRow label="Role" value={admin?.role || "Admin"} />
                <Divider isDarkMode={isDarkMode} />

                <ProfileRow label="Last Login" value={"Today, 10:30 AM"} />
              </div>

              {/* ACTIONS */}
              <div
                className="flex flex-col gap-2 px-5 py-4 border-t"
                style={{
                  borderColor: isDarkMode
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.06)",
                }}
              >
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenAdminSettings();
                  }}
                  className="w-full rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
                  style={{ background: "var(--brand-gradient)" }}
                >
                  Change Password
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
                  style={{ background: "linear-gradient(135deg, #ef4444, #be123c)" }}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* <button
          type="button"
          className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
          onClick={() => {
            if (isProfileOpen) {
              setIsProfileOpen(false);
              return;
            }
            onLogout();
          }}
          aria-label={isProfileOpen ? "Close profile" : "Logout"}
        >
          <X size={28} />
        </button> */}
      </div>
    </header>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 dark:text-slate-100 text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}

function Divider({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div
      className="h-px w-full"
      style={{
        backgroundColor: isDarkMode
          ? "rgba(255,255,255,0.06)"
          : "rgba(0,0,0,0.06)",
      }}
    />
  );
}
