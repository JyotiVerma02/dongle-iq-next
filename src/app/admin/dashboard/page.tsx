"use client";

import {
  useState,
  useEffect,
  useRef,
  lazy,
  Suspense,
  Profiler,
  useCallback,
  type ProfilerOnRenderCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { Bell, CheckCheck } from "lucide-react";

import type { DashboardView } from "./types";
import { clearFormState, clearPreviewDraft } from "@/lib/applicationPreview";

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
};
import { useAuth } from "./hooks/useAuth";
import { useApplications } from "./hooks/useApplications";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useSwipeGesture } from "./hooks/useSwipeGesture";
import { useAnalytics } from "./hooks/useAnalytics";
import { useRealtimeEvents } from "@/lib/useRealtimeEvents";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";
import { Sidebar } from "./components/common/Sidebar";
import { Header } from "./components/common/Header";
import { LoadingSkeleton } from "./components/common/LoadingSkeleton";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { OfflineIndicator } from "./components/common/OfflineIndicator";
import { Breadcrumb } from "./components/common/Breadcrumb";
import { ShortcutsModal } from "./components/common/ShortcutsModal";

// ─── Lazy-loaded views (each bundle loads only on first navigation) ───────────
const DashboardMainView = lazy(() =>
  import("./components/dashboard/DashboardView").then((m) => ({
    default: m.DashboardMainView,
  }))
);
const ExistingDSCView = lazy(() =>
  import("./components/dsc-management/ExistingDSCView").then((m) => ({
    default: m.ExistingDSCView,
  }))
);
const ReportsView = lazy(() =>
  import("./components/reports/ReportsView").then((m) => ({
    default: m.ReportsView,
  }))
);
const TrackDSCView = lazy(() =>
  import("./components/track-dsc/TrackDSCView").then((m) => ({
    default: m.TrackDSCView,
  }))
);
const AdminSettingsView = lazy(() =>
  import("./components/admin-settings/AdminSettingsView").then((m) => ({
    default: m.AdminSettingsView,
  }))
);
const SupportTicketsView = lazy(() =>
  import("./components/support/SupportTicketsView").then((m) => ({
    default: m.SupportTicketsView,
  }))
);
// ─── Helpers ──────────────────────────────────────────────────────────────────
const VALID_VIEWS = new Set<DashboardView>([
  "home",
  "applications",
  "reports",
  "track-dsc",
  "admin-settings",
  "irctc-agents",
  "payments",
  "notifications",
  "support",
]);

/** Debounce — fully typed without `any` */
function debounce<A extends unknown[]>(
  func: (...args: A) => void,
  wait: number
): (...args: A) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: A) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/** Development-only render performance logger */
const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration
) => {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[Profiler] ${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
  }
};

