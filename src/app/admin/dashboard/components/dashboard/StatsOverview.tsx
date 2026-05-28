import { FileText, Clock, CheckCircle2, AlertCircle, IndianRupee } from "lucide-react";
import { StatsCard } from "../common/StatsCard";
import { DashboardStats } from "../../types";

interface StatsOverviewProps {
  stats: DashboardStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
      <StatsCard
        title="TOTAL APPLICATIONS"
        value={stats.totalApplications || 36}
        trend={18.5}
        icon={FileText}
        color="purple"
      />
      <StatsCard
        title="PENDING APPLICATIONS"
        value={stats.pending || 12}
        trend={8.3}
        icon={Clock}
        color="amber"
      />
      <StatsCard
        title="APPROVED APPLICATIONS"
        value={stats.approved || 12}
        trend={22.1}
        icon={CheckCircle2}
        color="emerald"
      />
      <StatsCard
        title="REJECTED APPLICATIONS"
        value={stats.rejected || 12}
        trend={-5.2}
        icon={AlertCircle}
        color="rose"
      />
      <StatsCard
        title="TOTAL REVENUE"
        value={stats.totalRevenue || 48918}
        trend={24.6}
        isCurrency={true}
        icon={IndianRupee}
        color="blue"
      />
    </div>
  );
}
