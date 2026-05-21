import { Menu, Bell, ChevronDown, PanelLeft, PanelLeftClose } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AdminProfile, DashboardView } from "../../types";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

interface HeaderProps {
  admin: AdminProfile | null;
  onMenuClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  logout: () => void;
  onViewChange: (view: DashboardView) => void;
}

export function Header({
  admin,
  onMenuClick,
  isCollapsed,
  onToggleCollapse,
  logout,
  onViewChange,
}: HeaderProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle click to open/close
  const handleDropdownClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle double click to close
  const handleDropdownDoubleClick = () => {
    setIsDropdownOpen(false);
  };

  return (
    <header 
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-3 border-b px-3 backdrop-blur-md sm:px-4 lg:px-6"
      style={{
        background: "linear-gradient(90deg, rgba(10,19,31,0.96), rgba(15,40,56,0.92))",
        borderColor: colors.borderSoft,
      }}
    >
      <div className="flex min-w-0 items-center">
        <button
          onClick={onMenuClick}
          data-testid="header-mobile-menu"
          className="mr-2 shrink-0 rounded-xl p-2 lg:hidden"
          style={{ color: colors.muted }}
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          onClick={onToggleCollapse}
          data-testid="header-sidebar-toggle"
          className="hidden h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 lg:inline-flex"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.borderSoft,
            color: colors.accent,
            boxShadow: `0 8px 20px -12px ${colors.accentShadow}`,
          }}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button 
          data-testid="header-notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full"
          style={{ color: colors.muted }}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: colors.accent }} />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleDropdownClick}
            onDoubleClick={handleDropdownDoubleClick}
            data-testid="header-admin-dropdown"
            className="flex h-12 items-center gap-2 rounded-full border pl-1 pr-2 sm:pr-3"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.card,
              boxShadow: `0 12px 30px -24px ${colors.accentShadow}`,
            }}
          >
            <div 
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))" }}
            >
              {admin?.name?.charAt(0) || "A"}
            </div>
            <div className="hidden min-w-0 max-w-32 text-left sm:block">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: colors.text }}>
                {admin?.name || "Admin"}
              </p>
            </div>
            <ChevronDown 
              className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} 
              style={{ color: colors.muted }} 
            />
          </button>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 origin-top-right flex-col rounded-xl border py-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ backgroundColor: colors.card, borderColor: colors.borderSoft }}
            >
              <button 
                className="w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-wider"
                style={{ color: colors.text }}
              >
                Profile
              </button>
              <button 
                onClick={() => {
                  onViewChange("admin-settings");
                  setIsDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-wider"
                style={{ color: colors.text }}
              >
                Settings
              </button>
              <div className="my-1 border-t" style={{ borderColor: colors.borderSoft }} />
              <button 
                onClick={logout}
                data-testid="header-logout"
                className="w-full px-4 py-2 text-left text-xs font-black uppercase tracking-wider text-rose-500"
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
