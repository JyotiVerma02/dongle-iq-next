import { Download, Calendar } from "lucide-react";
import { DashboardStats } from "../../types";
import { PerformanceCharts } from "../dashboard/PerformanceCharts";
import { formatCurrency } from "../../utils/formatters";

interface ReportsViewProps {
  stats: DashboardStats;
}

const topAgents = [
  { name: "Sunil Kumar", apps: 45, approved: 38, commission: 45000, rating: 5 },
  { name: "Meera Shah", apps: 32, approved: 28, commission: 32000, rating: 4 },
  { name: "Rajesh Gupta", apps: 28, approved: 22, commission: 28500, rating: 4 },
];

export function ReportsView({ stats }: ReportsViewProps) {
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
        <div className="mt-4 flex space-x-3 sm:mt-0">
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
            className="theme-primary-btn theme-transition inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white"
          >
            <Download className="h-3 w-3" />
            Export Report
          </button>
        </div>
      </div>

      <div className="ud-stat-grid mb-8">
        <div className="ud-surface ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">TOTAL REVENUE</p>
          <p className="mt-2 text-3xl font-black uppercase tracking-tight text-[var(--foreground)]">{formatCurrency(stats.totalRevenue)}</p>
          <div className="mt-2 flex items-center text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <span>+23% from last period</span>
          </div>
        </div>
        <div className="ud-surface ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">AVG. COMMISSION</p>
          <p className="mt-2 text-3xl font-black uppercase tracking-tight text-[var(--foreground)]">{formatCurrency(1250)}</p>
          <div className="mt-2 flex items-center text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <span>+5% from last period</span>
          </div>
        </div>
        <div className="ud-surface ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">CONVERSION RATE</p>
          <p className="mt-2 text-3xl font-black uppercase tracking-tight text-[var(--foreground)]">68%</p>
          <div className="mt-2 flex items-center text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <span>+2% from last period</span>
          </div>
        </div>
        <div className="ud-surface ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">ACTIVE AGENTS</p>
          <p className="mt-2 text-3xl font-black uppercase tracking-tight text-[var(--foreground)]">42</p>
          <div className="mt-2 flex items-center text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <span>+3 new this month</span>
          </div>
        </div>
      </div>

      <PerformanceCharts stats={stats} />

      <div className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border" style={{ borderColor: "var(--border-soft)" }}>
        <div className="border-b border-[var(--border-soft)] p-4 sm:p-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">TOP PERFORMING AGENTS / DSC PROVIDERS</h3>
        </div>
        <div className="overflow-x-auto rounded-b-xl">
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
