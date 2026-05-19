import { DashboardStats, User, DashboardView } from "../../types";
import { StatsOverview } from "./StatsOverview";
import { PerformanceCharts } from "./PerformanceCharts";
import { RecentActivity } from "./RecentActivity";

interface DashboardViewProps {
  stats: DashboardStats;
  users: User[];
  setView: (view: DashboardView) => void;
}

export function DashboardMainView({ stats, users, setView }: DashboardViewProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">
            Performance Overview
          </h2>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
            Monitor your business metrics and recent activity in real-time.
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <button
            onClick={() => setView("track-dsc")}
            className="theme-transition inline-flex items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--card)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--foreground)] hover:bg-[var(--background-alt)]"
          >
            Track DSC
          </button>
          <button
            onClick={() => setView("reports")}
            className="theme-primary-btn theme-transition inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white"
          >
            View Reports
          </button>
        </div>
      </div>

      <StatsOverview stats={stats} />
      <PerformanceCharts stats={stats} />
      
      <div className="ud-meta-grid mt-6">
        <div className="lg:col-span-2">
          <RecentActivity users={users} setView={setView} />
        </div>
        <div className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">Quick Actions</h3>
          <p className="mt-2 text-xl font-black uppercase tracking-tight text-[var(--foreground)]">Manage Instantly</p>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => setView("applications")}
              className="theme-transition flex w-full items-center justify-between rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--foreground)] hover:brightness-95"
            >
              <span>Review Pending Apps</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-white text-xs">
                {stats.pending}
              </span>
            </button>
            <button
              onClick={() => setView("admin-settings")}
              className="theme-transition flex w-full items-center justify-between rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--foreground)] hover:brightness-95"
            >
              <span>Manage Users</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-white text-xs">
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
