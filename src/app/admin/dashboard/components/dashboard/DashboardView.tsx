import dynamic from "next/dynamic";
import Image from "next/image";
import { DashboardStats, User, DashboardView } from "../../types";
import { StatsOverview } from "./StatsOverview";
import { RecentActivity } from "./RecentActivity";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";
import {
  Calendar,
  FileSearch,
  FilePlus,
  UserPlus,
  IndianRupee,
  FileBarChart,
  List,
} from "lucide-react";

const PerformanceCharts = dynamic(
  () => import("./PerformanceCharts").then((mod) => mod.PerformanceCharts),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[340px] w-full animate-pulse rounded-xl"
        style={{
          backgroundColor: "var(--skeleton)",
          border: "1px solid var(--border-soft)",
        }}
      />
    ),
  }
);

interface DashboardViewProps {
  stats: DashboardStats;
  users: User[];
  setView: (view: DashboardView) => void;
}

export function DashboardMainView({ stats, users, setView }: DashboardViewProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Performance Overview Header ──────────────────────────── */}
      <div
        className="mb-6 rounded-xl border p-5 sm:p-6"
        style={{
          borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          background: isDarkMode
            ? "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))"
            : "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.95))",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] font-black uppercase tracking-[0.24em] mb-2"
              style={{ color: "#ff6a00" }}
            >
              Performance Overview
            </p>
            {isDarkMode ? (
              <>
                <h2
                  className="text-xl sm:text-2xl font-black tracking-tight"
                  style={{ color: "#f8fafc" }}
                >
                  PERFORMANCE OVERVIEW
                </h2>
                <p
                  className="mt-1.5 text-[12px] font-medium leading-relaxed max-w-lg"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Monitor your platform performance and key business metrics in real-time.
                </p>
              </>
            ) : (
              <>
                <h2
                  className="text-xl sm:text-2xl font-black tracking-tight"
                  style={{ color: "#0f172a" }}
                >
                  Monitor your platform performance
                </h2>
                <p
                  className="mt-1.5 text-[12px] font-medium leading-relaxed max-w-lg"
                  style={{ color: "#64748b" }}
                >
                  Monitor your platform performance and key business metrics in real-time.
                </p>
              </>
            )}
          </div>

          {/* Hero illustration (light mode only) */}
          {!isDarkMode && (
            <div className="hidden lg:block shrink-0 -mt-4 -mb-4 -mr-2">
              <Image
                src="/dashboard-hero.png"
                alt="Dashboard hero"
                width={200}
                height={160}
                className="object-contain"
                priority
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[11px] font-bold transition-all hover:border-[#ff6a00]"
              style={{
                borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#ffffff",
                color: isDarkMode ? "#f8fafc" : "#0f172a",
              }}
            >
              <Calendar className="h-3.5 w-3.5" style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }} />
              May 20 – Jun 20, 2025
            </button>
            <button
              onClick={() => setView("track-dsc")}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[11px] font-bold transition-all hover:border-[#ff6a00]"
              style={{
                borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#ffffff",
                color: isDarkMode ? "#f8fafc" : "#0f172a",
              }}
            >
              <FileSearch className="h-3.5 w-3.5" style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }} />
              Track DSC
            </button>
            <button
              onClick={() => setView("reports")}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-bold text-white transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #ff6a00, #ff8533)",
                boxShadow: "0 4px 16px -4px rgba(255,106,0,0.45)",
              }}
            >
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────── */}
      <StatsOverview stats={stats} />

      {/* ── Charts Row ──────────────────────────────────────────── */}
      <div className="mb-6 grid gap-5 lg:grid-cols-3">
        <PerformanceCharts stats={stats} />
        <RecentActivity users={users} setView={setView} />
      </div>

      {/* ── Bottom Row: Revenue | DSC Types | Quick Actions ────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        <RevenueOverview isDarkMode={isDarkMode} />
        <TopDSCTypes isDarkMode={isDarkMode} />
        <QuickActions setView={setView} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

// ── Revenue Overview ──────────────────────────────────────────────────────
function RevenueOverview({ isDarkMode }: { isDarkMode: boolean }) {
  const revenueBarData = [
    { month: "Jan", value: 15000 },
    { month: "Feb", value: 28000 },
    { month: "Mar", value: 22000 },
    { month: "Apr", value: 45000 },
    { month: "May", value: 38000 },
    { month: "Jun", value: 55000 },
    { month: "Jul", value: 48918 },
  ];
  const maxValue = Math.max(...revenueBarData.map((d) => d.value));

  return (
    <div
      className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-5"
      style={{
        borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[11px] font-black uppercase tracking-[0.15em]"
          style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}
        >
          Revenue Overview
        </h3>
        <select
          className="rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-transparent outline-none cursor-pointer"
          style={{
            borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            color: isDarkMode ? "rgba(255,255,255,0.4)" : "#94a3b8",
          }}
        >
          <option>This Month</option>
          <option>Last Month</option>
        </select>
      </div>

      {/* Revenue amount + bar chart side by side */}
      <div className="flex gap-5">
        <div className="shrink-0">
          <p
            className="text-2xl font-black"
            style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}
          >
            ₹48,918
          </p>
          <p
            className="text-[10px] font-semibold mt-0.5"
            style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }}
          >
            Total Revenue
          </p>
          <span className="mt-2 inline-flex items-center text-[10px] font-bold text-emerald-500">
            ↑ 24.6% from last month
          </span>
        </div>

        {/* Bar chart */}
        <div className="flex-1 flex items-end gap-1" style={{ height: 100 }}>
          {revenueBarData.map((bar) => {
            const height = Math.max(8, (bar.value / maxValue) * 100);
            return (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm transition-all hover:brightness-110"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(180deg, #ff6a00 0%, ${isDarkMode ? "rgba(255,106,0,0.3)" : "rgba(255,106,0,0.5)"} 100%)`,
                    minHeight: 6,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Y-axis labels */}
      <div className="flex justify-end gap-4 mt-1">
        {["0", "25k", "50k", "75k"].map((label) => (
          <span key={label} className="text-[8px] font-semibold" style={{ color: isDarkMode ? "rgba(255,255,255,0.25)" : "#cbd5e1" }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Top DSC Types ─────────────────────────────────────────────────────────
function TopDSCTypes({ isDarkMode }: { isDarkMode: boolean }) {
  const dscTypes = [
    { name: "Aadhaar DSC", count: 18, total: 36, color: "#ff6a00" },
    { name: "Class 3 DSC", count: 12, total: 36, color: "#a855f7" },
    { name: "Organization DSC", count: 6, total: 36, color: "#3b82f6" },
  ];

  return (
    <div
      className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-5"
      style={{
        borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3
          className="text-[11px] font-black uppercase tracking-[0.15em]"
          style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}
        >
          Top DSC Types
        </h3>
        <button
          className="text-[10px] font-bold uppercase tracking-wider hover:brightness-110"
          style={{ color: "#ff6a00" }}
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {dscTypes.map((dsc) => {
          const percentage = Math.round((dsc.count / dsc.total) * 100);
          return (
            <div key={dsc.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: dsc.color }}
                  />
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}
                  >
                    {dsc.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }}
                  >
                    {dsc.count} Applications
                  </span>
                  <span
                    className="text-[11px] font-black"
                    style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${dsc.color}, ${dsc.color}bb)`,
                    boxShadow: `0 2px 8px -2px ${dsc.color}80`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Quick Actions ────────────────────────────────────────────────────────
function QuickActions({ setView, isDarkMode }: { setView: (view: DashboardView) => void; isDarkMode: boolean }) {
  const actions = [
    { icon: FilePlus, label: "New Application", onClick: () => setView("create-dsc") },
    { icon: UserPlus, label: "Add User", onClick: () => setView("admin-settings") },
    { icon: IndianRupee, label: "Verify Payment", onClick: () => {} },
    { icon: FileBarChart, label: "Generate Report", onClick: () => setView("reports") },
    { icon: List, label: "System Logs", onClick: () => {} },
  ];

  return (
    <div
      className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-5"
      style={{
        borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff",
      }}
    >
      <h3
        className="text-[11px] font-black uppercase tracking-[0.15em] mb-5"
        style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}
      >
        Quick Actions
      </h3>

      <div className="grid grid-cols-5 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 rounded-xl border p-3 transition-all hover:border-[#ff6a00] group"
              style={{
                borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl transition-all group-hover:scale-110"
                style={{
                  backgroundColor: isDarkMode ? "rgba(255,106,0,0.12)" : "rgba(255,106,0,0.08)",
                  color: "#ff6a00",
                }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className="text-[8px] font-bold text-center leading-tight uppercase tracking-wide"
                style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#64748b" }}
              >
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