// ─── Inner dashboard (needs useSearchParams, must be inside Suspense) ─────────
function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { trackEvent } = useAnalytics();

  // Derive initial view from the URL ?view= param
  const getInitialView = (): DashboardView => {
    const param = searchParams.get("view") as DashboardView;
    return VALID_VIEWS.has(param) ? param : "home";
  };

  const [view, setViewRaw] = useState<DashboardView>(getInitialView);
  /** Increment on every view change to re-trigger the enter animation */
  const [transitionKey, setTransitionKey] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  /** Ref attached to the main content area for swipe gesture detection */
  const mainRef = useRef<HTMLDivElement>(null);

  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const { admin, loading: authLoading, logout } = useAuth();
  const { users, loading: usersLoading, refresh: refreshUsers } = useApplications();
  const stats = useDashboardStats(users);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markNotificationRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const openFullDscForm = useCallback(() => {
    clearPreviewDraft();
    clearFormState();
    sessionStorage.removeItem("dongle-iq-application-config");
    sessionStorage.removeItem("verifiedMobile");
    router.push("/bank-telecom-form");
  }, [router]);

  // ── URL-synced navigation ─────────────────────────────────────────────────
  const navigateTo = useCallback(
    (nextView: DashboardView) => {
      if (nextView === "create-dsc") {
        openFullDscForm();
        return;
      }

      setViewRaw(nextView);
      setTransitionKey((k) => k + 1);
      trackEvent("view_changed", { view: nextView });
      router.replace(`?view=${nextView}`, { scroll: false });
    },
    [openFullDscForm, router, trackEvent]
  );

  // Keep view in sync when user navigates with browser Back / Forward
  useEffect(() => {
    const param = searchParams.get("view") as DashboardView;
    if (param && VALID_VIEWS.has(param) && param !== view) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewRaw(param);
      setTransitionKey((k) => k + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Sidebar collapse with localStorage persistence ────────────────────────
  const handleToggleCollapse = useCallback(() => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
  }, [isCollapsed]);

  // Debounced resize handler — restores saved collapsed pref on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
        setIsSidebarOpen(false);
      } else {
        const saved = localStorage.getItem("sidebarCollapsed");
        setIsCollapsed(saved === "true");
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    const debouncedResize = debounce(handleResize, 150);
    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useKeyboardShortcuts(navigateTo, () => setIsShortcutsOpen(true));

  // ── Swipe gestures (mobile sidebar) ──────────────────────────────────────
  useSwipeGesture(mainRef, {
    onSwipeRight: () => setIsSidebarOpen(true),
    onSwipeLeft: () => setIsSidebarOpen(false),
  });

  const handleRealtimeEvent = useCallback(
    (event: { type: string; notification?: { title?: string; _id?: string }; [key: string]: unknown }) => {
      if (process.env.NODE_ENV === "development") {
        console.debug("[admin-dashboard:sse]", {
          type: event.type,
          notificationId: event.notification?._id,
          notificationTitle: event.notification?.title,
        });
      }

      const refreshEvents = new Set([
        "NOTIFICATION_CREATED",
        "STATUS_UPDATE",
        "APPLICATION_UPDATED",
        "PAYMENT_UPDATED",
        "SUPPORT_TICKET_CREATED",
        "SUPPORT_TICKET_UPDATED",
      ]);
      if (refreshEvents.has(event.type)) {
        void refreshUsers();
        void fetchNotifications();
      }
    },
    [refreshUsers, fetchNotifications],
  );

  useRealtimeEvents(handleRealtimeEvent, true);

  const isLoading = authLoading || usersLoading;

  /** Wraps a view in React.Profiler in development for render timing */
  const withProfiler = (id: string, node: React.ReactNode): React.ReactNode =>
    process.env.NODE_ENV === "development" ? (
      <Profiler id={id} onRender={onRenderCallback}>
        {node}
      </Profiler>
    ) : (
      node
    );

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "12px", background: "#fff", color: "#111827" },
        }}
      />

      {/* Offline connectivity banner */}
      <OfflineIndicator />

      {/* Keyboard shortcuts help modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <div
        data-testid="dashboard-main"
        className="theme-transition ud-dashboard-root ud-shell overflow-hidden text-[13px]"
        style={{ color: colors.text }}
      >


        <Sidebar
          view={view}
          onViewChange={navigateTo}
          isCollapsed={isCollapsed}
          isSidebarOpen={isSidebarOpen}
          onToggleCollapse={handleToggleCollapse}
          onClose={() => setIsSidebarOpen(false)}
          admin={admin}
          unreadCount={unreadCount}
        />

        {/* Main content — swipe gesture target */}
        <div ref={mainRef} className="ud-main relative flex-1">
          <Header
            admin={admin}
            onMenuClick={() => setIsSidebarOpen((current) => !current)}
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
            logout={logout}
            onViewChange={navigateTo}
            unreadCount={unreadCount}
          />

          <main className="ud-main-scroll relative z-10">
            <div className="ud-page-inner">
              {/* Breadcrumb navigation (hidden on home) */}
              <Breadcrumb view={view} onViewChange={navigateTo} />

              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <ErrorBoundary maxRetries={3}>
                  {/* Suspense handles lazy-loaded view bundles */}
                  <Suspense fallback={<LoadingSkeleton />}>
                    {/* key re-triggers the enter animation on every view change */}
                    <div
                      key={transitionKey}
                      className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                      {view === "home" &&
                        withProfiler(
                          "DashboardMainView",
                          <DashboardMainView
                            stats={stats}
                            users={users}
                            setView={navigateTo}
                          />
                        )}
                      {view === "applications" &&
                        withProfiler(
                          "ExistingDSCView",
                          <ExistingDSCView
                            onBack={() => navigateTo("home")}
                            onCreateNew={() => navigateTo("create-dsc")}
                            admin={admin}
                          />
                        )}
                      {view === "reports" &&
                        withProfiler("ReportsView", <ReportsView stats={stats} />)}
                      {view === "track-dsc" &&
                        withProfiler("TrackDSCView", <TrackDSCView users={users} />)}
                      {view === "admin-settings" &&
                        withProfiler(
                          "AdminSettingsView",
                          <AdminSettingsView
                            admin={admin}
                            toggleTheme={toggleTheme}
                            isDarkMode={isDarkMode}
                          />
                        )}
                      {view === "notifications" &&
                        withProfiler(
                          "NotificationsView",
                          <NotificationsView
                            notifications={notifications}
                            unreadCount={unreadCount}
                            colors={colors}
                            isDarkMode={isDarkMode}
                            onMarkRead={markNotificationRead}
                            onMarkAllRead={markAllNotificationsRead}
                          />
                        )}
                      {view === "support" &&
                        withProfiler(
                          "SupportTicketsView",
                          <SupportTicketsView />
                        )}
                    </div>
                  </Suspense>
                </ErrorBoundary>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────
