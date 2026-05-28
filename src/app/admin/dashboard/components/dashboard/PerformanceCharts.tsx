import { memo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardStats } from "../../types";
import { useTheme } from "@/components/ThemeContext";

interface PerformanceChartsProps {
  stats: DashboardStats;
}

const STATUS_COLORS = ["#22c55e", "#f97316", "#f43f5e"];

const applicationData = [
  { name: "May 20", total: 20, approved: 12 },
  { name: "May 27", total: 35, approved: 18 },
  { name: "Jun 03", total: 45, approved: 22 },
  { name: "Jun 10", total: 55, approved: 32 },
  { name: "Jun 17", total: 70, approved: 45 },
  { name: "Jun 20", total: 85, approved: 55 },
];

const renderCenterLabel = (total: number, isDark: boolean) => {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
      <tspan
        x="50%"
        dy="-8"
        style={{
          fontSize: "22px",
          fontWeight: 900,
          fill: isDark ? "#f8fafc" : "#0f172a",
        }}
      >
        {total}
      </tspan>
      <tspan
        x="50%"
        dy="20"
        style={{
          fontSize: "10px",
          fontWeight: 600,
          fill: isDark ? "rgba(255,255,255,0.4)" : "#94a3b8",
        }}
      >
        Total
      </tspan>
    </text>
  );
};

export const PerformanceCharts = memo(function PerformanceCharts({
  stats,
}: PerformanceChartsProps) {
  const { isDarkMode } = useTheme();

  const statusData = [
    { name: "Approved", value: stats.approved || 12, color: "#22c55e" },
    { name: "Pending", value: stats.pending || 12, color: "#f97316" },
    { name: "Rejected", value: stats.rejected || 12, color: "#f43f5e" },
  ];

  const totalApplications = statusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <>
      {/* ── Applications Overview (Area Chart) ───────────────── */}
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
            Applications Overview
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
            <option>Last 3 Months</option>
          </select>
        </div>

        {/* Stats above chart */}
        <div className="flex items-end gap-6 mb-4">
          <div>
            <p className="text-2xl font-black" style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}>
              {stats.totalApplications || 36}
            </p>
            <p className="text-[10px] font-semibold" style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
              Total
            </p>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "#f97316" }}>
              {stats.pending || 12}
            </p>
            <p className="text-[10px] font-semibold" style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
              Pending
            </p>
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: "#22c55e" }}>
              {stats.approved || 12}
            </p>
            <p className="text-[10px] font-semibold" style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
              Approved
            </p>
          </div>
        </div>

        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={applicationData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradOrange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff6a00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6a00" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="areaGradGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: isDarkMode ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: isDarkMode ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                  boxShadow: "0 16px 40px -20px rgba(0,0,0,0.3)",
                  background: isDarkMode ? "rgba(12,14,20,0.95)" : "rgba(255,255,255,0.98)",
                  color: isDarkMode ? "#f8fafc" : "#0f172a",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#ff6a00"
                strokeWidth={2.5}
                fill="url(#areaGradOrange)"
                dot={{ r: 3, fill: "#ff6a00", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#ff6a00", stroke: "#fff", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="approved"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#areaGradGreen)"
                dot={{ r: 2.5, fill: "#22c55e", strokeWidth: 0 }}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Application Status Breakdown (Donut Chart) ────────── */}
      <div
        className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-5"
        style={{
          borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3
            className="text-[11px] font-black uppercase tracking-[0.15em]"
            style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}
          >
            Application Status Breakdown
          </h3>
          <button
            className="text-[10px] font-bold uppercase tracking-wider hover:brightness-110"
            style={{ color: "#ff6a00" }}
          >
            View All
          </button>
        </div>

        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={52}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                  />
                ))}
              </Pie>
              {renderCenterLabel(totalApplications, isDarkMode)}
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                  background: isDarkMode ? "rgba(12,14,20,0.95)" : "rgba(255,255,255,0.98)",
                  color: isDarkMode ? "#f8fafc" : "#0f172a",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-1 space-y-2.5">
          {statusData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-semibold" style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}>
                  {item.name}
                </span>
              </div>
              <span className="text-[11px] font-medium" style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
                {item.value} ({((item.value / totalApplications) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
});
