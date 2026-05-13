/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowUpDown, Eye, Loader2, Pencil, Search, UserPlus, Users, X } from "lucide-react";

import { type ApplicationFormData } from "@/components/ApplicationForm";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";
import type { DashboardUser } from "@/components/UserLedger";
import { ArrowUp, ArrowDown } from "lucide-react";
import AdminApplicationPreview from "@/components/admin/AdminApplicationPreview";
import AdminApplicationEditor from "@/components/admin/AdminApplicationEditor";

type ApplicationFetch = {
  _id: string;
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
  status: "approved" | "pending" | "rejected";
  price?: number;
  createdAt: string;
  updatedAt: string;
};

const BASE_INITIAL_VALUES: ApplicationFormData = {
  name: "",
  email: "",
  mobile: "",
  userType: "Individual",
  classType: "Class III",
  certType: "",
  validity: "",
  tokenType: "Not Required",
  assistedService: "Not Required",
  ekycType: "PAN",
};

type AdminApplicationsPanelProps = {
  users: DashboardUser[];
  loading: boolean;
  onBack: () => void;
  onUsersChange: (users: DashboardUser[]) => void;
};

export default function AdminApplicationsPanel({
  users,
  loading,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBack,
  onUsersChange,
}: AdminApplicationsPanelProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: "name" | "email" | "certType" | "status";
    direction: "asc" | "desc";
  }>({
    key: "name",
    direction: "asc",
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "create">("edit");
  const [, setFormInitialValues] =
    useState<ApplicationFormData>(BASE_INITIAL_VALUES);
  const [savingApplication, setSavingApplication] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] =
    useState<DashboardUser | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);

  const selectedUser = useMemo(
    () => users.find((user) => user._id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const filteredUsers = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    const filtered = users.filter((user) => {
      if (!term) return true;

      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.number?.includes(term) ||
        user.certType?.toLowerCase().includes(term)
      );
    });

    const { key, direction } = sortConfig;

    return [...filtered].sort((a, b) => {
      const aValue = (a[key] ?? "").toString().toLowerCase();
      const bValue = (b[key] ?? "").toString().toLowerCase();

      if (direction === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [users, searchQuery, sortConfig]);
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

      const nextUsers = data.users ?? [];
      onUsersChange(nextUsers);

      if (preferredUserId) {
        setSelectedUserId(preferredUserId);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load applicants",
      );
    }
  };

  const handleSort = (key: "name" | "email" | "certType" | "status") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };
  const refreshUserInitialValues = async (userId: string) => {
    setFormInitialValues(BASE_INITIAL_VALUES);
    setSelectedUserDetails(null);

    try {
      const response = await fetch(
        `/api/admin/application-details?userId=${userId}`,
        {
          cache: "no-store",
        },
      );
      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        user?: ApplicationFetch;
      } | null;

      if (!response.ok || !data?.success || !data.user) {
        return;
      }

      const application = data.user;
      setSelectedUserDetails(application as DashboardUser);
      setFormInitialValues({
        ...BASE_INITIAL_VALUES,
        name: application.name || "",
        email: application.email || "",
        mobile: application.number || "",
        classType: application.certificateClass || "Class III",
        certType: application.certType || "",
        validity: application.validity || "",
        tokenType: application.tokenType || "Not Required",
      });
    } catch (error) {
      console.error("Failed to fetch applicant initial values:", error);
    }
  };

  useEffect(() => {
    if (!selectedUserId) {
      setFormInitialValues(BASE_INITIAL_VALUES);
      return;
    }

    void refreshUserInitialValues(selectedUserId);
  }, [selectedUserId]);

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
    if (mode === "view") {
      return;
    }

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
          : "Application saved successfully.",
      );
      setMode("edit");
    } finally {
      setSavingApplication(false);
    }
  };

  return (
    <>
      <div className="relative h-full overflow-y-auto min-h-0">
        <div className="mb-4 flex flex-col gap-3">
          <div>
            <h1
              className="text-xl font-black lg:text-2xl"
              style={{ color: colors.text }}
            >
              Applications
            </h1>

            <p className="mt-1 text-[13px]" style={{ color: colors.muted }}>
              Manage applicants, create new applications, and edit records in
              the same dashboard flow.
            </p>
          </div>
        </div>

        <section
          className="rounded-xl border p-4 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.35)]"
          style={{
            borderColor: isDarkMode
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.06)",
            backgroundColor: colors.panelStrong,
          }}
        >
          {/* <div>
              <p
                className="text-[10px] uppercase tracking-[0.2em]"
                style={{ color: colors.subtleText }}
              >
                Applicant Directory
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight">
                Application records
              </h2>
            </div> */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* 🔍 Search (Left) */}
            <div className="relative w-full max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={16}
                style={{ color: colors.muted }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by applicant, email, mobile or service"
                className="w-full rounded-xl border px-3 py-2 pl-10 text-[13px] outline-none"
                style={{
                  borderColor: isDarkMode
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.06)",
                  backgroundColor: colors.panel,
                  color: colors.text,
                }}
              />
            </div>

            {/* ➕ Button (Right) */}
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
              className="theme-transition inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:-translate-y-0.5 sm:w-auto"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent), var(--accent-light))",
              }}
            >
              <UserPlus size={14} />
              New Applicant
            </button>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="flex min-h-56 items-center justify-center">
                <Loader2
                  size={34}
                  className="animate-spin"
                  style={{ color: colors.accent }}
                />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div
                className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                }}
              >
                <Users size={26} style={{ color: colors.accent }} />
                <p className="mt-4 text-base font-bold">No applicant found</p>
                <p className="mt-2 text-sm" style={{ color: colors.muted }}>
                  Create a new applicant to begin the application flow.
                </p>
              </div>
            ) : (
              <div
                className="overflow-hidden rounded-xl border"
                style={{
                  borderColor: isDarkMode
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.06)",
                  backgroundColor: colors.panel,
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[880px] border-collapse text-left">
                    <thead>
                      <tr
                        className="text-[11px] font-black uppercase tracking-[0.18em]"
                        style={{
                          backgroundColor: isDarkMode
                            ? "rgba(255,255,255,0.04)"
                            : "#eef4ff",
                          color: colors.muted,
                        }}
                      >
                        <th
                          className="px-4 py-4 cursor-pointer"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center gap-1">
                            Applicant
                            {sortConfig.key === "name" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUp size={12} />
                              ) : (
                                <ArrowDown size={12} />
                              )
                            ) : (
                              <ArrowUpDown size={12} className="opacity-40" />
                            )}
                          </div>
                        </th>
                        <th
                          className="px-4 py-4 cursor-pointer"
                          onClick={() => handleSort("email")}
                        >
                          <div className="flex items-center gap-1">
                            Contact
                            {sortConfig.key === "email" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUp size={12} />
                              ) : (
                                <ArrowDown size={12} />
                              )
                            ) : (
                              <ArrowUpDown size={12} className="opacity-40" />
                            )}
                          </div>
                        </th>
                        <th
                          className="px-4 py-4 cursor-pointer"
                          onClick={() => handleSort("certType")}
                        >
                          <div className="flex items-center gap-1">
                            Service
                            {sortConfig.key === "certType" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUp size={12} />
                              ) : (
                                <ArrowDown size={12} />
                              )
                            ) : (
                              <ArrowUpDown size={12} className="opacity-40" />
                            )}
                          </div>
                        </th>

                        <th
                          className="px-4 py-4 cursor-pointer"
                          onClick={() => handleSort("status")}
                        >
                          <div className="flex items-center gap-1">
                            Status
                            {sortConfig.key === "status" ? (
                              sortConfig.direction === "asc" ? (
                                <ArrowUp size={12} />
                              ) : (
                                <ArrowDown size={12} />
                              )
                            ) : (
                              <ArrowUpDown size={12} className="opacity-40" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => {
                        const isActive = user._id === selectedUserId;

                        return (
                          <tr
                            key={user._id}
                            className=" transition-transform duration-200 hover:scale-[1.01] hover:z-10"
                            style={{
                              backgroundColor: isActive
                                ? `${colors.accent}12`
                                : index % 2 === 0
                                  ? colors.panel
                                  : isDarkMode
                                    ? "rgba(255,255,255,0.02)"
                                    : "#f8fbff",
                            }}
                          >
                            <td className="px-4 py-4 align-top">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUserSelection(user._id, "edit")
                                }
                                className="text-left"
                              >
                                <p className="text-sm font-black">
                                  {user.name}
                                </p>
                                <p
                                  className="mt-1 text-xs"
                                  style={{ color: colors.subtleText }}
                                >
                                  {user.certificateClass || "Class III"}
                                </p>
                              </button>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <p className="text-sm font-semibold">
                                {user.email}
                              </p>
                              <p
                                className="mt-1 text-xs"
                                style={{ color: colors.subtleText }}
                              >
                                {user.number}
                              </p>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <p className="text-sm font-semibold">
                                {user.certType || "No service selected"}
                              </p>
                              <p
                                className="mt-1 text-xs"
                                style={{ color: colors.subtleText }}
                              >
                                {user.validity || "No validity"}
                              </p>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <span
                                className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                                style={{
                                  backgroundColor: getStatusBackground(
                                    user.status,
                                  ),
                                  color: getStatusText(user.status),
                                }}
                              >
                                {user.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUserSelection(user._id, "view")
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border"
                                  style={{
                                    borderColor: isDarkMode
                                      ? "rgba(255,255,255,0.06)"
                                      : "rgba(0,0,0,0.06)",
                                    backgroundColor: colors.panelStrong,
                                  }}
                                  aria-label={`View ${user.name}`}
                                >
                                  <Eye size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUserSelection(user._id, "edit")
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border"
                                  style={{
                                    borderColor: isDarkMode
                                      ? "rgba(255,255,255,0.06)"
                                      : "rgba(0,0,0,0.06)",
                                    backgroundColor: colors.panelStrong,
                                  }}
                                  aria-label={`Edit ${user.name}`}
                                >
                                  <Pencil size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {isFormModalOpen && (selectedUser || mode === "create") ? (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md">
          <div
            className="flex h-screen w-screen max-w-none flex-col overflow-hidden rounded-none border-0 shadow-none"
            style={{
              backgroundColor: colors.panelStrong,
            }}
          >
            <div
              className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6"
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
                  {mode === "create" ? "Create DSC Application" : selectedUser.name}
                </h3>
                <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                  {mode === "create"
                    ? "Fill all required fields once to create the applicant and DSC record together."
                    : `${selectedUser.email} | ${selectedUser.number}`}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseFormModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border"
                style={{
                  borderColor: isDarkMode
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.06)",
                  backgroundColor: colors.panel,
                }}
                aria-label="Close application form"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto py-4">
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
    </>
  );
}

function getStatusBackground(status: DashboardUser["status"]) {
  if (status === "approved") return "rgba(34,197,94,0.16)";
  if (status === "rejected") return "rgba(244,63,94,0.16)";
  return "rgba(245,158,11,0.18)";
}

function getStatusText(status: DashboardUser["status"]) {
  if (status === "approved") return "#16a34a";
  if (status === "rejected") return "#e11d48";
  return "#d97706";
}