// Wrapped in Suspense so useSearchParams (inside AdminDashboard) works in
// the Next.js App Router without triggering a build-time error.
function NotificationsView({
  notifications,
  unreadCount,
  colors,
  isDarkMode,
  onMarkRead,
  onMarkAllRead,
}: {
  notifications: NotificationItem[];
  unreadCount: number;
  colors: ReturnType<typeof getThemePalette>;
  isDarkMode: boolean;
  onMarkRead: (notificationId: string) => void | Promise<void>;
  onMarkAllRead: () => void | Promise<void>;
}) {
  const formatDate = (value?: string) => {
    if (!value) return "";
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="space-y-5">
      <div
        className="rounded-xl border p-5 sm:p-6"
        style={{ backgroundColor: colors.card, borderColor: colors.borderSoft }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: colors.accent }}>
              Admin notifications
            </p>
            <h1 className="mt-2 text-2xl font-black" style={{ color: colors.text }}>
              Notification Center
            </h1>
            <p className="mt-1 text-sm font-semibold" style={{ color: colors.muted }}>
              {unreadCount > 0
                ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"} need attention.`
                : "All admin updates are read."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void onMarkAllRead()}
            disabled={unreadCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition disabled:opacity-50"
            style={{
              backgroundColor: colors.panelStrong,
              borderColor: colors.borderSoft,
              color: colors.text,
            }}
          >
            <CheckCheck size={15} />
            Mark all read
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {notifications.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center"
            style={{ backgroundColor: colors.card, borderColor: colors.borderSoft }}
          >
            <Bell className="mx-auto mb-3" size={28} style={{ color: colors.muted }} />
            <p className="text-sm font-bold" style={{ color: colors.text }}>
              No notifications yet
            </p>
            <p className="mt-1 text-xs font-semibold" style={{ color: colors.muted }}>
              New DSC applications, status changes, payments, and support updates will appear here.
            </p>
          </div>
        ) : (
          notifications.map((item) => {
            const isUnread = !item.isRead;
            const isRejection =
              item.type === "rejection_reason" ||
              item.title.toLowerCase().includes("rejection") ||
              item.message.toLowerCase().includes("rejected");

            return (
              <button
                key={item._id}
                type="button"
                onClick={() => {
                  if (isUnread) void onMarkRead(item._id);
                }}
                className="rounded-xl border p-4 text-left transition hover:-translate-y-0.5"
                style={{
                  backgroundColor: isUnread
                    ? isRejection
                      ? isDarkMode
                        ? "rgba(244,63,94,0.10)"
                        : "rgba(244,63,94,0.06)"
                      : isDarkMode
                        ? "rgba(255,106,0,0.10)"
                        : "rgba(255,106,0,0.06)"
                    : colors.card,
                  borderColor: isUnread
                    ? isRejection
                      ? "rgba(244,63,94,0.35)"
                      : "rgba(255,106,0,0.35)"
                    : colors.borderSoft,
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: isUnread
                        ? isRejection
                          ? "#fb7185"
                          : colors.accent
                        : colors.borderSoft,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <h2 className="text-sm font-black" style={{ color: colors.text }}>
                        {item.title}
                      </h2>
                      {item.createdAt ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.muted }}>
                          {formatDate(item.createdAt)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs font-semibold leading-5" style={{ color: colors.muted }}>
                      {item.message}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AdminDashboard />
    </Suspense>
  );
}
