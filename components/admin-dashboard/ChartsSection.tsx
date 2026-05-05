"use client";

import { ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";

import type { AdminProfile, DashboardStats, DashboardView } from "@/components/admin-dashboard/types";

export function ChartsSection({
  stats,
  chartData,
  admin,
  isDarkMode,
  colors,
  onViewChange,
}: {
  stats: DashboardStats;
  chartData: Array<{ name: string; value: number }>;
  admin: AdminProfile | null;
  isDarkMode: boolean;
  colors: {
    borderSoft: string;
    subtleText: string;
    text: string;
    muted: string;
    panel: string;
    panelStrong: string;
  };
  onViewChange: (view: DashboardView) => void;
}) {
  return (
    <div className="space-y-4">
      <div
        className="theme-transition rounded-xl border p-4 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        style={{
          borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          backgroundColor: colors.panelStrong,
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: colors.subtleText }}>
          Verification
        </p>
        <h2 className="mt-1 text-xl font-black" style={{ color: colors.text }}>
          Verification Status
        </h2>

        <div className="mt-4 space-y-3">
          <ProgressRow
            label="Aadhaar verified"
            value={stats.verified}
            accent="bg-gradient-to-r from-[#45c3b9] to-emerald-400"
            total={stats.total}
            colors={colors}
          />
          <ProgressRow
            label="Approval rate"
            value={stats.approved}
            total={Math.max(stats.total, 1)}
            accent="bg-emerald-400"
            colors={colors}
          />
        </div>
      </div>

      <div
        className="theme-transition rounded-xl border p-4 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        style={{
          borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          backgroundColor: colors.panelStrong,
        }}
      >
        <h3 className="mb-3 text-base font-bold">User Status</h3>

        <div className="flex min-h-44 min-w-0 w-full items-center justify-center">
          {chartData.length > 0 ? (
            <PieChart width={240} height={176}>
              <Pie
                data={chartData}
                dataKey="value"
                outerRadius={70}
                innerRadius={40}
                paddingAngle={4}
                label
                stroke="none"
                style={{ outline: "none" }}
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
            </PieChart>
          ) : (
            <div className="h-44 w-full rounded-xl" style={{ backgroundColor: colors.panel }} />
          )}
        </div>
      </div>

      <div
        className="theme-transition rounded-xl border p-4 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        style={{
          borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          backgroundColor: colors.panelStrong,
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: colors.subtleText }}>
          Admin snapshot
        </p>

        <div className="mt-4 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#45c3b9]/15 text-xl font-black text-[#45c3b9]">
            {admin?.name?.charAt(0) || "A"}
          </div>

          <div>
            <h3 className="text-xl font-black" style={{ color: colors.text }}>
              {admin?.name || "Admin"}
            </h3>
            <p className="mt-1 text-sm" style={{ color: colors.muted }}>
              {admin?.email || "No email found"}
            </p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: colors.subtleText }}>
              {admin?.role || "admin"} • {admin?.number || "No mobile"}
            </p>
          </div>
        </div>

        <button
          onClick={() => onViewChange("admin")}
          className="theme-transition mt-5 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition"
          style={{
            borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            backgroundColor: colors.panel,
            color: colors.text,
          }}
        >
          Edit profile
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
  accent,
  colors,
}: {
  label: string;
  value: number;
  total: number;
  accent: string;
  colors: {
    text: string;
    subtleText: string;
    borderSoft: string;
  };
}) {
  const safeTotal = Math.max(total, 1);
  const percentage = Math.min(100, Math.round((value / safeTotal) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span style={{ color: colors.text }}>{label}</span>
        <span style={{ color: colors.subtleText }}>{percentage}%</span>
      </div>
      <div className="h-2 rounded-full" style={{ backgroundColor: colors.borderSoft }}>
        <div className={`h-2 rounded-full ${accent} transition-all duration-700 ease-out`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
