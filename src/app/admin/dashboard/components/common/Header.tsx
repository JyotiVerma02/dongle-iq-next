import { Menu, Bell, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AdminProfile, DashboardView } from "../../types";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

interface HeaderProps {
  admin: AdminProfile | null;
  setMobileOpen: (open: boolean) => void;
  logout: () => void;
  onViewChange: (view: DashboardView) => void;
}

export function Header({ admin, setMobileOpen, logout, onViewChange }: HeaderProps) {
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
      className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-md sm:px-6"
      style={{
        backgroundColor: `${colors.panel}E6`,
        borderColor: colors.borderSoft,
      }}
    >
      <div className="flex items-center">
        <button
          onClick={() => setMobileOpen(true)}
          data-testid="header-mobile-menu"
          className="mr-4 rounded-lg p-2 lg:hidden"
          style={{ color: colors.muted }}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo / Brand */}
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold" style={{ color: colors.text }}>
            Dongle<span style={{ color: colors.accent }}>IQ</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          data-testid="header-notifications"
          className="relative flex items-center justify-center rounded-full p-2"
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
            className="flex items-center space-x-3 rounded-full border p-1 pr-3"
            style={{ borderColor: colors.borderSoft }}
          >
            <div 
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))" }}
            >
              {admin?.name?.charAt(0) || "A"}
            </div>
            <div className="hidden text-left sm:block">
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