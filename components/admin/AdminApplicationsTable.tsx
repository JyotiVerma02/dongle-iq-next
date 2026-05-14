"use client";

import { memo } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { DashboardUser } from "@/components/UserLedger";
import { EmptyState, SkeletonBlock } from "@/components/admin-dashboard/ui";
import {
  ActionIconButton,
  SortableHead,
  StatusBadge,
  formatDate,
} from "@/components/admin/utils/adminApplicationsHelpers";

type SortConfig = {
  key: "createdAt" | "name" | "email" | "certType" | "status" | "validity";
  direction: "asc" | "desc";
};

type AdminApplicationsTableProps = {
  tableUsers: DashboardUser[];
  selectedUserId: string | null;
  sortConfig: SortConfig;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  colors: Record<string, string>;
  isDarkMode: boolean;
  loading: boolean;
  tableLoading: boolean;
  onSort: (key: SortConfig["key"]) => void;
  onUserSelection: (userId: string, nextMode: "view" | "edit") => void;
  onDeleteClick: (user: DashboardUser) => void;
  onPageChange: (page: number) => void;
};

const AdminApplicationsTable = memo(function AdminApplicationsTable({
  tableUsers,
  selectedUserId,
  sortConfig,
  pagination,
  colors,
  isDarkMode,
  loading,
  tableLoading,
  onSort,
  onUserSelection,
  onDeleteClick,
  onPageChange,
}: AdminApplicationsTableProps) {
  const isLoading = loading || tableLoading;
  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={`applicant-skeleton-${index}`}
              className="grid gap-3 rounded-lg border px-3 py-3 md:grid-cols-[1.2fr_1fr_0.9fr_0.7fr_0.8fr]"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: colors.panel,
              }}
            >
              <SkeletonBlock className="h-10 w-full rounded-lg" />
              <SkeletonBlock className="h-10 w-full rounded-lg" />
              <SkeletonBlock className="h-10 w-full rounded-lg" />
              <SkeletonBlock className="h-10 w-full rounded-lg" />
              <SkeletonBlock className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : tableUsers.length === 0 ? (
        <EmptyState
          title="No applicants found"
          description="Try adjusting the filters or create a new applicant to start a fresh DSC workflow."
        />
      ) : (
        <>
          <div
            className="overflow-hidden rounded-lg border"
            style={{ borderColor: colors.borderSoft }}
          >
            <div className="hide-scrollbar overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(15,118,110,0.06)",
                    color: colors.muted,
                  }}
                >
                  <tr className="text-[10px] font-black uppercase tracking-[0.18em]">
                    <SortableHead
                      label="Applicant"
                      active={sortConfig.key === "name"}
                      direction={sortConfig.direction}
                      onClick={() => onSort("name")}
                    />
                    <SortableHead
                      label="Contact"
                      active={sortConfig.key === "email"}
                      direction={sortConfig.direction}
                      onClick={() => onSort("email")}
                    />
                    <SortableHead
                      label="Service"
                      active={sortConfig.key === "certType"}
                      direction={sortConfig.direction}
                      onClick={() => onSort("certType")}
                    />
                    <SortableHead
                      label="Validity"
                      active={sortConfig.key === "validity"}
                      direction={sortConfig.direction}
                      onClick={() => onSort("validity")}
                    />
                    <SortableHead
                      label="Status"
                      active={sortConfig.key === "status"}
                      direction={sortConfig.direction}
                      onClick={() => onSort("status")}
                    />
                    <SortableHead
                      label="Created"
                      active={sortConfig.key === "createdAt"}
                      direction={sortConfig.direction}
                      onClick={() => onSort("createdAt")}
                    />
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {tableUsers.map((user, index) => {
                    const isActive = user._id === selectedUserId;
                    return (
                      <tr
                        key={user._id}
                        className="transition duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                        style={{
                          backgroundColor: isActive
                            ? `${colors.accent}10`
                            : index % 2 === 0
                              ? colors.panel
                              : isDarkMode
                                ? "rgba(255,255,255,0.015)"
                                : "rgba(15,23,42,0.015)",
                          borderTop: `1px solid ${colors.borderSoft}`,
                        }}
                      >
                        <td className="min-w-0 px-4 py-3 align-top">
                          <button
                            type="button"
                            onClick={() => onUserSelection(user._id, "edit")}
                            className="w-full text-left"
                          >
                            <p className="truncate text-sm font-black">{user.name}</p>
                            <p className="mt-1 truncate text-xs" style={{ color: colors.subtleText }}>
                              {user.dscId || "DSC ID pending"}
                            </p>
                          </button>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="truncate text-sm font-semibold">{user.email}</p>
                          <p className="mt-1 text-xs" style={{ color: colors.subtleText }}>
                            {user.number}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <p className="text-sm font-semibold">{user.certType || "No service selected"}</p>
                          <p className="mt-1 text-xs" style={{ color: colors.subtleText }}>
                            {user.certificateClass || "Class III"}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top text-sm font-semibold">
                          {user.validity || "Not selected"}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-4 py-3 align-top text-xs" style={{ color: colors.subtleText }}>
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center justify-center gap-2">
                            <ActionIconButton
                              label={`View ${user.name}`}
                              onClick={() => onUserSelection(user._id, "view")}
                              icon={<Eye size={15} />}
                            />
                            <ActionIconButton
                              label={`Edit ${user.name}`}
                              onClick={() => onUserSelection(user._id, "edit")}
                              icon={<Pencil size={15} />}
                            />
                            <ActionIconButton
                              label={`Delete ${user.name}`}
                              onClick={() => onDeleteClick(user)}
                              icon={<Trash2 size={15} />}
                              danger
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm" style={{ color: colors.muted }}>
              Showing {startItem} to {endItem} of {pagination.total} applicants
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold disabled:opacity-50"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                  color: colors.text,
                }}
              >
                Previous
              </button>
              <span className="px-2 text-sm font-semibold" style={{ color: colors.text }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(pagination.pages, pagination.page + 1))}
                disabled={pagination.page === pagination.pages}
                className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold disabled:opacity-50"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                  color: colors.text,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
});

export default AdminApplicationsTable;