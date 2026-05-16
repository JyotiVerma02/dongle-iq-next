"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";
import type { DashboardUser } from "@/components/UserLedger";
import AdminApplicationPreview from "@/components/admin/AdminApplicationPreview";
import AdminApplicationEditor from "@/components/admin/AdminApplicationEditor";
import AdminApplicationsHeader from "@/components/admin/AdminApplicationsHeader";
import AdminApplicationsStats from "@/components/admin/AdminApplicationsStats";
import AdminApplicationsFilters from "@/components/admin/AdminApplicationsFilters";
import AdminApplicationsTable from "@/components/admin/AdminApplicationsTable";
import AdminApplicationsDeleteModal from "@/components/admin/AdminApplicationsDeleteModal";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type ApplicationStatus = "all" | "pending" | "approved" | "rejected" | "issued";
type SortKey = "createdAt" | "name" | "email" | "certType" | "status" | "validity";

const PAGE_SIZE = 10;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminApplicationsPanel({
  users,
  loading,
  onUsersChange,
}: AdminApplicationsPanelProps) {
  const { isDarkMode } = useTheme();

  // Stable object reference — only recreated when theme actually changes.
  // Without useMemo here, every parent render creates a new `colors` object,
  // which breaks memo() on all child components even when nothing visual changed.
  const colors = useMemo(() => getThemePalette(isDarkMode), [isDarkMode]);

  // ─── Filter / search state ────────────────────────────────────────────────

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus>("all");
  const [validityFilter, setValidityFilter] = useState("all");
  const [certTypeFilter, setCertTypeFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });
  const [page, setPage] = useState(1);

  // ─── Table data state ─────────────────────────────────────────────────────

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
    pending: users.filter((u) => u.status === "pending").length,
    approved: users.filter((u) => u.status === "approved").length,
    rejected: users.filter((u) => u.status === "rejected").length,
    issued: users.filter((u) => u.status === "issued").length,
  });

  // ─── Modal / selection state ──────────────────────────────────────────────

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "create">("edit");
  const [savingApplication, setSavingApplication] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] =
    useState<DashboardUser | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DashboardUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const selectedUser = useMemo(
    () => tableUsers.find((u) => u._id === selectedUserId) ?? null,
    [selectedUserId, tableUsers],
  );

  // ─── Search debounce ──────────────────────────────────────────────────────

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // ─── fetchApplicants ──────────────────────────────────────────────────────
  //
  // KEY FIX: `pagination` is intentionally NOT in the dependency array.
  //
  // Including it would create an infinite loop:
  //   fetch → setPagination → new `pagination` ref → fetchApplicants recreates
  //   → effect fires again → fetch → setPagination → … forever.
  //
  // The query params we send (page, sortConfig, filters) fully determine what
  // the API returns. `pagination` is only *output* state from the response;
  // it should never be an input that drives a re-fetch.
  //
  // We use a ref to read the current pagination inside refreshUsers without
  // adding it as a dep.

  const paginationRef = useRef(pagination);
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const fetchApplicants = useCallback(async () => {
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
      const data = (await response.json().catch(() => null)) as ApplicantsResponse | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to load applicants");
      }

      setTableUsers(data.users ?? []);
      // Use functional update to avoid reading `pagination` as a dep
      setPagination((prev) => data.pagination ?? prev);
      setFilterOptions(data.filters ?? { certTypes: [], validities: [] });
      setStats(
        data.stats ?? { total: 0, pending: 0, approved: 0, rejected: 0, issued: 0 },
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load applicants",
      );
    } finally {
      setTableLoading(false);
    }
  }, [searchQuery, statusFilter, validityFilter, certTypeFilter, page, sortConfig]);
  // ↑ `pagination` is intentionally absent — see comment above.

  // Single effect — was duplicated in your previous version, causing double fetches.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchApplicants();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchApplicants]);

  // ─── Refresh helpers ──────────────────────────────────────────────────────

  const refreshUsers = useCallback(
    async (preferredUserId?: string) => {
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
        if (preferredUserId) setSelectedUserId(preferredUserId);
        await fetchApplicants();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load applicants",
        );
      }
    },
    [fetchApplicants, onUsersChange],
  );

  const refreshUserInitialValues = useCallback(async (userId: string) => {
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
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    const timer = window.setTimeout(() => {
      void refreshUserInitialValues(selectedUserId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedUserId, refreshUserInitialValues]);

  // ─── Stable table callbacks ───────────────────────────────────────────────
  //
  // All four callbacks passed to AdminApplicationsTable are wrapped in
  // useCallback so their references stay stable between renders. Without this,
  // memo() on the table is useless — new function refs = new props = re-render.

  const handleSort = useCallback((key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleUserSelection = useCallback(
    (userId: string, nextMode: "view" | "edit") => {
      setSelectedUserId(userId);
      setMode(nextMode);
      setFormModalOpen(true);
    },
    [],
  );

  const handleDeleteClick = useCallback((user: DashboardUser) => {
    setDeleteTarget(user);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  // ─── Other handlers ───────────────────────────────────────────────────────

  const handleCloseFormModal = useCallback(() => {
    setFormModalOpen(false);
    setMode("edit");
    setSelectedUserId(null);
    setSelectedUserDetails(null);
  }, []);

  const handleCreateApplicant = useCallback(() => {
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
    } as DashboardUser);
    setMode("create");
    setFormModalOpen(true);
  }, []);

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value as ApplicationStatus);
    setPage(1);
  }, []);

  const handleValidityFilterChange = useCallback((value: string) => {
    setValidityFilter(value);
    setPage(1);
  }, []);

  const handleCertTypeFilterChange = useCallback((value: string) => {
    setCertTypeFilter(value);
    setPage(1);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

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
      if (savedUserId) await refreshUserInitialValues(savedUserId);

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

  const exportApplicants = useCallback(
    (format: "csv" | "excel") => {
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
    },
    [users],
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="admin-compact-shell relative min-h-0 overflow-y-auto overflow-x-hidden">
        <AdminApplicationsHeader colors={colors} onCreate={handleCreateApplicant} />
        <AdminApplicationsStats stats={stats} colors={colors} />

        <section
          className="admin-compact-panel rounded-lg p-3 sm:p-4"
          style={{ borderColor: colors.borderSoft }}
        >
          <AdminApplicationsFilters
            searchInput={searchInput}
            statusFilter={statusFilter}
            validityFilter={validityFilter}
            certTypeFilter={certTypeFilter}
            filterOptions={filterOptions}
            onSearchChange={handleSearchInputChange}
            onStatusFilterChange={handleStatusFilterChange}
            onValidityFilterChange={handleValidityFilterChange}
            onCertTypeFilterChange={handleCertTypeFilterChange}
            onExport={exportApplicants}
            colors={colors}
            isDarkMode={isDarkMode}
          />

          <AdminApplicationsTable
            tableUsers={tableUsers}
            selectedUserId={selectedUserId}
            sortConfig={sortConfig}
            pagination={pagination}
            colors={colors}
            isDarkMode={isDarkMode}
            loading={loading}
            tableLoading={tableLoading}
            onSort={handleSort}
            onUserSelection={handleUserSelection}
            onDeleteClick={handleDeleteClick}
            onPageChange={handlePageChange}
          />
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
        <AdminApplicationsDeleteModal
          deleteTarget={deleteTarget}
          deletingUserId={deletingUserId}
          colors={colors}
          onConfirm={handleDeleteApplicant}
          onCancel={handleCancelDelete}
        />
      ) : null}
    </>
  );
}
