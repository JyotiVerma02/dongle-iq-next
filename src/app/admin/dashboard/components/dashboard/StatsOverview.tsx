import { Users, Clock, CheckCircle2, XCircle, IndianRupee } from "lucide-react";
import { StatsCard } from "../common/StatsCard";
import { DashboardStats } from "../../types";

interface StatsOverviewProps {
  stats: DashboardStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="ud-stat-grid mb-8">
      <StatsCard
        title="TOTAL APPLICATION"
        value={stats.totalApplications}
        icon={Users}
        color="blue"
      />
      <StatsCard
        title="PENDING"
        value={stats.pending}
        icon={Clock}
        color="amber"
      />
      <StatsCard
        title="APPROVED"
        value={stats.approved}
        icon={CheckCircle2}
        color="amber"
      />
      <StatsCard
        title="REJECTED"
        value={stats.rejected}
        icon={XCircle}
        color="rose"
      />
      <StatsCard
        title="REVENUE"
        value={stats.totalRevenue}
        isCurrency={true}
        icon={IndianRupee}
        color="purple"
      />
    </div>
  );
}
