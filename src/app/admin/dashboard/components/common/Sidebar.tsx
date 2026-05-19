import {
  LayoutDashboard,
  Files,
  BarChart3,
  Settings,
  MapPin,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Search,

} from "lucide-react";
import { useState } from "react";
import { DashboardView, AdminProfile } from "../../types";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

interface SidebarProps {
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
  isCollapsed: boolean;
  isSidebarOpen: boolean;
  onToggleCollapse: () => void;
  admin?: AdminProfile | null;
}

const navItems = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "applications", label: "All Applications", icon: Files },

  { id: "track-dsc", label: "Track DSC", icon: MapPin },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "admin-settings", label: "Admin Settings", icon: Settings },
] as const;

export function Sidebar({ 
  view, 
  onViewChange,
  isCollapsed, 
  isSidebarOpen,
  onToggleCollapse,
  admin 
}: SidebarProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSubmenus, setOpenSubmenus] = useState<string[]>(["dsc-management"]);

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => onViewChange(view)}
        />
      )}

      <aside
        className={`theme-transition fixed inset-y-0 left-0 z-50 flex h-full transform flex-col transition-all duration-300 lg:translate-x-0 lg:relative ${
          isCollapsed ? "w-20" : "w-[88vw] max-w-72 lg:w-64 xl:w-72"
        } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          borderColor: colors.borderSoft,
          background: isDarkMode
            ? "linear-gradient(180deg, rgba(11,19,34,0.98), rgba(8,16,29,0.96))"
            : "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
          backdropFilter: "blur(8px)",
          boxShadow: isCollapsed ? "none" : "0 24px 54px -38px var(--accent-shadow)",
        }}
      >
        {/* Header with logo and collapse button */}
        <div className={`flex h-16 items-center border-b ${isCollapsed ? "justify-center px-2" : "justify-between px-4"}`} style={{ borderColor: colors.borderSoft }}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <h1 className="text-gradient-brand text-xl font-bold uppercase tracking-tight">
                Dongle IQ
              </h1>
            </div>
          )}

          {/* Collapse Toggle Button - Always visible, styled like Theme Toggle */}
          <button
            onClick={onToggleCollapse}
            data-testid="sidebar-collapse-toggle"
            className="flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.borderSoft,
              color: colors.accent,
              boxShadow: `0 8px 20px -12px ${colors.accentShadow}`,
            }}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Search Bar - Only when not collapsed */}
        {!isCollapsed && (
          <div className="px-4 pt-4 pb-2">
            <div 
              className="flex items-center rounded-lg border px-3 py-2 transition-all focus-within:ring-2 focus-within:ring-blue-500/20"
              style={{ 
                borderColor: colors.borderSoft, 
                backgroundColor: colors.shell,
              }}
            >
              <Search className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: colors.muted }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="sidebar-search"
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                style={{ color: colors.text }}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems
            .filter((item) => 
              searchQuery === "" || 
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item) => {
              const Icon = item.icon;


              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id as DashboardView);
                  }}
                  title={isCollapsed ? item.label : undefined}
                  data-testid={`sidebar-nav-${item.id}`}
                  className={`group flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    isCollapsed ? "justify-center" : "justify-start"
                  }`}
                  style={{
                    backgroundColor: isActive ? colors.accentSoft : "transparent",
                    color: isActive ? colors.accent : colors.muted,
                    border: isActive ? `1px solid ${colors.accent}40` : "1px solid transparent",
                  }}
                >
                  <Icon
                    className={`h-5 w-5 transition-all ${
                      isActive ? "" : "opacity-70 group-hover:opacity-100"
                    } ${isCollapsed ? "" : "mr-3"}`}
                    style={{ color: isActive ? colors.accent : "currentColor" }}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                  {isActive && !isCollapsed && (
                    <ChevronRight className="ml-auto h-4 w-4 opacity-70" />
                  )}
                </button>
              );
            })}
        </nav>

        {/* Admin Profile Section (when not collapsed) */}
        {!isCollapsed && admin && (
          <div 
            className="mx-4 mb-4 rounded-xl border p-3"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.panel,
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: colors.subtleText }}>
              Logged in as
            </p>
            <p className="mt-2 text-sm font-semibold truncate" style={{ color: colors.text }}>
              {admin.name || "Admin User"}
            </p>
            <p className="mt-0.5 text-xs truncate" style={{ color: colors.subtleText }}>
              {admin.email || "admin@dongleiq.com"}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                style={{
                  backgroundColor: colors.accentSoft,
                  color: colors.accent,
                }}
              >
                {admin.role || "admin"}
              </span>
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "#10b98120",
                  color: "#10b981",
                }}
              >
                Active
              </span>
            </div>
          </div>
        )}

        {/* Collapse button at bottom (when collapsed) */}
        {isCollapsed && (
          <div className="border-t p-4" style={{ borderColor: colors.borderSoft }}>
            <button
              onClick={onToggleCollapse}
              className="flex w-full items-center justify-center rounded-lg p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: colors.muted }}
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