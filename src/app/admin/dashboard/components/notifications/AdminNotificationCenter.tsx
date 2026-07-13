"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Search,
  ChevronDown,
  MoreVertical,
  ArrowUpDown,
  FileText,
  CreditCard,
  Headset,
  XCircle,
  RefreshCw,
  Clock,
  UserPlus,
  ShieldCheck,
  Check,
} from "lucide-react";
import { getThemePalette } from "@/lib/themePalette";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type NotificationCategory =
  | "application"
  | "payment"
  | "support"
  | "rejection"
  | "rejection_reason"
  | "status"
  | "other";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
}

interface AdminNotificationCenterProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkRead: (id: string) => void | Promise<void>;
  onMarkAllRead: () => void | Promise<void>;
  colors: ReturnType<typeof getThemePalette>;
  isDarkMode: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

function formatDate(value?: string): string {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isRejection(item: NotificationItem): boolean {
  return (
    item.type === "rejection" ||
    item.type === "rejection_reason" ||
    item.title.toLowerCase().includes("reject") ||
    item.message.toLowerCase().includes("rejected")
  );
}

// ─── Per-category meta ─────────────────────────────────────────────────────────
const CATEGORY_META: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    iconColor: string;
    bg: string;
    outline: string;
  }
> = {
  application: {
    label: "Applications",
    icon: UserPlus,
    iconColor: "#a855f7", // purple
    bg: "rgba(168, 85, 247, 0.15)",
    outline: "rgba(168, 85, 247, 0.3)",
  },
  payment: {
    label: "Payments",
    icon: CreditCard,
    iconColor: "#34d399", // green
    bg: "rgba(52, 211, 153, 0.15)",
    outline: "rgba(52, 211, 153, 0.3)",
  },
  support: {
    label: "Support",
    icon: Headset,
    iconColor: "#fb923c", // orange
    bg: "rgba(251, 146, 60, 0.15)",
    outline: "rgba(251, 146, 60, 0.3)",
  },
  rejection: {
    label: "Rejections",
    icon: XCircle,
    iconColor: "#f43f5e", // red
    bg: "rgba(244, 63, 94, 0.15)",
    outline: "rgba(244, 63, 94, 0.3)",
  },
  rejection_reason: {
    label: "Rejections",
    icon: XCircle,
    iconColor: "#f43f5e", // red
    bg: "rgba(244, 63, 94, 0.15)",
    outline: "rgba(244, 63, 94, 0.3)",
  },
  status: {
    label: "Status",
    icon: ShieldCheck,
    iconColor: "#22c55e", // green
    bg: "rgba(34, 197, 94, 0.15)",
    outline: "rgba(34, 197, 94, 0.3)",
  },
  other: {
    label: "Other",
    icon: Bell,
    iconColor: "#94a3b8", // gray
    bg: "rgba(148, 163, 184, 0.15)",
    outline: "rgba(148, 163, 184, 0.3)",
  },
};

function getTypeMeta(item: NotificationItem) {
  return CATEGORY_META[item.type ?? "other"] ?? CATEGORY_META.other;
}

// ─── Filter tabs ───────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { id: "all", label: "All", icon: Bell },
  { id: "application", label: "Applications", icon: FileText },
  { id: "payment", label: "Payments", icon: CreditCard },
  { id: "support", label: "Support", icon: Headset },
  { id: "rejection", label: "Rejections", icon: XCircle },
  { id: "status", label: "Status", icon: RefreshCw },
] as const;

type FilterTab = (typeof FILTER_TABS)[number]["id"];

