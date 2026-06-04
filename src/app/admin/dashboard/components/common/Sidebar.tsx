import {
  LayoutDashboard,
  Files,
  BarChart3,
  Settings,
  MapPin,
  ChevronRight,
  PanelLeft,
  Users,
  CreditCard,
  Bell,
  TicketCheck,
  Train,
  LogOut,
  ArrowRight,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { DashboardView, AdminProfile } from "../../types";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";
import { getAdminRoleLabel, hasAdminPermission } from "@/lib/adminRoles";

interface SidebarProps {
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
  isCollapsed: boolean;
  isSidebarOpen: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
  admin?: AdminProfile | null;
  unreadCount?: number;
}

const navItems = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard, permission: "view_applications" },
  { id: "applications", label: "All Applications", icon: Files, permission: "view_applications" },
  { id: "track-dsc", label: "Track DSC", icon: MapPin, permission: "view_applications" },
  { id: "irctc-agents", label: "IRCTC Agents", icon: Train, permission: "view_applications" },
  { id: "admin-settings", label: "Users Management", icon: Users, permission: "view_applications" },
  { id: "payments", label: "Payments & Invoices", icon: CreditCard, permission: "view_applications" },
  { id: "reports", label: "Reports & Analytics", icon: BarChart3, permission: "view_applications" },
  { id: "notifications", label: "Notifications", icon: Bell, permission: "view_applications" },
  { id: "support", label: "Support Tickets", icon: TicketCheck, permission: "view_applications" },
  { id: "admin-settings", label: "Admin Settings", icon: Settings, permission: "invite_admin" },
] as const;

