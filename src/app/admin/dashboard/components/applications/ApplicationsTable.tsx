import { User } from "../../types";
import { StatusBadge } from "../common/StatusBadge";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { MoreVertical, Check, X, Eye, Search } from "lucide-react";
import { useState } from "react";
import { Table } from "../common/Table";

interface ApplicationsTableProps {
  users: User[];
  onUpdateStatus: (userId: string, status: string) => Promise<boolean>;
}

export function ApplicationsTable({ users, onUpdateStatus }: ApplicationsTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (userId: string, status: string) => {
    setUpdatingId(userId);
    await onUpdateStatus(userId, status);
    setUpdatingId(null);
  };

  return (
    <>
      <div className="space-y-3 md:hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[var(--card)] px-4 py-12 text-center">
            <div className="mb-4 flex items-center justify-center rounded-full bg-[var(--background-alt)] p-4 shadow-inner">
              <Search className="h-6 w-6 text-[var(--muted)]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--foreground)]">No applications found</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="rounded-xl border border-[var(--border-soft)] bg-[var(--card)] p-4 shadow-[0_18px_40px_-32px_var(--accent-shadow)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase text-[var(--foreground)]">
                    {user.name || "N/A"}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                    ID: {user._id?.substring(0, 6).toUpperCase()}
                  </p>
                </div>
                <StatusBadge status={user.status} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-[var(--background-alt)] px-3 py-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">Contact</p>
                  <p className="mt-1 break-all text-xs font-semibold uppercase text-[var(--foreground)]">{user.email}</p>
                  <p className="mt-1 text-[10px] font-black tracking-wider text-[var(--muted)]">{user.number}</p>
                </div>
                <div className="rounded-lg bg-[var(--background-alt)] px-3 py-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">Service</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]">{user.serviceType?.toUpperCase()}</p>
                  <p className="mt-1 text-[10px] font-black tracking-wider text-[var(--muted)]">{formatDate(user.createdAt)}</p>
                </div>
                <div className="rounded-lg bg-[var(--background-alt)] px-3 py-2 sm:col-span-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">Payment</p>
                  <div className="mt-1">
                    <StatusBadge status={user.paymentStatus} type="payment" />
                  </div>
                  <p className="mt-2 text-[10px] font-black tracking-wider text-[var(--foreground)]">
                    {formatCurrency(Number(user.price) + Number(user.commission) || 0)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {user.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(user._id, "approved")}
                      disabled={updatingId === user._id}
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600 disabled:opacity-50"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(user._id, "rejected")}
                      disabled={updatingId === user._id}
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-rose-500 disabled:opacity-50"
                      title="Reject"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}
                <button
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)]"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-b-xl md:block">
        <Table
          data={users}
          columns={[
            {
              header: "",
              render: () => (
                <input type="checkbox" className="rounded border-[var(--border-soft)] bg-transparent text-[var(--accent)] focus:ring-[var(--accent)]" />
              ),
            },
            {
              header: "Applicant",
              render: (user) => (
                <>
                  <div className="font-semibold text-xs text-[var(--foreground)] uppercase">
                    {user.name || "N/A"}
                  </div>
                  <div className="mt-0.5 text-[10px] font-black tracking-wider text-[var(--muted)]">
                    ID: {user._id?.substring(0, 6).toUpperCase()}
                  </div>
                </>
              ),
            },
            {
              header: "Contact",
              render: (user) => (
                <>
                  <div className="text-[10px] font-semibold text-[var(--foreground)] uppercase">{user.email}</div>
                  <div className="mt-0.5 text-[10px] font-black tracking-wider text-[var(--muted)]">{user.number}</div>
                </>
              ),
            },
            {
              header: "Service",
              render: (user) => (
                <>
                  <div className="text-[10px] font-black tracking-wider text-[var(--foreground)]">{user.serviceType?.toUpperCase()}</div>
                  <div className="mt-0.5 text-[10px] font-black tracking-wider text-[var(--muted)]">{formatDate(user.createdAt)}</div>
                </>
              ),
            },
            {
              header: "Status",
              render: (user) => <StatusBadge status={user.status} />,
            },
            {
              header: "Payment",
              render: (user) => (
                <>
                  <div className="font-medium">
                    <StatusBadge status={user.paymentStatus} type="payment" />
                  </div>
                  <div className="mt-1 text-[10px] font-black tracking-wider text-[var(--foreground)]">
                    {formatCurrency(Number(user.price) + Number(user.commission) || 0)}
                  </div>
                </>
              ),
            },
            {
              header: "Actions",
              align: "right",
              render: (user) => (
                <div className="flex items-center justify-end gap-2">
                  {user.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(user._id, "approved")}
                        disabled={updatingId === user._id}
                        className="rounded-lg p-1.5 text-[var(--foreground)] transition-colors hover:bg-[var(--background-alt)] disabled:opacity-50"
                        title="Approve"
                      >
                        <Check className="h-4 w-4 text-orange-500" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(user._id, "rejected")}
                        disabled={updatingId === user._id}
                        className="rounded-lg p-1.5 text-[var(--foreground)] transition-colors hover:bg-[var(--background-alt)] disabled:opacity-50"
                        title="Reject"
                      >
                        <X className="h-4 w-4 text-rose-500" />
                      </button>
                    </>
                  )}
                  <button
                    className="rounded-lg p-1.5 text-[var(--accent)] transition-colors hover:bg-[var(--background-alt)]"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
          keyExtractor={(user) => user._id}
          emptyMessage={
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 flex items-center justify-center rounded-full bg-[var(--background-alt)] p-4 shadow-inner">
                <Search className="h-6 w-6 text-[var(--muted)]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--foreground)]">No applications found</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Try adjusting your filters or search terms.</p>
            </div>
          }
        />
      </div>
    </>
  );
}
