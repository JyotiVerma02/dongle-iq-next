"use client";

import { ChevronRight, Home } from "lucide-react";
import { DashboardView } from "../../types";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

const VIEW_LABELS: Record<DashboardView, string> = {
  home: "Dashboard",
  applications: "All Applications",
  reports: "Reports",
  "track-dsc": "Track DSC",
  "admin-settings": "Admin Settings",
  "create-dsc": "Create DSC",
};

interface BreadcrumbProps {
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

/**
 * Compact breadcrumb bar shown when not on the home view.
 * Renders: Dashboard › [Current View]
 */
export function Breadcrumb({ view, onViewChange }: BreadcrumbProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  if (view === "home") return null;

  return (
    <nav
      aria-label="Breadcrumb"
      data-testid="breadcrumb"
      className="flex items-center gap-1.5 px-1 pb-3 pt-0.5"
    >
      <button
        onClick={() => onViewChange("home")}
        data-testid="breadcrumb-home"
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors hover:text-[var(--accent)]"
        style={{ color: colors.muted }}
        title="Go to Dashboard"
      >
        <Home className="h-3 w-3" />
        <span>Dashboard</span>
      </button>

      <ChevronRight className="h-3 w-3 flex-shrink-0" style={{ color: colors.muted }} />

      <span
        className="text-[10px] font-black uppercase tracking-wider"
        style={{ color: colors.text }}
        aria-current="page"
      >
        {VIEW_LABELS[view] ?? view}
      </span>
    </nav>
  );
}
