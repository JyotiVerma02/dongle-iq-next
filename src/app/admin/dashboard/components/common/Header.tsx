import { Menu, Bell, ChevronDown, PanelLeft, PanelLeftClose, Search, Sun, Moon } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { AdminProfile, DashboardView } from "../../types";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";
import { getAdminRoleLabel } from "@/lib/adminRoles";
import { useRealtimeEvents } from "@/lib/useRealtimeEvents";

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
};

interface HeaderProps {
  admin: AdminProfile | null;
  onMenuClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  logout: () => void;
  onViewChange: (view: DashboardView) => void;
  unreadCount?: number;
  notifications?: NotificationItem[];
  markNotificationRead?: (notificationId: string) => void;
}

export function Header({
  admin,
  onMenuClick,
  isCollapsed,
  onToggleCollapse,
  logout,
  onViewChange,
  unreadCount = 0,
  notifications = [],
  markNotificationRead,
}: HeaderProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 flex h-[60px] min-h-[60px] shrink-0 w-full items-center justify-between gap-3 border-b px-3 sm:px-4 lg:px-5"
      style={{
        background: isDarkMode
          ? "linear-gradient(180deg, rgba(12,14,20,0.96), rgba(8,10,16,0.92))"
          : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94))",
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
        borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      }}
    >
      {/* Left side */}
      <div className="flex min-w-0 items-center gap-2.5">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          data-testid="header-mobile-menu"
          className="shrink-0 rounded-xl p-2 lg:hidden"
          style={{ color: isDarkMode ? "rgba(255,255,255,0.5)" : "#64748b" }}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          data-testid="header-sidebar-toggle"
          className="hidden h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 hover:scale-105 lg:inline-flex"
          style={{
            borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
            color: isDarkMode ? "rgba(255,255,255,0.5)" : "#64748b",
          }}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>

        {/* Search Bar */}
        <div
          className="hidden sm:flex items-center gap-2 rounded-lg border px-3 py-1.5 min-w-[240px] lg:min-w-[360px] xl:min-w-[420px] cursor-pointer"
          style={{
            borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            background: isDarkMode
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.02)",
          }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: isDarkMode ? "rgba(255,255,255,0.3)" : "#94a3b8" }} />
          <span className="text-[11px] flex-1" style={{ color: isDarkMode ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
            Search applications, users, DSC, Invoices... (Ctrl + K)
          </span>
          <span
            className="hidden md:inline-flex items-center gap-0.5 rounded-md border px-1 py-0.5 text-[8px] font-bold"
            style={{
              borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
              color: isDarkMode ? "rgba(255,255,255,0.35)" : "#94a3b8",
              background: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
            }}
          >
            ⌘ K
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        {/* Notification Bell */}
        <div>
          <button
            onClick={() => onViewChange("notifications")}
            data-testid="header-notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:scale-105"
            style={{
              color: isDarkMode ? "rgba(255,255,255,0.5)" : "#64748b",
              borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
            }}
          >
            <Bell className="h-[17px] w-[17px]" />
            {unreadCount > 0 && (
              <span
                className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none text-white"
                style={{
                  backgroundColor: "#ef4444",
                  boxShadow: "0 2px 8px -2px rgba(239,68,68,0.5)",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          data-testid="header-theme-toggle"
          className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:scale-105"
          style={{
            color: "#ff6a00",
            borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
          }}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="h-[17px] w-[17px]" /> : <Moon className="h-[17px] w-[17px]" />}
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            data-testid="header-admin-dropdown"
            className="flex h-10 items-center gap-2 rounded-xl border pl-1 pr-2.5 transition-all hover:scale-[1.02]"
            style={{
              borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              background: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
            }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg, #ff6a00, #ff8533)" }}
            >
              {admin?.name?.charAt(0) || "J"}
            </div>
            <div className="hidden min-w-0 max-w-28 text-left sm:block">
              <p className="text-[11px] font-bold uppercase tracking-wider truncate" style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}>
                {admin?.name || "Jyoti Verma"}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] truncate" style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
                {getAdminRoleLabel(admin?.role)}
              </p>
            </div>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              style={{ color: isDarkMode ? "rgba(255,255,255,0.35)" : "#94a3b8" }}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border py-1 shadow-xl z-50"
              style={{
                background: isDarkMode ? "#0c0e14" : "#ffffff",
                borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                boxShadow: isDarkMode
                  ? "0 28px 64px -20px rgba(0,0,0,0.8)"
                  : "0 28px 64px -20px rgba(0,0,0,0.15)",
              }}
            >
              <button
                className="w-full px-4 py-2.5 text-left text-[12px] font-semibold transition-colors hover:bg-[rgba(255,106,0,0.08)]"
                style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}
              >
                Profile
              </button>
              <button
                onClick={() => {
                  onViewChange("admin-settings");
                  setIsDropdownOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-[12px] font-semibold transition-colors hover:bg-[rgba(255,106,0,0.08)]"
                style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}
              >
                Settings
              </button>
              <div className="my-1 border-t" style={{ borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }} />
              <button
                onClick={() => {
                  logout();
                  setIsDropdownOpen(false);
                }}
                data-testid="header-logout"
                className="w-full px-4 py-2.5 text-left text-[12px] font-bold text-rose-500 transition-colors hover:bg-rose-500/10"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
