"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Eye,
  FileSpreadsheet,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";
import type { DashboardUser } from "@/components/UserLedger";
import AdminApplicationPreview from "@/components/admin/AdminApplicationPreview";
import AdminApplicationEditor from "@/components/admin/AdminApplicationEditor";
import { EmptyState, SkeletonBlock } from "@/components/admin-dashboard/ui";

type ApplicationFetch = {
  _id: string;
  dscId?: string;
  name: string;
  email: string;
  number: string;
  gender?: string;
  dob?: string;
  pan?: string;
  ekycId?: string;
  ekycPin?: string;
  bpCode?: string;
  address?: string;
  pincode?: string;
  city?: string;
  state?: string;
  certificateClass: string;
  certType: string;
  validity: string;
  tokenType: string;
  addressProof?: string;
  idProof?: string;
  photo?: string;
  internalRemarks?: string;
  isVerified?: boolean;
  isAadhaarVerified?: boolean;
  status: DashboardUser["status"];
  price?: number;
  createdAt: string;
  updatedAt: string;
};

type ApplicantsResponse = {
  success?: boolean;
  users?: DashboardUser[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters?: {
    certTypes: string[];
    validities: string[];
  };
  stats?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    issued: number;
  };
};

type AdminApplicationsPanelProps = {
  users: DashboardUser[];
  loading: boolean;
  onBack: () => void;
  onUsersChange: (users: DashboardUser[]) => void;
};

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  "all",
  "pending",
  "approved",
  "rejected",
  "issued",
] as const;

