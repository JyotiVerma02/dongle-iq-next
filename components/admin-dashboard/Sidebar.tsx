"use client";

import React, { useMemo, useState } from "react";
import { ChevronRight, FileText, Users } from "lucide-react";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";
import type { AdminProfile, DashboardView } from "@/components/admin-dashboard/types";

export function Sidebar({
  view,
  admin,
  isCollapsed,
  isSidebarOpen,
  onViewChange,
}: {
  view: DashboardView;
  admin: AdminProfile | null;
  isCollapsed: boolean;
  isSidebarOpen: boolean;
  onViewChange: (view: DashboardView) => void;
}) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const isLedgerView = view === "ledger" || view === "ledger-new" || view === "ledger-old";
  // null = follow active view (auto-open on ledger views)
  const [ordersOpen, setOrdersOpen] = useState<boolean | null>(null);
  const effectiveOrdersOpen = ordersOpen ?? isLedgerView;

  return (
    <aside
      className={`theme-transition fixed inset-y-0 left-0 z-50 flex transform flex-col border-r px-3 py-4 transition-all duration-300 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "w-20" : "w-[88vw] max-w-72 lg:w-64 xl:w-72"} lg:static lg:translate-x-0`}
      style={{
        width: isCollapsed ? "5.5rem" : "18rem",
        borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        backgroundColor: colors.overlay,
      }}
    >
      <div className="flex h-full flex-col">
        <div>
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#45c3b9,#67e8f9)] text-[#081214] shadow-[0_14px_24px_-18px_rgba(69,195,185,0.7)]">
              <Users size={20} />
            </div>

            {!isCollapsed && (
              <div>
                <p className="text-base font-black uppercase tracking-tight">
                  Dongle <span className="text-[#45c3b9]">IQ</span>
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: colors.subtleText }}>
                  Admin Panel
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div
              className="mb-4 rounded-xl border px-3 py-2.5"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: colors.panel,
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: colors.subtleText }}>
                Navigation
              </p>
              <p className="mt-1 text-xs font-medium" style={{ color: colors.muted }}>
                Dashboard, orders, reports and admin controls
              </p>
            </div>
          )}

          <nav className="space-y-1.5">
            <NavItem
              label="Dashboard"
              active={view === "home"}
              onClick={() => onViewChange("home")}
              icon={<FileText size={18} />}
              collapsed={isCollapsed}
            />
            <NavItem
              label="Orders / Ledger"
              active={isLedgerView}
              onClick={() => {
                const next = !effectiveOrdersOpen;
                setOrdersOpen(next);
                if (next && !isLedgerView) {
                  onViewChange("ledger-new");
                }
              }}
              icon={<Users size={18} />}
              collapsed={isCollapsed}
            />

            {!isCollapsed && effectiveOrdersOpen ? (
              <div className="ml-2 mt-1 space-y-1 border-l pl-3" style={{ borderColor: colors.borderSoft }}>
                <SubNavItem
                  label="New Orders"
                  active={view === "ledger-new" || view === "ledger"}
                  onClick={() => onViewChange("ledger-new")}
                />
                <SubNavItem
                  label="Old Orders"
                  active={view === "ledger-old"}
                  onClick={() => onViewChange("ledger-old")}
                />
              </div>
            ) : null}
            <NavItem
              label="Applications"
              active={view === "applications"}
              onClick={() => onViewChange("applications")}
              icon={<FileText size={18} />}
              collapsed={isCollapsed}
            />
          </nav>
        </div>

        {!isCollapsed && (
          <div
            className="theme-transition mt-auto rounded-xl border p-3"
            style={{
              borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              backgroundColor: colors.panel,
            }}
          >
            <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: colors.subtleText }}>
              Logged in admin
            </p>
            <p className="mt-2 text-base font-black text-white">{admin?.name || "Admin"}</p>
            <p className="mt-1 text-xs" style={{ color: colors.subtleText }}>
              {admin?.email || "No email found"}
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px]" style={{ color: colors.subtleText }}>
              <span>{admin?.role || "admin"}</span>
              <span>{admin?.status || "active"}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavItem({
  label,
  active,
  onClick,
  icon,
  collapsed,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  collapsed?: boolean;
}) {
  const { isDarkMode } = useTheme();
  const colors = useMemo(() => getThemePalette(isDarkMode), [isDarkMode]);

  return (
    <button
      onClick={onClick}
      title={collapsed ? label : ""}
      className={`flex items-center ${
        collapsed ? "justify-center" : "justify-between"
      } w-full rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200`}
      style={{
        backgroundColor: active ? "rgba(69,195,185,0.15)" : "transparent",
        color: active ? "#45c3b9" : colors.muted,
        border: active ? "1px solid rgba(69,195,185,0.3)" : "1px solid transparent",
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="flex items-center justify-center">{icon}</span>
        {!collapsed && <span>{label}</span>}
      </div>

      {!collapsed && (
        <ChevronRight
          size={12}
          className={`transition-transform ${active ? "translate-x-1 opacity-100" : "opacity-40"}`}
        />
      )}
    </button>
  );
}

function SubNavItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const { isDarkMode } = useTheme();
  const colors = useMemo(() => getThemePalette(isDarkMode), [isDarkMode]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg px-2 py-2 text-left text-xs font-semibold transition-all duration-200"
      style={{
        backgroundColor: active ? `${colors.accent}18` : "transparent",
        color: active ? colors.accent : colors.muted,
        border: active ? `1px solid ${colors.accent}40` : "1px solid transparent",
      }}
    >
      {label}
    </button>
  );
}
