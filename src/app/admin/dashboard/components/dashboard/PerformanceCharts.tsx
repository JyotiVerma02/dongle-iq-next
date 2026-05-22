import { memo } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardStats } from "../../types";

interface PerformanceChartsProps {
  stats: DashboardStats;
}

const COLORS = ["#ff6a00", "#ff6a00", "#ff6a00"];
const SERVICE_COLORS = ["#ff6a00", "#ff6a00", "#ff6a00"];

const tooltipStyle = {
  borderRadius: "14px",
  border: "1px solid var(--border-soft)",
  boxShadow: "0 24px 54px -30px rgba(255,106,0,0.35)",
  background: "rgba(12,12,12,0.92)",
  color: "#ffffff",
};

const revenueData = [
  { name: "Jan", value: 10000 },
  { name: "Feb", value: 15000 },
  { name: "Mar", value: 12000 },
  { name: "Apr", value: 20000 },
  { name: "May", value: 18000 },
  { name: "Jun", value: 30000 },
];

export const PerformanceCharts = memo(function PerformanceCharts({
  stats,
}: PerformanceChartsProps) {
  const statusData = [
    { name: "Approved", value: stats.approved },
    { name: "Pending", value: stats.pending },
    { name: "Rejected", value: stats.rejected },
  ];

  const serviceData = [
    { name: "DSC", value: stats.dscPercentage },
    { name: "Token", value: stats.tokenPercentage },
    { name: "Assisted", value: stats.assistedPercentage },
  ];

  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-3">
      <div
        className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6"
        style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}
      >
        <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">
          Status Breakdown
        </h3>
        <div style={{ width: "100%", height: 250, minHeight: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6"
        style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}
      >
        <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">
          Service Breakdown (%)
        </h3>
        <div style={{ width: "100%", height: 300, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={serviceData} innerRadius={0} outerRadius={80} dataKey="value">
                {serviceData.map((entry, index) => (
                  <Cell
                    key={`service-cell-${entry.name}`}
                    fill={SERVICE_COLORS[index % SERVICE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value ?? 0}%`, "Percentage"]}
                contentStyle={tooltipStyle}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6"
        style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}
      >
        <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">
          Revenue Trend
        </h3>
        <div style={{ width: "100%", height: 300, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,140,0,0.14)"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted)" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted)" }}
                tickFormatter={(value) => `Rs${value / 1000}k`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [`Rs${Number(value ?? 0).toLocaleString()}`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#ff6a00"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#ff6a00", stroke: "#ff6a00" }}
                activeDot={{ r: 6, fill: "#ff6a00", stroke: "#ff6a00" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});
