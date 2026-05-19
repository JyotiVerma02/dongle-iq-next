import { User } from "../../types";
import { StatusBadge } from "../common/StatusBadge";
import { formatDate } from "../../utils/formatters";
import { ArrowRight } from "lucide-react";
import { DashboardView } from "../../types";
import { Table } from "../common/Table";

interface RecentActivityProps {
  users: User[];
  setView: (view: DashboardView) => void;
}

export function RecentActivity({ users, setView }: RecentActivityProps) {
  const recentUsers = users.slice(0, 5);

  return (
    <div className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">
          RECENT APPLICATIONS
        </h3>
        <button
          onClick={() => setView("applications")}
          className="group flex items-center text-[10px] font-black uppercase tracking-[0.24em] text-[var(--accent)] hover:brightness-110"
        >
          View All
          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <Table
        data={recentUsers}
        columns={[
          {
            header: "NAME",
            accessor: "name",
            className: "font-semibold text-[var(--foreground)] text-xs",
          },
          {
            header: "CONTACT",
            accessor: "email",
            className: "text-[var(--muted)] text-xs font-medium",
          },
          {
            header: "SERVICE",
            render: (user) => (
              <span className="inline-flex rounded-md bg-[var(--background-alt)] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]">
                {user.serviceType.toUpperCase()}
              </span>
            ),
          },
          {
            header: "STATUS",
            render: (user) => <StatusBadge status={user.status} />,
          },
          {
            header: "DATE",
            align: "right",
            className: "text-[var(--muted)] text-[10px] font-black uppercase tracking-wider",
            render: (user) => formatDate(user.createdAt),
          },
        ]}
        keyExtractor={(user) => user._id}
        emptyMessage="No recent applications found."
      />
    </div>
  );
}