export function Sidebar({
  view,
  onViewChange,
  isCollapsed,
  isSidebarOpen,
  onToggleCollapse,
  onClose,
  admin,
  unreadCount = 0,
}: SidebarProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const visibleNavItems = navItems.filter(
    (item) => !admin?.role || hasAdminPermission(admin.role, item.permission)
  );

  const handleNavigation = (nextView: DashboardView) => {
    onViewChange(nextView);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`theme-transition fixed inset-y-0 left-0 z-50 flex h-full transform flex-col transition-all duration-300 lg:translate-x-0 lg:relative ${
          isCollapsed ? "w-14" : "w-[88vw] max-w-[240px] lg:w-[220px] xl:w-[240px]"
        } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          borderRight: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          background: isDarkMode
            ? "linear-gradient(180deg, #0c0e14 0%, #080a10 100%)"
            : "linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)",
        }}
      >
        {/* ── Logo ─────────────────────────────────────────────── */}
        <div
          className={`flex h-[60px] shrink-0 items-center border-b ${isCollapsed ? "justify-center px-2" : "px-5"}`}
          style={{ borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
        >
          <BrandLogo
            showText={!isCollapsed}
            size="sm"
            wordmarkClassName="text-[15px] font-extrabold"
          />
        </div>

        {/* ── Navigation ───────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 pt-4 pb-2 hide-scrollbar space-y-1">
          {visibleNavItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            const badge =
              item.id === "notifications" && unreadCount > 0 ? unreadCount : undefined;

            // Deduplicate: skip the second "admin-settings" if it's not the settings view
            if (
              item.id === "admin-settings" &&
              item.label === "Admin Settings" &&
              idx > 0 &&
              navItems[idx - 1]?.id === "support"
            ) {
              // This is the last admin-settings item — show it only if the current view is admin-settings and label matches
            }

            return (
              <button
                key={`${item.id}-${item.label}`}
                onClick={() => handleNavigation(item.id as DashboardView)}
                title={isCollapsed ? item.label : undefined}
                data-testid={`sidebar-nav-${item.id}`}
                className={`group flex w-full items-center rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                  isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
                }`}
                style={{
                  backgroundColor: isActive
                    ? isDarkMode
                      ? "rgba(255,106,0,0.15)"
                      : "#ff6a00"
                    : "transparent",
                  color: isActive
                    ? isDarkMode
                      ? "#ff6a00"
                      : "#ffffff"
                    : isDarkMode
                      ? "rgba(255,255,255,0.55)"
                      : "#64748b",
                  border: isActive
                    ? isDarkMode
                      ? "1px solid rgba(255,106,0,0.25)"
                      : "1px solid #ff6a00"
                    : "1px solid transparent",
                }}
              >
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 ${isCollapsed ? "" : "mr-3"}`}
                  style={{
                    color: isActive
                      ? isDarkMode
                        ? "#ff6a00"
                        : "#ffffff"
                      : isDarkMode
                        ? "rgba(255,255,255,0.4)"
                        : "#94a3b8",
                  }}
                />
                {!isCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!isCollapsed && badge && (
                  <span
                    className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #f43f5e, #e11d48)",
                      boxShadow: "0 2px 8px -2px rgba(244,63,94,0.5)",
                    }}
                  >
                    {badge}
                  </span>
                )}
                {isActive && !isCollapsed && !badge && (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Upgrade to Pro (light mode only, not collapsed) ── */}
        {!isCollapsed && !isDarkMode && (
          <div className="px-3 pb-3">
            <div
              className="rounded-xl border p-3.5"
              style={{
                borderColor: "rgba(255,106,0,0.15)",
                background: "linear-gradient(135deg, rgba(255,106,0,0.04), rgba(255,249,240,0.9))",
              }}
            >
              <p className="text-[11px] font-bold" style={{ color: "#0f172a" }}>
                Upgrade to Pro
              </p>
              <p className="mt-1 text-[10px] leading-relaxed" style={{ color: "#64748b" }}>
                Unlock priority support, faster verification & more.
              </p>
              <button
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-bold text-white transition-all hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #ff6a00, #ff8533)",
                  boxShadow: "0 4px 16px -4px rgba(255,106,0,0.45)",
                }}
              >
                Upgrade Now
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── Admin Profile ────────────────────────────────────── */}
        {!isCollapsed && (
          <div
            className="mx-3 mb-3 rounded-xl border p-3"
            style={{
              borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            }}
          >
            <p
              className="text-[9px] font-bold uppercase tracking-[0.2em]"
              style={{ color: isDarkMode ? "rgba(255,255,255,0.35)" : "#94a3b8" }}
            >
              Logged in as
            </p>
            <div className="mt-2 flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                style={{
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                }}
              >
                {admin?.name?.charAt(0) || "J"}
              </div>
              <div className="min-w-0">
                <p
                  className="text-[12px] font-bold truncate"
                  style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}
                >
                  {admin?.name || "Jyoti Verma"}
                </p>
                <p
                  className="text-[10px] truncate"
                  style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }}
                >
                  {admin?.email || "jyotiverma.feb9@gmail.com"}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span
                className="text-[10px] px-2 py-0.5 rounded-md font-bold capitalize"
                style={{
                  backgroundColor: isDarkMode ? "rgba(255,106,0,0.15)" : "rgba(255,106,0,0.1)",
                  color: "#ff6a00",
                }}
              >
                {getAdminRoleLabel(admin?.role)}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-md font-bold"
                style={{
                  backgroundColor: isDarkMode ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.1)",
                  color: "#22c55e",
                }}
              >
                Active
              </span>
            </div>
          </div>
        )}

        {/* ── Logout ───────────────────────────────────────────── */}
        {!isCollapsed && (
          <div
            className="px-3 pb-4 border-t pt-2"
            style={{ borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
          >
            <button
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all hover:bg-rose-500/10"
              style={{ color: isDarkMode ? "rgba(255,255,255,0.45)" : "#64748b" }}
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* ── Collapse toggle (collapsed state) ────────────────── */}
        {isCollapsed && (
          <div
            className="border-t p-4"
            style={{ borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
          >
            <button
              onClick={onToggleCollapse}
              className="flex w-full items-center justify-center rounded-lg p-2 transition-all"
              style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#64748b" }}
              title="Expand sidebar"
            >
              <PanelLeft size={18} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