// ─── Main Component ────────────────────────────────────────────────────────────
export function AdminNotificationCenter({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  colors,
  isDarkMode,
}: AdminNotificationCenterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "unread">(
    "newest",
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Filter tab counts ────────────────────────────────────────────────────────
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notifications.length };
    for (const n of notifications) {
      const key =
        n.type === "rejection_reason" ? "rejection" : (n.type ?? "other");
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [notifications]);

  // ── Filtered + sorted + searched list ────────────────────────────────────────
  const filtered = useMemo(() => {
    let list =
      activeFilter === "all"
        ? notifications
        : notifications.filter(
            (n) =>
              n.type === activeFilter ||
              (activeFilter === "rejection" && n.type === "rejection_reason"),
          );

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q),
      );
    }

    list = [...list].sort((a, b) => {
      if (sortOrder === "unread") {
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;
      }
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortOrder === "oldest" ? ta - tb : tb - ta;
    });

    return list;
  }, [notifications, activeFilter, search, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Reset to page 1 on filter/search/sort change
  const handleFilterChange = (f: FilterTab) => {
    setActiveFilter(f);
    setPage(1);
  };

  const accentColor = "#7c3aed"; // Admin purple accent

  return (
    <section className="space-y-6">
      {/* ── Header Area ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl border"
            style={{
              borderColor: accentColor,
              backgroundColor: "rgba(124, 58, 237, 0.1)",
            }}
          >
            <Bell size={24} color={accentColor} />
          </div>
          <div>
            <h1
              className="text-2xl font-black tracking-tight"
              style={{ color: colors.text }}
            >
              Notification Center
            </h1>
            <p
              className="text-sm font-medium mt-1"
              style={{ color: colors.muted }}
            >
              Stay updated with important activities and alerts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void onMarkAllRead()}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition hover:bg-white/5 disabled:opacity-50"
          style={{
            borderColor: colors.borderSoft,
            backgroundColor: colors.card,
            color: colors.text,
          }}
        >
          <CheckCheck size={16} color={accentColor} />
          Mark all as read
        </button>
      </div>

      {/* ── Filter tabs ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2.5">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          const count = tabCounts[tab.id] ?? 0;
          const Icon = tab.icon;
          if (tab.id !== "all" && count === 0) return null;
          return (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id as FilterTab)}
              className="flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-semibold transition-all"
              style={{
                backgroundColor: isActive ? accentColor : colors.card,
                borderColor: isActive ? accentColor : colors.borderSoft,
                color: isActive ? "#fff" : colors.text,
              }}
            >
              <Icon
                size={14}
                color={
                  isActive
                    ? "#fff"
                    : tab.id === "all"
                      ? accentColor
                      : CATEGORY_META[tab.id]?.iconColor
                }
              />
              {tab.label}
              {count > 0 && (
                <span
                  className="flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-[11px] font-bold"
                  style={{
                    backgroundColor: isActive
                      ? "rgba(0,0,0,0.2)"
                      : "rgba(255,255,255,0.05)",
                    color: isActive ? "#fff" : "#f8fafc",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Search & Sort ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 sm:w-[320px]"
          style={{
         borderColor: colors.borderSoft,
      backgroundColor: colors.card
          }}
        >
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-500 text-white"
          />
        </div>

        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as any);
              setPage(1);
            }}
            className="appearance-none rounded-lg border bg-transparent px-4 py-2.5 pr-10 text-[13px] font-semibold text-white outline-none cursor-pointer"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              backgroundColor: "rgba(255,255,255,0.02)",
            }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="unread">Unread first</option>
          </select>
          <ArrowUpDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            color="#94a3b8"
          />
        </div>
      </div>

      {/* ── Notification List ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/5 py-12 text-center">
            <p className="text-sm font-semibold text-slate-300">
              No notifications found.
            </p>
          </div>
        ) : (
          paginated.map((item) => (
            <NotificationRow
              key={item._id}
              item={item}
              onMarkRead={onMarkRead}
            />
          ))
        )}
      </div>

      {/* ── Pagination Footer ───────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-[13px] text-slate-400 mt-4">
          <p>
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filtered.length)} of {filtered.length}{" "}
            notifications
          </p>
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5 disabled:opacity-30"
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border font-semibold"
                  style={{
                    backgroundColor:
                      page === i + 1 ? accentColor : "rgba(255,255,255,0.05)",
                    borderColor:
                      page === i + 1 ? accentColor : "rgba(255,255,255,0.05)",
                    color: "#fff",
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5 disabled:opacity-30"
              >
                &gt;
              </button>
            </div>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="appearance-none rounded-lg border bg-transparent px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                backgroundColor: "rgba(255,255,255,0.02)",
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </section>
  );
}

function NotificationRow({
  item,
  onMarkRead,
}: {
  item: NotificationItem;
  onMarkRead: (id: string) => void | Promise<void>;
}) {
  const meta = getTypeMeta(item);
  const Icon = meta.icon;
  const isUnread = !item.isRead;

  return (
    <div
      onClick={() => {
        if (isUnread) void onMarkRead(item._id);
      }}
      className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/5 bg-[#131621] p-4 transition-colors hover:bg-white/[0.03]"
    >
      {/* Unread dot */}
      <div
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: isUnread ? "#a855f7" : "transparent" }}
      />

      {/* Icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
        style={{
          borderColor: meta.outline,
          backgroundColor: "rgba(255,255,255,0.02)",
        }}
      >
        <Icon size={18} color={meta.iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`truncate text-sm ${isUnread ? "font-bold text-white" : "font-semibold text-slate-200"}`}
        >
          {item.title}
        </p>
        <p className="truncate text-xs font-medium text-slate-400 mt-0.5">
          {item.message}
        </p>
      </div>

      {/* Meta tags */}
      <div className="flex items-center gap-6">
        <span
          className="rounded-lg px-2.5 py-1 text-xs font-bold"
          style={{ backgroundColor: meta.bg, color: meta.iconColor }}
        >
          {meta.label}
        </span>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 w-36">
          <Clock size={13} />
          {formatDate(item.createdAt)}
        </div>

        <button className="text-slate-500 hover:text-white transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
}
