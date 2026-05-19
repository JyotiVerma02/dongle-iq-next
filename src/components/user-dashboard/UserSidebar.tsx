"use client";

import React, { useMemo } from "react";
import {
  ClipboardList,
  FileBadge,
  FolderOpen,
  LayoutDashboard,
  Lock,
  LogOut,
  Plus,
  Sparkles,
  UserCircle,
} from "lucide-react";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

export type UserDashboardView =
  | "overview"
  | "registration"
  | "payment"
  | "admin-review"
  | "certificate-summary"
  | "personal-details"
  | "documents";

type NavEntry = {
  view: UserDashboardView;
  label: string;
  icon: React.ReactNode;
  phase: "before" | "after";
};

const NAV_ENTRIES: NavEntry[] = [
  {
    view: "overview",
    label: "Overview",
    icon: <LayoutDashboard size={17} strokeWidth={2.25} />,
    phase: "before",
  },
  {
    view: "registration",
    label: "Start registration",
    icon: <Plus size={17} strokeWidth={2.25} />,
    phase: "before",
  },
  {
    view: "payment",
    label: "Payment",
    icon: <Sparkles size={17} strokeWidth={2.25} />,
    phase: "after",
  },
  {
    view: "admin-review",
    label: "Admin review",
    icon: <ClipboardList size={17} strokeWidth={2.25} />,
    phase: "after",
  },
  {
    view: "certificate-summary",
    label: "Certificate",
    icon: <FileBadge size={17} strokeWidth={2.25} />,
    phase: "after",
  },
  {
    view: "personal-details",
    label: "Your details",
    icon: <UserCircle size={17} strokeWidth={2.25} />,
    phase: "after",
  },
  {
    view: "documents",
    label: "Documents",
    icon: <FolderOpen size={17} strokeWidth={2.25} />,
    phase: "after",
  },
];

