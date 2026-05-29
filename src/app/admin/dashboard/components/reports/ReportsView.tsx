import { useEffect, useMemo, useState } from "react";
import { Download, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { DashboardStats } from "../../types";
import { PerformanceCharts } from "../dashboard/PerformanceCharts";
import { formatCurrency } from "../../utils/formatters";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

interface ReportsViewProps {
  stats: DashboardStats;
}

type ReportResponse = {
  overview: {
    totalApplicants: number;
    pending: number;
    approved: number;
    rejected: number;
    dispatched: number;
    delivered: number;
    issued: number;
    paid: number;
    unpaid: number;
  };
  finance: {
    revenue: number;
    averageTicket: number;
  };
  conversion: {
    approvalRatio: number;
    fulfillmentRate: number;
  };
  trends: {
    recentApplications: Array<{
      date: string;
      count: number;
    }>;
    trendSeries: Array<{
      date: string;
      total: number;
      approved: number;
    }>;
  };
};

const topAgents = [
  { name: "Sunil Kumar", apps: 45, approved: 38, commission: 45000, rating: 5 },
  { name: "Meera Shah", apps: 32, approved: 28, commission: 32000, rating: 4 },
  { name: "Rajesh Gupta", apps: 28, approved: 22, commission: 28500, rating: 4 },
];

export function ReportsView({ stats }: ReportsViewProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReport = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await fetch("/api/admin/reports", { cache: "no-store" });
      const data = (await response.json()) as { success: boolean; report?: ReportResponse; message?: string };

      if (!response.ok || !data.success || !data.report) {
        throw new Error(data.message || "Failed to load analytics");
      }

      setReport(data.report);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, []);

  const trendData = useMemo(
    () =>
      report?.trends.trendSeries.map((entry) => ({
        name: new Date(entry.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        total: entry.total,
        approved: entry.approved,
      })) || [],
    [report],
  );

  const statusData = useMemo(
    () => [
      {
        name: "Approved",
        value: report?.overview.approved ?? stats.approved,
        color: "#22c55e",
      },
      {
        name: "Pending",
        value: report?.overview.pending ?? stats.pending,
        color: "#f97316",
      },
      {
        name: "Rejected",
        value: report?.overview.rejected ?? stats.rejected,
        color: "#f43f5e",
      },
    ],
    [report, stats.approved, stats.pending, stats.rejected],
  );

  const revenue = report?.finance.revenue ?? stats.totalRevenue;
  const averageTicket = report?.finance.averageTicket ?? 0;
  const approvalRatio = report?.conversion.approvalRatio ?? 0;
  const fulfillmentRate = report?.conversion.fulfillmentRate ?? 0;

  if (loading) {
    return (
      <div
        className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-6"
        style={{
          borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff",
        }}
      >
        <div className="h-5 w-44 animate-pulse rounded bg-[var(--skeleton)]" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-xl bg-[var(--skeleton)]" />
          ))}
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="h-[340px] animate-pulse rounded-xl bg-[var(--skeleton)]" />
          <div className="h-[340px] animate-pulse rounded-xl bg-[var(--skeleton)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">
            Analytics & Reports
          </h2>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
            In-depth analysis of your business performance.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 sm:mt-0">
          <div className="relative">
            <select className="appearance-none rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] py-2 pl-4 pr-10 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]">
              <option>Last 30 Days</option>
              <option>This Month</option>
              <option>Last Quarter</option>
              <option>This Year</option>
            </select>
              <Calendar className="absolute right-3 top-2.5 h-3 w-3 text-[var(--muted)]" />
          </div>
          <button
            onClick={() => void loadReport(false)}
            className="theme-primary-btn theme-transition inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            className="theme-primary-btn theme-transition inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accentLight})`,
            }}
          >
            <Download className="h-3 w-3" />
            Export Report
          </button>
        </div>
      </div>

      <div className="ud-stat-grid mb-8">
        <div className="ud-surface ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">TOTAL REVENUE</p>
          <p className="mt-2 text-3xl font-black uppercase tracking-tight text-[var(--foreground)]">{formatCurrency(revenue)}</p>
          <div className="mt-2 flex items-center text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <span>+23% from last period</span>
          </div>
        </div>
        <div className="ud-surface ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">AVG. COMMISSION</p>
          <p className="mt-2 text-3xl font-black uppercase tracking-tight text-[var(--foreground)]">{formatCurrency(averageTicket)}</p>
          <div className="mt-2 flex items-center text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <span>+5% from last period</span>
          </div>
        </div>
        <div className="ud-surface ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">CONVERSION RATE</p>
          <p className="mt-2 text-3xl font-black uppercase tracking-tight text-[var(--foreground)]">{Math.round(approvalRatio * 100)}%</p>
          <div className="mt-2 flex items-center text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <span>Fulfillment {Math.round(fulfillmentRate * 100)}%</span>
          </div>
        </div>
        <div className="ud-surface ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">ACTIVE AGENTS</p>
          <p className="mt-2 text-3xl font-black uppercase tracking-tight text-[var(--foreground)]">{report?.overview.approved ?? stats.approved}</p>
          <div className="mt-2 flex items-center text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <span>{report?.overview.totalApplicants ?? stats.totalApplications} total applicants</span>
          </div>
        </div>
      </div>

      <PerformanceCharts stats={stats} trendData={trendData} statusData={statusData} />

      <div className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border" style={{ borderColor: "var(--border-soft)" }}>
        <div className="border-b border-[var(--border-soft)] p-4 sm:p-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">TOP PERFORMING AGENTS / DSC PROVIDERS</h3>
        </div>
        <div className="overflow-x-auto rounded-b-xl">
          {!topAgents.length ? (
            <div className="flex items-center gap-2 p-6 text-sm text-[var(--muted)]">
              <AlertCircle className="h-4 w-4" />
              No analytics rows available yet.
            </div>
          ) : null}
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--background-alt)]">
              <tr className="border-b border-[var(--border-soft)] text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                <th className="px-6 py-4">Agent Name</th>
                <th className="px-6 py-4 text-center">Applications</th>
                <th className="px-6 py-4 text-center">Approved</th>
                <th className="px-6 py-4 text-right">Commission</th>
                <th className="px-6 py-4 text-center">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-soft)]">
              {topAgents.map((agent, i) => (
                <tr key={i} className="transition-colors hover:bg-[var(--background-alt)]">
                  <td className="px-6 py-4 font-semibold text-xs text-[var(--foreground)] uppercase">{agent.name}</td>
                  <td className="px-6 py-4 text-center text-[10px] font-black tracking-wider text-[var(--muted)]">{agent.apps}</td>
                  <td className="px-6 py-4 text-center text-[10px] font-black tracking-wider text-orange-600 dark:text-orange-400">{agent.approved}</td>
                  <td className="px-6 py-4 text-right text-[10px] font-black tracking-wider text-[var(--foreground)]">{formatCurrency(agent.commission)}</td>
                  <td className="px-6 py-4 text-center text-amber-500 text-xs">
                    {"★".repeat(agent.rating)}{"☆".repeat(5 - agent.rating)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
