"use client";

import React from "react";
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Users,
  CreditCard,
  Bell,
  Headset,
  Settings,
  LogOut,
  Lock,
  AlertCircle,
  Gem,
} from "lucide-react";

import { useTheme } from "@/components/ThemeContext";

export type UserDashboardView =
  | "overview"
  | "registration"
  | "payment"
  | "admin-review"
  | "certificate-summary"
  | "personal-details"
  | "documents";

type NavEntry = {
  view: UserDashboardView | "dummy-irctc" | "dummy-support";
  label: string;
  icon: React.ReactNode;
  locked: boolean;
  badge?: number;
};

function LogoIcon() {
  return (
    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
      <div className="flex h-6 w-6 rotate-45 items-center justify-center rounded bg-gradient-to-br from-orange-500 to-red-600 shadow-[0_0_12px_rgba(249,115,22,0.4)]">
        <div className="h-2 w-2 rotate-45 rounded-sm bg-white" />
      </div>
    </div>
  );
}

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

  // Construct initials
  const initials = userData?.name
    ? userData.name
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("")
    : userData?.email?.charAt(0).toUpperCase() ?? "NV";

  const navigationItems: NavEntry[] = [
    {
      view: "overview",
      label: "Overview",
      icon: <LayoutDashboard size={18} />,
      locked: false,
    },
    {
      view: "registration",
      label: "My Applications",
      icon: <FileText size={18} />,
      locked: false,
    },
    {
      view: "certificate-summary",
      label: "My DSC",
      icon: <ShieldCheck size={18} />,
      locked: !hasSubmittedApplication,
    },
    {
      view: "dummy-irctc",
      label: "IRCTC Agents",
      icon: <Users size={18} />,
      locked: false,
    },
    {
      view: "payment",
      label: "Transactions",
      icon: <CreditCard size={18} />,
      locked: !hasSubmittedApplication,
    },
    {
      view: "admin-review",
      label: "Notifications",
      icon: <Bell size={18} />,
      locked: !hasSubmittedApplication,
      badge: 3,
    },
    {
      view: "dummy-support",
      label: "Support Tickets",
      icon: <Headset size={18} />,
      locked: false,
    },
    {
      view: "personal-details",
      label: "Profile & Settings",
      icon: <Settings size={18} />,
      locked: !hasSubmittedApplication,
    },
  ];

  const handleItemClick = (entry: NavEntry) => {
    if (entry.locked) return;
    if (entry.view === "dummy-irctc" || entry.view === "dummy-support") {
      return; // No-op for dummy routes
    }
    onViewChange(entry.view as UserDashboardView);
  };

  return (
    <aside
      className={`ud-user-sidebar fixed inset-y-0 left-0 z-50 flex transform flex-col border-r transition-[transform,width] duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "w-20" : "w-64"}`}
      style={{
        backgroundColor: isDarkMode ? "#0b0f17" : "#ffffff",
        borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#f1f5f9",
      }}
    >
      <div className="flex h-full flex-col justify-between overflow-y-auto px-4 py-6 hide-scrollbar">
        <div className="space-y-6">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-2">
            <LogoIcon />
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-tight text-slate-800">
                Dongle<span className="text-orange-500">IQ</span>
              </span>
            )}
          </div>

          {/* Sub-banner alert block */}
          {!isCollapsed && (
            <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-100 p-3">
              <div className="mt-0.5 rounded-md bg-orange-500/10 p-1 text-orange-500 shrink-0">
                <AlertCircle size={15} />
              </div>
              <p className="text-[11px] font-medium leading-normal text-slate-600">
                Submit your application to unlock tracking and documents.
              </p>
            </div>
          )}

          {/* Navigation Section */}
          <div className="space-y-2">
            {!isCollapsed && (
              <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                MAIN MENU
              </p>
            )}
            <nav className="flex flex-col gap-1.5">
              {navigationItems.map((item) => {
                const isActive = view === item.view;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    disabled={item.locked}
                    className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-left transition-all duration-200 ${
                      item.locked ? "opacity-40 cursor-not-allowed" : ""
                    } ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500/10 to-orange-500/0 text-orange-600 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`${isActive ? "text-orange-500" : "text-slate-400 group-hover:text-slate-600"}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="truncate text-sm font-medium">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                        {item.locked && (
                          <Lock size={12} className="text-slate-400" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Upgrade & Profile Section */}
        <div className="mt-8 space-y-4">
          {/* Upgrade to Pro promo box */}
          {!isCollapsed && (
            <div className="rounded-2xl bg-gradient-to-b from-indigo-50/70 to-purple-50/40 border border-indigo-100/60 p-4.5 relative overflow-hidden shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600">
                  <Gem size={18} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Upgrade to Pro</h4>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                Unlock priority support, faster verification & more benefits.
              </p>
              <button
                type="button"
                className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 py-2 text-xs font-semibold text-white transition shadow-[0_2px_10px_rgba(99,102,241,0.25)] hover:scale-[1.02] active:scale-95"
              >
                Upgrade Now
                <span className="text-[10px]">&gt;</span>
              </button>
            </div>
          )}

          {/* Profile Row */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-3 rounded-2xl p-1.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-white shadow-sm">
                {initials}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {userData?.name || "Jyoti Verma"}
                    </p>
                    <svg
                      className="h-3.5 w-3.5 shrink-0 text-blue-500 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                  <p className="truncate text-[10px] font-medium text-slate-400">
                    {userData?.email || "jyotiverma.feb9@gmail.com"}
                  </p>
                  <span className="inline-flex mt-1 items-center rounded bg-green-50 px-1.5 py-0.5 text-[9px] font-bold text-green-700 border border-green-200/60">
                    Verified User
                  </span>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={onLogout}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition text-slate-600 hover:bg-slate-50 hover:text-slate-900 ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <LogOut size={16} />
              {!isCollapsed && <span className="text-xs font-semibold">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
