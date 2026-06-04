"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  Sparkles,
  Gem,
  Moon,
  SunMedium,
} from "lucide-react";

import BrandLogo from "@/components/BrandLogo";

export type UserDashboardView =
  | "overview"
  | "applications"
  | "my-dsc"
  | "irctc-agents"
  | "transactions"
  | "notifications"
  | "support-tickets"
  | "profile-settings"
  | "upgrade-pro"
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
  badge?: number;
};

export function UserSidebar({
  view,
  userData,
  hasSubmittedApplication,
  isSidebarOpen,
  isCollapsed,
  onViewChange,
  onLogout,
  onToggleTheme,
  isDarkMode,
  unreadCount,
}: {
  view: UserDashboardView;
  userData: { name?: string; email?: string } | null;
  hasSubmittedApplication: boolean;
  isSidebarOpen: boolean;
  isCollapsed: boolean;
  onViewChange: (next: UserDashboardView) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  unreadCount: number;
}) {
  const initials = userData?.name
    ? userData.name
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("")
    : (userData?.email?.charAt(0).toUpperCase() ?? "NV");

  const navigationItems: NavEntry[] = [
    {
      view: "overview",
      label: "Overview Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      view: "applications",
      label: "My Applications",
      icon: <FileText size={18} />,
    },
    {
      view: "my-dsc",
      label: "My DSC",
      icon: <ShieldCheck size={18} />,
    },
    {
      view: "irctc-agents",
      label: "IRCTC Agents",
      icon: <Users size={18} />,
    },
    {
      view: "transactions",
      label: "Transactions",
      icon: <CreditCard size={18} />,
    },
    {
      view: "notifications",
      label: "Notifications",
      icon: <Bell size={18} />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      view: "support-tickets",
      label: "Support Tickets",
      icon: <Headset size={18} />,
    },
    {
      view: "profile-settings",
      label: "User Settings",
      icon: <Settings size={18} />,
    },
  ];

  const handleItemClick = (entry: NavEntry) => {
    onViewChange(entry.view);
  };

  return (
    <aside
      className={`ud-user-sidebar ud-sidebar-surface fixed inset-y-0 left-0 z-50 flex transform flex-col border-r transition-[transform,width] duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "w-[68px]" : "w-60"}`}
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* Fixed Logo */}
        <div
          className={`flex h-[60px] shrink-0 items-center border-b border-white/5 ${
            isCollapsed ? "justify-center px-0" : "px-6"
          }`}
        >
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-3 px-2"
            }`}
          >
            <BrandLogo
              showText={!isCollapsed}
              size="sm"
              wordmarkClassName="ud-sidebar-brand text-xl font-bold tracking-tight"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="hide-scrollbar flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-6">
            {!isCollapsed && (
              <div className="ud-sidebar-hint flex items-start gap-2.5 rounded-xl border p-3">
                <div className="mt-0.5 shrink-0 rounded-md bg-orange-500/10 p-1 text-orange-500">
                  <Sparkles size={15} />
                </div>
                <p className="ud-sidebar-hint-text text-[10px] font-medium leading-normal">
                  Submit your application to unlock tracking and documents.
                </p>
              </div>
            )}

            <div className="space-y-2">
              {!isCollapsed && (
                <p className="ud-sidebar-section-label px-2 text-[7px] font-bold uppercase ">
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
                     className={`group relative flex items-center text-left transition-all duration-200 ${
  isCollapsed
    ? `mx-auto h-10 w-10 justify-center rounded-full ${
        isActive
          ? "bg-orange-500/15 text-orange-500"
          : "hover:bg-orange-500/10 hover:scale-105 active:scale-95"
      }`
    : `justify-between px-3 py-2.5 rounded-xl ${
        isActive
          ? "ud-nav-active font-semibold"
          : "ud-sidebar-nav-item ud-hover-surface"
      }`
}`}
                    >
                      {isActive && !isCollapsed && (
                        <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-orange-500 " />
                      )}
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex items-center justify-center ${
                            isActive ? "text-orange-500" : "ud-sidebar-nav-icon"
                          } ${isCollapsed ? "h-7 w-7" : ""}`}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span
                            className={`truncate text-xs font-medium ${
                              isActive
                                ? "text-orange-500"
                                : "ud-sidebar-nav-label"
                            }`}
                          >
                            {item.label}
                          </span>
                        )}
                      </div>

                      {!isCollapsed && (
                        <div className="flex shrink-0 items-center gap-1.5">
                          {item.badge ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                              {item.badge}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
       <div className="shrink-0 space-y-4 border-t border-white/5 p-4">
          {!isCollapsed && (
            <div className="ud-upgrade-card relative overflow-hidden rounded-2xl border p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-500/15 p-2 text-purple-500">
                  <Gem size={18} />
                </div>
                <h4 className="ud-sidebar-upgrade-title text-sm font-bold">
                  Upgrade to Pro
                </h4>
              </div>
              <p className="ud-sidebar-upgrade-desc mt-2 text-[11px] leading-relaxed">
                Unlock priority support, faster verification & more benefits.
              </p>
              <button
                type="button"
                onClick={() => onViewChange("upgrade-pro")}
                className="ud-upgrade-btn mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white transition hover:scale-[1.02] active:scale-95"
              >
                Upgrade Now
                <span className="text-[10px]">&gt;</span>
              </button>
            </div>
          )}

          {/* <div className="ud-sidebar-footer flex flex-col gap-3 border-t pt-4">
            <div
              className={`ud-sidebar-profile flex items-center rounded-2xl p-1.5 ${
                isCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              {" "}
              <div
                className={`ud-sidebar-avatar flex shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                  isCollapsed ? "h-11 w-11" : "h-10 w-10"
                }`}
              >
                {initials}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="ud-sidebar-profile-name truncate text-xs font-bold">
                      {userData?.name || "User"}
                    </p>
                    <span className="ud-sidebar-verified-badge flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white">
                      <svg
                        className="h-2.5 w-2.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                  </div>
                  <p className="ud-sidebar-profile-email truncate text-[10px] font-medium">
                    {userData?.email || ""}
                  </p>
                  <span className="mt-1 inline-flex rounded-md border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-bold text-purple-500">
                    Free Plan
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onLogout}
              className={`ud-sidebar-logout ud-hover-surface flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <LogOut size={16} />
              {!isCollapsed && <span>Logout</span>}
            </button> */}
          {/* </div> */}
        </div>
      </div>
    </aside>
  );
}