export default function AdminApplicationsPanel({
  users,
  loading,
  onUsersChange,
}: AdminApplicationsPanelProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_OPTIONS)[number]>("all");
  const [validityFilter, setValidityFilter] = useState("all");
  const [certTypeFilter, setCertTypeFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: "createdAt" | "name" | "email" | "certType" | "status" | "validity";
    direction: "asc" | "desc";
  }>({
    key: "createdAt",
    direction: "desc",
  });
  const [page, setPage] = useState(1);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableUsers, setTableUsers] = useState<DashboardUser[]>(users);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: users.length,
    pages: Math.max(1, Math.ceil(users.length / PAGE_SIZE)),
  });
  const [filterOptions, setFilterOptions] = useState({
    certTypes: [] as string[],
    validities: [] as string[],
  });
  const [stats, setStats] = useState({
    total: users.length,
    pending: users.filter((user) => user.status === "pending").length,
    approved: users.filter((user) => user.status === "approved").length,
    rejected: users.filter((user) => user.status === "rejected").length,
    issued: users.filter((user) => user.status === "issued").length,
  });

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "create">("edit");
  const [savingApplication, setSavingApplication] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] =
    useState<DashboardUser | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DashboardUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const selectedUser = useMemo(
    () => tableUsers.find((user) => user._id === selectedUserId) ?? null,
    [selectedUserId, tableUsers],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, validityFilter, certTypeFilter]);

  const fetchApplicants = async () => {
    setTableLoading(true);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        status: statusFilter,
        validity: validityFilter,
        certType: certTypeFilter,
        page: String(page),
        limit: String(PAGE_SIZE),
        sortKey: sortConfig.key,
        sortDir: sortConfig.direction,
      });

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        cache: "no-store",
      });
      const data = (await response
        .json()
        .catch(() => null)) as ApplicantsResponse | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to load applicants");
      }

      setTableUsers(data.users ?? []);
      setPagination(data.pagination ?? pagination);
      setFilterOptions(data.filters ?? { certTypes: [], validities: [] });
      setStats(
        data.stats ?? {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          issued: 0,
        },
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load applicants",
      );
    } finally {
      setTableLoading(false);
    }
  };

  const refreshUsers = async (preferredUserId?: string) => {
    try {
      const response = await fetch("/api/get-users", { cache: "no-store" });
      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        users?: DashboardUser[];
        message?: string;
      } | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to load applicants");
      }

      onUsersChange(data.users ?? []);

      if (preferredUserId) {
        setSelectedUserId(preferredUserId);
      }

      await fetchApplicants();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load applicants",
      );
    }
  };

  const refreshUserInitialValues = async (userId: string) => {
    setSelectedUserDetails(null);

    try {
      const response = await fetch(
        `/api/admin/application-details?userId=${userId}`,
        { cache: "no-store" },
      );
      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        user?: ApplicationFetch;
      } | null;

      if (!response.ok || !data?.success || !data.user) return;

      setSelectedUserDetails(data.user as DashboardUser);
    } catch (error) {
      console.error("Failed to fetch applicant details:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchApplicants();
  }, [
    searchQuery,
    statusFilter,
    validityFilter,
    certTypeFilter,
    page,
    sortConfig,
  ]);

  useEffect(() => {
    if (!selectedUserId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshUserInitialValues(selectedUserId);
  }, [selectedUserId]);

  const handleSort = (
    key: "createdAt" | "name" | "email" | "certType" | "status" | "validity",
  ) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleUserSelection = (userId: string, nextMode: "view" | "edit") => {
    setSelectedUserId(userId);
    setMode(nextMode);
    setFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setMode("edit");
    setSelectedUserId(null);
    setSelectedUserDetails(null);
  };

  const handleApplicationSubmit = async (payload: Record<string, string>) => {
    if (mode === "view") return;

    setSavingApplication(true);

    try {
      const response = await fetch("/api/admin/application-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          userId: mode === "create" ? "" : selectedUserDetails?._id || "",
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
        user?: DashboardUser;
      } | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to save application");
      }

      const savedUserId = data.user?._id || selectedUserDetails?._id;
      await refreshUsers(savedUserId);
      if (savedUserId) {
        await refreshUserInitialValues(savedUserId);
      }

      setFormModalOpen(false);
      toast.success(
        mode === "create"
          ? "Applicant and DSC application created successfully."
          : "Application updated successfully.",
      );
      setMode("edit");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save application",
      );
    } finally {
      setSavingApplication(false);
    }
  };

  const handleDeleteApplicant = async () => {
    if (!deleteTarget?._id) return;

    setDeletingUserId(deleteTarget._id);

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteTarget._id }),
      });
      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to delete applicant");
      }

      setDeleteTarget(null);
      toast.success("Applicant deleted successfully");
      await refreshUsers();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete applicant",
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  const exportApplicants = (format: "csv" | "excel") => {
    const dataset = users.map((user) => ({
      "DSC ID": user.dscId || "",
      Applicant: user.name || "",
      Email: user.email || "",
      Mobile: user.number || "",
      PAN: user.pan || "",
      Status: user.status || "",
      "Certificate Type": user.certType || "",
      Validity: user.validity || "",
      "Created At": user.createdAt || "",
    }));

    if (!dataset.length) {
      toast.error("No applicants available to export");
      return;
    }

    const headers = Object.keys(dataset[0]);
    const separator = format === "excel" ? "\t" : ",";
    const rows = dataset.map((row) =>
      headers
        .map(
          (header) =>
            `"${String(row[header as keyof typeof row] ?? "").replace(/"/g, '""')}"`,
        )
        .join(separator),
    );
    const fileContent = [headers.join(separator), ...rows].join("\n");
    const blob = new Blob([fileContent], {
      type:
        format === "excel"
          ? "application/vnd.ms-excel;charset=utf-8;"
          : "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dongleiq-applicants-${new Date().toISOString().slice(0, 10)}.${format === "excel" ? "xls" : "csv"}`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`Applicants exported as ${format.toUpperCase()}`);
  };

  const analyticsCards = [
    { label: "Total Applicants", value: stats.total, tone: "var(--accent)" },
    { label: "Issued DSCs", value: stats.issued, tone: "#2563eb" },
    { label: "Pending", value: stats.pending, tone: "#d97706" },
    { label: "Rejected", value: stats.rejected, tone: "#e11d48" },
  ];

  return (
    <>
      <div className="admin-compact-shell relative min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="mb-4 flex flex-col gap-2">
          <p
            className="text-[10px] font-black uppercase tracking-[0.24em]"
            style={{ color: colors.accent }}
          >
            Application Workspace
          </p>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1
                className="text-xl font-black lg:text-2xl"
                style={{ color: colors.text }}
              >
                Applications
              </h1>
              <p className="mt-1 text-[13px]" style={{ color: colors.muted }}>
                Compact applicant management with create, review, edit, filters,
                and exports in one admin flow.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedUserId(null);
                setSelectedUserDetails({
                  _id: "",
                  name: "",
                  email: "",
                  number: "",
                  role: "user",
                  status: "pending",
                  isVerified: false,
                  isAadhaarVerified: false,
                  createdAt: "",
                  updatedAt: "",
                });
                setMode("create");
                setFormModalOpen(true);
              }}
              className="theme-transition inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_20px_30px_-22px_var(--accent-shadow)] transition hover:-translate-y-0.5 active:scale-[0.99] sm:w-auto"
              style={{ background: "var(--brand-gradient)" }}
            >
              <UserPlus size={15} />
              New Applicant
            </button>
          </div>
        </div>

        <section className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {analyticsCards.map((card) => (
            <div
              key={card.label}
              className="admin-compact-panel rounded-lg px-4 py-4 transition duration-200 hover:-translate-y-0.5"
            >
              <p
                className="text-[10px] font-black uppercase tracking-[0.18em]"
                style={{ color: colors.subtleText }}
              >
                {card.label}
              </p>
              <p
                className="mt-3 text-2xl font-black"
                style={{ color: card.tone }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </section>

        <section
          className="admin-compact-panel rounded-lg p-3 sm:p-4"
          style={{ borderColor: colors.borderSoft }}
        >
          <div
            className="sticky top-0 z-10 -mx-3 mb-4 border-b px-3 pb-3 pt-0 backdrop-blur sm:-mx-4 sm:px-4"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: isDarkMode
                ? "rgba(10,19,30,0.78)"
                : "rgba(255,255,255,0.82)",
            }}
          >
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,0.75fr))]">
              <div className="relative min-w-0">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  size={15}
                  style={{ color: colors.muted }}
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by name, email, mobile, PAN or DSC ID"
                  className="h-11 w-full rounded-lg border bg-transparent pl-9 pr-3 text-sm outline-none"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.panel,
                    color: colors.text,
                  }}
                />
              </div>

              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_OPTIONS.map((value) => ({
                  label: capitalizeValue(value),
                  value,
                }))}
              />
              <FilterSelect
                value={validityFilter}
                onChange={setValidityFilter}
                options={[
                  { label: "All Validities", value: "all" },
                  ...filterOptions.validities.map((value) => ({
                    label: value,
                    value,
                  })),
                ]}
              />
              <FilterSelect
                value={certTypeFilter}
                onChange={setCertTypeFilter}
                options={[
                  { label: "All Certificate Types", value: "all" },
                  ...filterOptions.certTypes.map((value) => ({
                    label: value,
                    value,
                  })),
                ]}
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => exportApplicants("csv")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold uppercase tracking-[0.12em]"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.panel,
                    color: colors.text,
                  }}
                >
                  <Download size={14} />
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() => exportApplicants("excel")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold uppercase tracking-[0.12em]"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.panel,
                    color: colors.text,
                  }}
                >
                  <FileSpreadsheet size={14} />
                  Excel
                </button>
              </div>
            </div>
          </div>

          {loading || tableLoading ? (
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
                          onClick={() => handleSort("name")}
                        />
                        <SortableHead
                          label="Contact"
                          active={sortConfig.key === "email"}
                          direction={sortConfig.direction}
                          onClick={() => handleSort("email")}
                        />
                        <SortableHead
                          label="Service"
                          active={sortConfig.key === "certType"}
                          direction={sortConfig.direction}
                          onClick={() => handleSort("certType")}
                        />
                        <SortableHead
                          label="Validity"
                          active={sortConfig.key === "validity"}
                          direction={sortConfig.direction}
                          onClick={() => handleSort("validity")}
                        />
                        <SortableHead
                          label="Status"
                          active={sortConfig.key === "status"}
                          direction={sortConfig.direction}
                          onClick={() => handleSort("status")}
                        />
                        <SortableHead
                          label="Created"
                          active={sortConfig.key === "createdAt"}
                          direction={sortConfig.direction}
                          onClick={() => handleSort("createdAt")}
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
                                onClick={() =>
                                  handleUserSelection(user._id, "edit")
                                }
                                className="w-full text-left"
                              >
                                <p className="truncate text-sm font-black">
                                  {user.name}
                                </p>
                                <p
                                  className="mt-1 truncate text-xs"
                                  style={{ color: colors.subtleText }}
                                >
                                  {user.dscId || "DSC ID pending"}
                                </p>
                              </button>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <p className="truncate text-sm font-semibold">
                                {user.email}
                              </p>
                              <p
                                className="mt-1 text-xs"
                                style={{ color: colors.subtleText }}
                              >
                                {user.number}
                              </p>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <p className="text-sm font-semibold">
                                {user.certType || "No service selected"}
                              </p>
                              <p
                                className="mt-1 text-xs"
                                style={{ color: colors.subtleText }}
                              >
                                {user.certificateClass || "Class III"}
                              </p>
                            </td>
                            <td className="px-4 py-3 align-top text-sm font-semibold">
                              {user.validity || "Not selected"}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <StatusBadge status={user.status} />
                            </td>
                            <td
                              className="px-4 py-3 align-top text-xs"
                              style={{ color: colors.subtleText }}
                            >
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <div className="flex items-center justify-center gap-2">
                                <ActionIconButton
                                  label={`View ${user.name}`}
                                  onClick={() =>
                                    handleUserSelection(user._id, "view")
                                  }
                                  icon={<Eye size={15} />}
                                />
                                <ActionIconButton
                                  label={`Edit ${user.name}`}
                                  onClick={() =>
                                    handleUserSelection(user._id, "edit")
                                  }
                                  icon={<Pencil size={15} />}
                                />
                                <ActionIconButton
                                  label={`Delete ${user.name}`}
                                  onClick={() => setDeleteTarget(user)}
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
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}{" "}
                  of {pagination.total} applicants
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
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
                  <span
                    className="px-2 text-sm font-semibold"
                    style={{ color: colors.text }}
                  >
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.min(pagination.pages, current + 1),
                      )
                    }
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
        </section>
      </div>

      {isFormModalOpen &&
      (selectedUser || selectedUserDetails || mode === "create") ? (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md">
          <div
            className="flex h-screen w-screen max-w-none flex-col overflow-hidden rounded-none border-0 shadow-none"
            style={{ backgroundColor: colors.panelStrong }}
          >
            <div
              className="admin-sticky-footer flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6"
              style={{ borderColor: colors.borderSoft }}
            >
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-[0.24em]"
                  style={{ color: colors.accent }}
                >
                  {mode === "view"
                    ? "Application View"
                    : mode === "create"
                      ? "New Applicant + DSC"
                      : "Application Edit"}
                </p>
                <h3 className="mt-2 text-xl font-black">
                  {mode === "create"
                    ? "Create DSC Application"
                    : selectedUser?.name}
                </h3>
                <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                  {mode === "create"
                    ? "Fill the full applicant and DSC details in one fast workflow."
                    : `${selectedUser?.email || ""} | ${selectedUser?.number || ""}`}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseFormModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                }}
                aria-label="Close application form"
              >
                <X size={16} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {mode === "view" && selectedUserDetails ? (
                <AdminApplicationPreview user={selectedUserDetails} />
              ) : (
                <AdminApplicationEditor
                  user={selectedUserDetails ?? selectedUser ?? null}
                  mode={mode === "create" ? "create" : "edit"}
                  saving={savingApplication}
                  onSubmit={handleApplicationSubmit}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-lg border p-5 shadow-2xl"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.panelStrong,
            }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-[0.22em]"
              style={{ color: "#e11d48" }}
            >
              Delete Applicant
            </p>
            <h3
              className="mt-2 text-lg font-black"
              style={{ color: colors.text }}
            >
              Remove {deleteTarget.name}?
            </h3>
            <p
              className="mt-2 text-sm leading-6"
              style={{ color: colors.muted }}
            >
              This action will delete the applicant record from the admin list.
              Please confirm before continuing.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-semibold"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                  color: colors.text,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteApplicant}
                disabled={deletingUserId === deleteTarget._id}
                className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #be123c)",
                }}
              >
                {deletingUserId === deleteTarget._id
                  ? "Deleting..."
                  : "Delete Applicant"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-lg border px-3 text-sm font-semibold outline-none"
      style={{
        borderColor: "var(--border-soft)",
        backgroundColor: "var(--card)",
        color: "var(--foreground)",
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function SortableHead({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="cursor-pointer px-4 py-3" onClick={onClick}>
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {active ? (
          direction === "asc" ? (
            <ArrowUp size={12} />
          ) : (
            <ArrowDown size={12} />
          )
        ) : (
          <ArrowUpDown size={12} className="opacity-40" />
        )}
      </div>
    </th>
  );
}

function ActionIconButton({
  label,
  onClick,
  icon,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition hover:-translate-y-0.5 active:scale-95"
      style={{
        borderColor: danger ? "rgba(225,29,72,0.16)" : "var(--border-soft)",
        backgroundColor: "var(--card)",
        color: danger ? "#e11d48" : "var(--foreground)",
      }}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

function StatusBadge({ status }: { status: DashboardUser["status"] }) {
  const toneMap: Record<
    DashboardUser["status"],
    { bg: string; color: string }
  > = {
    pending: { bg: "rgba(245,158,11,0.16)", color: "#d97706" },
    approved: { bg: "rgba(34,197,94,0.16)", color: "#16a34a" },
    rejected: { bg: "rgba(244,63,94,0.16)", color: "#e11d48" },
    issued: { bg: "rgba(37,99,235,0.16)", color: "#2563eb" },
  };

  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
      style={{
        backgroundColor: toneMap[status].bg,
        color: toneMap[status].color,
      }}
    >
      {status}
    </span>
  );
}

function formatDate(value?: string) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function capitalizeValue(value: string) {
  if (value === "all") return "All Statuses";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