export function UserSidebar({
  view,
  userData,
  hasSubmittedApplication,
  isSidebarOpen,
  isCollapsed,
  onViewChange,
  onLogout,
}: {
  view: UserDashboardView;
  userData: { name?: string; email?: string } | null;
  hasSubmittedApplication: boolean;
  isSidebarOpen: boolean;
  isCollapsed: boolean;
  onViewChange: (next: UserDashboardView) => void;
  onLogout: () => void;
}) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const beforeItems = NAV_ENTRIES.filter((e) => e.phase === "before");
  const afterItems = NAV_ENTRIES.filter((e) => e.phase === "after");

  const initials = userData?.name
    ? userData.name
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("")
    : userData?.email?.charAt(0).toUpperCase() ?? "U";

  const collapsed = isCollapsed;

  return (
    <aside
      className={`ud-sidebar-surface theme-transition ud-sidebar fixed inset-y-0 left-0 z-50 flex transform flex-col border-r transition-[transform,width] duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${collapsed ? "ud-sidebar--collapsed" : ""}`}
      style={{ borderColor: "var(--border-soft)" }}
    >
      <div
        className={`ud-sidebar-inner flex min-h-0 flex-1 flex-col overflow-hidden ${collapsed ? "ud-sidebar-inner--collapsed" : ""}`}
      >
        <div className="ud-sidebar-track relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {!collapsed ? (
            <div
              className="mb-4 flex items-start gap-2 rounded-xl border px-3 py-2.5"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.55)",
              }}
            >
              <Sparkles
                size={15}
                className="mt-0.5 shrink-0"
                style={{ color: colors.accent }}
                aria-hidden
              />
              <p className="text-[11px] font-medium leading-snug" style={{ color: colors.muted }}>
                {hasSubmittedApplication
                  ? "Review status, certificate, profile, and files below."
                  : "Submit your application to unlock tracking and documents."}
              </p>
            </div>
          ) : (
            <div className="mb-3 hidden justify-center lg:flex">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl border"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
                  color: colors.accent,
                }}
                title={hasSubmittedApplication ? "Dashboard tips" : "Submit to unlock"}
              >
                <Sparkles size={17} aria-hidden />
              </span>
            </div>
          )}

          <div
            className={
              collapsed
                ? "flex flex-col items-center gap-3 pb-1"
                : "ud-sidebar-nav-shell ud-sidebar-nav-gap"
            }
          >
            <div className={collapsed ? "flex w-full flex-col items-center gap-1" : ""}>
              {!collapsed ? (
                <p
                  className="mb-1.5 px-2 text-[9px] font-black uppercase tracking-[0.22em]"
                  style={{ color: colors.subtleText }}
                >
                  Before submission
                </p>
              ) : (
                <div
                  className="hidden h-px w-8 opacity-80 lg:block"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--border-soft) 85%, transparent)",
                  }}
                  aria-hidden
                />
              )}
              <div className={`flex flex-col gap-1 ${collapsed ? "items-center" : ""}`}>
                {beforeItems.map((item) => (
                  <NavRow
                    key={item.view}
                    label={item.label}
                    icon={item.icon}
                    active={view === item.view}
                    locked={false}
                    collapsed={collapsed}
                    onClick={() => onViewChange(item.view)}
                  />
                ))}
              </div>
            </div>

            <div
              className={collapsed ? "flex w-full flex-col items-center gap-1 border-t pt-3" : "border-t pt-3"}
              style={{ borderColor: colors.borderSoft }}
            >
              {!collapsed ? (
                <p
                  className="mb-1.5 px-2 text-[9px] font-black uppercase tracking-[0.22em]"
                  style={{ color: colors.subtleText }}
                >
                  After submission
                </p>
              ) : null}
              <div className={`flex flex-col gap-1 ${collapsed ? "items-center" : ""}`}>
                {afterItems.map((item) => (
                  <NavRow
                    key={item.view}
                    label={item.label}
                    icon={item.icon}
                    active={view === item.view}
                    locked={!hasSubmittedApplication}
                    collapsed={collapsed}
                    onClick={() => onViewChange(item.view)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`mt-auto shrink-0 pt-3 ${collapsed ? "flex flex-col items-center gap-2" : "space-y-2"}`}
        >
          {!collapsed ? (
            <>
              <div
                className="flex items-center gap-3 rounded-2xl border px-3 py-3 shadow-[0_14px_28px_-26px_var(--accent-shadow)]"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.card,
                }}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white shadow-[0_12px_24px_-16px_var(--accent-shadow)]"
                  style={{ background: "var(--brand-gradient)" }}
                  aria-hidden
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold" style={{ color: colors.text }}>
                    {userData?.name || userData?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="truncate text-[11px] font-medium" style={{ color: colors.subtleText }}>
                    {userData?.email || "—"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="theme-transition flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-22px_var(--accent-shadow)]"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              >
                <LogOut size={16} strokeWidth={2.25} style={{ color: colors.muted }} />
                Logout
              </button>
            </>
          ) : (
            <>
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black text-white shadow-[0_12px_24px_-16px_var(--accent-shadow)]"
                style={{ background: "var(--brand-gradient)" }}
                title={userData?.name || userData?.email || "Account"}
              >
                {initials}
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Logout"
                aria-label="Logout"
                className="theme-transition flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-22px_var(--accent-shadow)]"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              >
                <LogOut size={18} strokeWidth={2.25} style={{ color: colors.muted }} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function NavRow({
  label,
  icon,
  active,
  locked,
  collapsed,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  locked: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const { isDarkMode } = useTheme();
  const colors = useMemo(() => getThemePalette(isDarkMode), [isDarkMode]);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={locked ? `${label} — after submission` : label}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl p-0 transition-all duration-200 ${
          active && !locked ? "shadow-[0_12px_28px_-22px_var(--accent-shadow)]" : ""
        }`}
        style={{
          backgroundColor: active && !locked ? colors.accentSoft : "transparent",
          border:
            active && !locked
              ? `1px solid color-mix(in srgb, ${colors.accent} 42%, transparent)`
              : "1px solid transparent",
          opacity: locked && !active ? 0.55 : 1,
        }}
      >
        <span
          className="relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200"
          style={
            active && !locked
              ? {
                  background: "var(--brand-gradient)",
                  color: "#fff",
                  boxShadow: "0 10px 22px -16px var(--accent-shadow)",
                }
              : {
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
                  color: locked ? colors.subtleText : colors.muted,
                }
          }
        >
          <span className={locked ? "opacity-45" : undefined}>{icon}</span>
          {locked ? (
            <Lock size={10} className="absolute bottom-0.5 right-0.5 opacity-80" aria-hidden />
          ) : null}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={locked ? `${label} — available after you submit` : label}
      className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-all duration-200 ${
        active && !locked ? "shadow-[0_12px_28px_-22px_var(--accent-shadow)]" : ""
      }`}
      style={{
        backgroundColor: active && !locked ? colors.accentSoft : "transparent",
        border:
          active && !locked
            ? `1px solid color-mix(in srgb, ${colors.accent} 42%, transparent)`
            : "1px solid transparent",
        opacity: locked && !active ? 0.55 : 1,
      }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200"
        style={
          active && !locked
            ? {
                background: "var(--brand-gradient)",
                color: "#fff",
                boxShadow: "0 10px 22px -16px var(--accent-shadow)",
              }
            : {
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
                color: locked ? colors.subtleText : colors.muted,
              }
        }
      >
        {icon}
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-[13px] leading-tight ${
          active && !locked ? "font-bold" : "font-semibold"
        }`}
        style={{
          color: locked ? colors.subtleText : active ? colors.accent : colors.text,
        }}
      >
        {label}
      </span>
      {locked ? (
        <Lock size={13} className="shrink-0 opacity-55" aria-hidden />
      ) : active ? (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: colors.accent, boxShadow: `0 0 12px ${colors.accent}` }}
          aria-hidden
        />
      ) : null}
    </button>
  );
}
