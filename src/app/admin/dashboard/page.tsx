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

import type { DashboardView } from "./types";

type NotificationItem = {
  _id: string;
  title: string;
  message: string;
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
const CreateDSCView = lazy(() =>
  import("./components/dsc-management/CreateDSCView").then((m) => ({
    default: m.CreateDSCView,
  }))
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const VALID_VIEWS = new Set<DashboardView>([
  "home",
  "applications",
  "reports",
  "track-dsc",
  "admin-settings",
  "create-dsc",
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

  // ── URL-synced navigation ─────────────────────────────────────────────────
  const navigateTo = useCallback(
    (nextView: DashboardView) => {
      setViewRaw(nextView);
      setTransitionKey((k) => k + 1);
      trackEvent("view_changed", { view: nextView });
      router.replace(`?view=${nextView}`, { scroll: false });
    },
    [router, trackEvent]
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
    (event: { type: string }) => {
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
            notifications={notifications}
            markNotificationRead={markNotificationRead}
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
                      {view === "create-dsc" &&
                        withProfiler(
                          "CreateDSCView",
                          <CreateDSCView
                            onBack={() => navigateTo("home")}
                            onSuccess={() => navigateTo("applications")}
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
export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AdminDashboard />
    </Suspense>
  );
}
