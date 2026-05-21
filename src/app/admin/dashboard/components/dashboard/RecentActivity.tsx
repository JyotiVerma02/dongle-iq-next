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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

      <div className="space-y-3 md:hidden">
        {recentUsers.length === 0 ? (
          <p className="text-sm font-medium text-[var(--muted)]">No recent applications found.</p>
        ) : (
          recentUsers.map((user) => (
            <div
              key={user._id}
              className="rounded-xl border border-[var(--border-soft)] bg-[var(--background-alt)] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
                  <p className="mt-1 break-all text-xs font-medium text-[var(--muted)]">{user.email}</p>
                </div>
                <StatusBadge status={user.status} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-md bg-[var(--card)] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]">
                  {user.serviceType.toUpperCase()}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block">
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
    </div>
  );
}
