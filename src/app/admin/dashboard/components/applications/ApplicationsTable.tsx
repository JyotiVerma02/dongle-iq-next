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
    <div className="overflow-x-auto rounded-b-xl">
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
                <div className="text-[10px] font-black tracking-wider text-[var(--muted)] mt-0.5">
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
                <div className="text-[10px] font-black tracking-wider text-[var(--muted)] mt-0.5">{user.number}</div>
              </>
            ),
          },
          {
            header: "Service",
            render: (user) => (
              <>
                <div className="text-[10px] font-black tracking-wider text-[var(--foreground)]">{user.serviceType?.toUpperCase()}</div>
                <div className="text-[10px] font-black tracking-wider text-[var(--muted)] mt-0.5">{formatDate(user.createdAt)}</div>
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
                <div className="text-[10px] font-black tracking-wider text-[var(--foreground)] mt-1">
                  {formatCurrency(Number(user.price) + Number(user.commission) || 0)}
                </div>
              </>
            ),
          },
          {
            header: "Actions",
            align: "right",
            render: (user) => (
              <div className="flex items-center justify-end space-x-2">
                {user.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(user._id, "approved")}
                      disabled={updatingId === user._id}
                      className="rounded-lg p-1.5 text-[var(--foreground)] hover:bg-[var(--background-alt)] transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      <Check className="h-4 w-4 text-emerald-500" />
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(user._id, "rejected")}
                      disabled={updatingId === user._id}
                      className="rounded-lg p-1.5 text-[var(--foreground)] hover:bg-[var(--background-alt)] transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <X className="h-4 w-4 text-rose-500" />
                    </button>
                  </>
                )}
                <button
                  className="rounded-lg p-1.5 text-[var(--accent)] hover:bg-[var(--background-alt)] transition-colors"
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
            <p className="mt-2 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Try adjusting your filters or search terms.</p>
          </div>
        }
      />
    </div>
  );
}
