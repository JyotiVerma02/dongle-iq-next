"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Loader2,
  LogOut,
  Menu,
  Moon,
  RefreshCw,
  Settings,
  ShieldCheck,
  SunMedium,
  X,
} from "lucide-react";

import { useTheme } from "@/app/context/ThemeContext";
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
      className="theme-transition sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur-xl lg:px-6"
      style={{
        borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        backgroundColor: colors.overlay,
        overflow: "visible",
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
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: colors.subtleText }}
          >
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

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            className="theme-transition flex h-[76px] min-w-[92px] items-center justify-center rounded-2xl border px-4"
            style={{
              borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              backgroundColor: "rgba(107,114,128,0.85)",
              color: "#ffffff",
            }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d6c0b8] text-xs font-semibold text-slate-800 shadow">
              {adminInitials}
            </span>
          </button>

        {isProfileOpen && (
  <div
    className="absolute right-0 top-[115%] z-[999] w-[320px] rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95"
    style={{
      borderColor: isDarkMode
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.08)",
      backgroundColor: colors.panel,
    }}
  >
    {/* Arrow */}
    <div
      className="absolute -top-2 right-6 h-4 w-4 rotate-45 border-l border-t"
      style={{
        backgroundColor: colors.panel,
        borderColor: isDarkMode
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.08)",
      }}
    />

    {/* Header */}
    <div className="flex items-center gap-3 px-5 py-4 border-b">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d6c0b8] text-sm font-bold text-slate-800">
        {adminInitials}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {admin?.name || "Admin"}
        </p>
        <p className="truncate text-xs text-slate-500">
          {admin?.email || "No email"}
        </p>
      </div>
    </div>

    {/* Info */}
    <div className="px-5 py-4 space-y-3 text-sm">
      <InfoRow label="Role" value={admin?.role || "Admin"} />
      <InfoRow label="Phone" value={admin?.number || "N/A"} />
      <InfoRow label="Status" value={admin?.status || "Active"} />
    </div>

    {/* Actions */}
    <div className="flex flex-col gap-2 px-5 py-4 border-t">
  <button
    onClick={() => {
      setIsProfileOpen(false);
      onOpenAdminSettings(); // this will open change password
    }}
    className="w-full rounded-xl px-4 py-2 text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
  >
    Change Password
  </button>

  <button
    onClick={() => {
      setIsProfileOpen(false);
      onLogout();
    }}
    className="w-full rounded-xl px-4 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
  >
    Logout
  </button>
</div>
  </div>
)}
        </div>

        <button
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
        </button>
      </div>
    </header>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px] leading-6">
      <span className="inline-flex items-center gap-2 font-medium text-slate-500">
        <ShieldCheck size={14} />
        {label}
      </span>
      <span className="text-right font-semibold text-slate-800 dark:text-slate-100">{value}</span>
    </div>
  );
}
