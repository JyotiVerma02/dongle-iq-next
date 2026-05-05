"use client";

import { Bell, Loader2, LogOut, Menu, Moon, RefreshCw, SunMedium } from "lucide-react";

import { useTheme } from "@/app/context/ThemeContext";

export function Header({
  onSidebarToggle,
  onRefresh,
  onLogout,
  refreshing,
}: {
  onSidebarToggle: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  refreshing: boolean;
}) {
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = {
    text: "var(--foreground)",
    muted: "var(--muted)",
    subtleText: "var(--subtle-text)",
    panel: "var(--card)",
    overlay: "var(--overlay)",
  };

  return (
    <header
      className="theme-transition sticky top-0 z-30 flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3 backdrop-blur-xl lg:px-6"
      style={{
        borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        backgroundColor: colors.overlay,
      }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onSidebarToggle}
          className="theme-transition flex h-10 w-10 items-center justify-center rounded-xl border transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(69,195,185,0.5)]"
          style={{
            borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            backgroundColor: colors.panel,
            color: colors.text,
          }}
        >
          <Menu size={18} />
        </button>
        <div className="flex flex-col">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: colors.subtleText }}>
            Admin workspace
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span style={{ color: "#16a34a" }}>Support call: 020-49105678, 7777090977</span>
            <span style={{ color: colors.muted }}>Support Email: info@dongleiq.com</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 self-center lg:self-auto">
        <button
          onClick={toggleTheme}
          className="theme-transition inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(69,195,185,0.45)]"
          style={{
            borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
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
          className="theme-transition inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(69,195,185,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            backgroundColor: colors.panel,
            color: colors.text,
          }}
        >
          {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </button>
        <div
          className="theme-transition rounded-xl border p-2.5"
          style={{
            borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            backgroundColor: colors.panel,
            color: colors.text,
          }}
        >
          <Bell size={18} />
        </div>
        <button
          onClick={onLogout}
          className="theme-transition inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 hover:bg-rose-500/10 hover:text-rose-300 hover:shadow-[0_14px_30px_-18px_rgba(244,63,94,0.5)]"
          style={{
            borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            backgroundColor: colors.panel,
            color: colors.text,
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
