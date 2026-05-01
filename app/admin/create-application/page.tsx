/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowUpDown,
  Eye,
  Loader2,
  Moon,
  Pencil,
  Search,
  SunMedium,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import ApplicationForm, {
  type ApplicationFormData,
} from "@/components/ApplicationForm";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

type User = {
  _id: string;
  name: string;
  email: string;
  number: string;
  status: "approved" | "pending" | "rejected";
  certificateClass?: string;
  certType?: string;
  validity?: string;
  tokenType?: string;
};

type ApplicationFetch = {
  name: string;
  email: string;
  mobile: string;
  classType: string;
  certType: string;
  validity: string;
  tokenType: string;
};

type ApplicantDraft = {
  name: string;
  email: string;
  number: string;
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

const EMPTY_APPLICANT: ApplicantDraft = {
  name: "",
  email: "",
  number: "",
};

export default function AdminCreateApplicationPage() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [formInitialValues, setFormInitialValues] =
    useState<ApplicationFormData>(BASE_INITIAL_VALUES);
  const [savingApplication, setSavingApplication] = useState(false);

  const [isApplicantModalOpen, setApplicantModalOpen] = useState(false);
  const [applicantDraft, setApplicantDraft] =
    useState<ApplicantDraft>(EMPTY_APPLICANT);
  const [creatingApplicant, setCreatingApplicant] = useState(false);
  const [createApplicantError, setCreateApplicantError] = useState("");
  const [isFormModalOpen, setFormModalOpen] = useState(false);

  const selectedUser = useMemo(
    () => users.find((user) => user._id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const filteredUsers = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    const matchedUsers = users.filter((user) => {
      if (!term) return true;

      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.number?.includes(term) ||
        user.certType?.toLowerCase().includes(term)
      );
    });

    return matchedUsers.sort((left, right) => {
      const leftName = left.name?.toLowerCase() ?? "";
      const rightName = right.name?.toLowerCase() ?? "";

      return sortOrder === "asc"
        ? leftName.localeCompare(rightName)
        : rightName.localeCompare(leftName);
    });
  }, [searchQuery, sortOrder, users]);

  const refreshUserInitialValues = async (userId: string) => {
    setFormInitialValues(BASE_INITIAL_VALUES);

    try {
      const response = await fetch(`/api/create-application?userId=${userId}`, {
        cache: "no-store",
      });
      const data = (await response.json().catch(() => null)) as
        | { success?: boolean; application?: ApplicationFetch }
        | null;

      if (!response.ok || !data?.success || !data.application) {
        return;
      }

      const application = data.application;
      setFormInitialValues({
        ...BASE_INITIAL_VALUES,
        name: application.name || "",
        email: application.email || "",
        mobile: application.mobile || "",
        classType: application.classType || "Class III",
        certType: application.certType || "",
        validity: application.validity || "",
        tokenType: application.tokenType || "Not Required",
      });
    } catch (error) {
      console.error("Failed to fetch applicant initial values:", error);
    }
  };

  const refreshUsers = async (preferredUserId?: string) => {
    setLoading(true);

    try {
      const response = await fetch("/api/get-users", { cache: "no-store" });
      const data = (await response.json().catch(() => null)) as
        | { success?: boolean; users?: User[] }
        | null;

      const nextUsers = data?.users ?? [];
      setUsers(nextUsers);

      setSelectedUserId((current) => {
        if (preferredUserId && nextUsers.some((user) => user._id === preferredUserId)) {
          return preferredUserId;
        }

        if (current && nextUsers.some((user) => user._id === current)) {
          return current;
        }

        return nextUsers[0]?._id ?? null;
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Unable to load applicants right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setFormInitialValues(BASE_INITIAL_VALUES);
      return;
    }

    void refreshUserInitialValues(selectedUserId);
  }, [selectedUserId]);

  const handleUserSelection = (userId: string, nextViewOnly = false) => {
    setSelectedUserId(userId);
    setViewOnly(nextViewOnly);
    setFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setViewOnly(false);
  };

  const handleCreateApplicant = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreateApplicantError("");
    setCreatingApplicant(true);

    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicantDraft),
      });

      const data = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: string; user?: User }
        | null;

      if (!response.ok || !data?.success || !data.user?._id) {
        throw new Error(data?.message || "Unable to create applicant");
      }

      setApplicantModalOpen(false);
      setApplicantDraft(EMPTY_APPLICANT);
      setViewOnly(false);
      await refreshUsers(data.user._id);
      toast.success("Applicant created. You can complete the application now.");
    } catch (error) {
      setCreateApplicantError(
        error instanceof Error ? error.message : "Unable to create applicant",
      );
    } finally {
      setCreatingApplicant(false);
    }
  };

  const handleApplicationSubmit = async (
    payload: ApplicationFormData & { totalAmount: number },
  ) => {
    if (!selectedUser) {
      throw new Error("Select an applicant before saving the application.");
    }

    if (viewOnly) {
      setViewOnly(false);
      return;
    }

    setSavingApplication(true);

    try {
      const response = await fetch("/api/create-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          isAdmin: true,
          clientId: selectedUser._id,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { success?: boolean; message?: string }
        | null;

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to save application");
      }

      await refreshUsers(selectedUser._id);
      await refreshUserInitialValues(selectedUser._id);
      setFormModalOpen(false);
      toast.success("Application saved successfully.");
    } finally {
      setSavingApplication(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        color: colors.text,
        background: isDarkMode
          ? "radial-gradient(circle at top, rgba(69,195,185,0.12), transparent 36%), linear-gradient(180deg, #08111f 0%, #0f172a 55%, #08111f 100%)"
          : "radial-gradient(circle at top, rgba(69,195,185,0.12), transparent 32%), linear-gradient(180deg, #f8fbff 0%, #eef5ff 45%, #f8fbff 100%)",
      }}
    >
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-2xl"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: isDarkMode ? "rgba(8,17,31,0.82)" : "rgba(248,251,255,0.85)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition hover:-translate-y-0.5"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: colors.panel,
              }}
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <p
                className="text-[10px] font-black uppercase tracking-[0.28em]"
                style={{ color: colors.accent }}
              >
          Admin Application Panel
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Application Management
              </h1>
              <p className="mt-1 text-sm" style={{ color: colors.muted }}>
  Manage applicants, create new applications, and edit records in one unified workspace.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setApplicantModalOpen(true);
                setCreateApplicantError("");
              }}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                boxShadow: `0 20px 32px -24px ${colors.accentShadow}`,
              }}
            >
              <UserPlus size={16} />
              New Applicant
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: colors.panel,
              }}
            >
              {isDarkMode ? <SunMedium size={16} /> : <Moon size={16} />}
              {isDarkMode ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section
          className="rounded-[2rem] border p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.45)]"
          style={{
            borderColor: colors.borderSoft,
            backgroundColor: colors.panelStrong,
          }}
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: colors.accent }}>
                  Applicant Directory
                </p>
                <h3 className="mt-2 text-xl font-black">Choose applicant</h3>
              </div>

              <button
                type="button"
                onClick={() => setSortOrder((current) => (current === "asc" ? "desc" : "asc"))}
                className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                }}
              >
                <ArrowUpDown size={14} />
                {sortOrder === "asc" ? "A to Z" : "Z to A"}
              </button>
            </div>

            <div className="relative mt-5">
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
                className="w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none"
                style={{
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.input,
                  color: colors.text,
                }}
              />
            </div>

            <div className="mt-5">
              {loading ? (
                <div className="flex min-h-56 items-center justify-center">
                  <Loader2 size={34} className="animate-spin" style={{ color: colors.accent }} />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div
                  className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed px-6 text-center"
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
                  className="overflow-hidden rounded-[1.5rem] border"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.panel,
                  }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[880px] border-collapse text-left">
                      <thead>
                        <tr
                          className="text-[11px] font-black uppercase tracking-[0.18em]"
                          style={{
                            backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "#eef4ff",
                            color: colors.muted,
                          }}
                        >
                          <th className="px-4 py-4">Applicant</th>
                          <th className="px-4 py-4">Contact</th>
                          <th className="px-4 py-4">Service</th>
                          <th className="px-4 py-4">Status</th>
                          <th className="px-4 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user, index) => {
                          const isActive = user._id === selectedUserId;

                          return (
                            <tr
                              key={user._id}
                              className="transition"
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
                                  onClick={() => handleUserSelection(user._id)}
                                  className="text-left"
                                >
                                  <p className="text-sm font-black">{user.name}</p>
                                  <p className="mt-1 text-xs" style={{ color: colors.subtleText }}>
                                    {user.certificateClass || "Class III"}
                                  </p>
                                </button>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <p className="text-sm font-semibold">{user.email}</p>
                                <p className="mt-1 text-xs" style={{ color: colors.subtleText }}>
                                  {user.number}
                                </p>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <p className="text-sm font-semibold">
                                  {user.certType || "No service selected"}
                                </p>
                                <p className="mt-1 text-xs" style={{ color: colors.subtleText }}>
                                  {user.validity || "No validity"}
                                </p>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <span
                                  className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                                  style={{
                                    backgroundColor: getStatusBackground(user.status),
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
                                    onClick={() => handleUserSelection(user._id, true)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border"
                                    style={{
                                      borderColor: colors.borderSoft,
                                      backgroundColor: colors.panelStrong,
                                    }}
                                    aria-label={`View ${user.name}`}
                                  >
                                    <Eye size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUserSelection(user._id, false)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border"
                                    style={{
                                      borderColor: colors.borderSoft,
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

      {isFormModalOpen && selectedUser ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
          <div
            className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border shadow-[0_28px_80px_-40px_rgba(15,23,42,0.6)]"
            style={{
              borderColor: colors.borderSoft,
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
                  {viewOnly ? "Application View" : "Application Edit"}
                </p>
                <h3 className="mt-2 text-xl font-black">{selectedUser.name}</h3>
                <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                  {selectedUser.email} • {selectedUser.number}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseFormModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                }}
                aria-label="Close application form"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto py-4">
              <ApplicationForm
                key={`${selectedUser._id}-${viewOnly ? "view" : "edit"}`}
                mode="admin"
                readOnly={viewOnly || savingApplication}
                initialValues={formInitialValues}
                onSubmit={handleApplicationSubmit}
                submitLabel={
                  viewOnly
                    ? "Switch To Edit"
                    : savingApplication
                      ? "Saving..."
                      : "Save Application"
                }
              />
            </div>
          </div>
        </div>
      ) : null}

      {isApplicantModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
          <div
            className="w-full max-w-lg rounded-[2rem] border p-6 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.6)]"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.panelStrong,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: colors.accent }}>
                  New Applicant
                </p>
                <h3 className="mt-2 text-2xl font-black">Create applicant record</h3>
                <p className="mt-2 text-sm" style={{ color: colors.muted }}>
                  Add the applicant first, then complete the application on the same screen.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setApplicantModalOpen(false);
                  setCreateApplicantError("");
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                }}
                aria-label="Close new applicant form"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="mt-6 space-y-4">
              <ModalField label="Full name" colors={colors}>
                <input
                  type="text"
                  value={applicantDraft.name}
                  onChange={(event) =>
                    setApplicantDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Enter applicant name"
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                  style={{
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.input,
                    color: colors.text,
                  }}
                />
              </ModalField>

              <ModalField label="Email address" colors={colors}>
                <input
                  type="email"
                  value={applicantDraft.email}
                  onChange={(event) =>
                    setApplicantDraft((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="Enter email address"
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                  style={{
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.input,
                    color: colors.text,
                  }}
                />
              </ModalField>

              <ModalField label="Mobile number" colors={colors}>
                <input
                  type="tel"
                  value={applicantDraft.number}
                  onChange={(event) =>
                    setApplicantDraft((current) => ({ ...current, number: event.target.value }))
                  }
                  placeholder="Enter mobile number"
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                  style={{
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.input,
                    color: colors.text,
                  }}
                />
              </ModalField>

              {createApplicantError ? (
                <p className="text-sm font-semibold text-rose-500">{createApplicantError}</p>
              ) : null}

              <button
                type="submit"
                disabled={creatingApplicant}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                }}
              >
                {creatingApplicant ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating applicant...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Create Applicant
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ModalField({
  label,
  colors,
  children,
}: {
  label: string;
  colors: ReturnType<typeof getThemePalette>;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: colors.muted }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function getStatusBackground(status: User["status"]) {
  if (status === "approved") return "rgba(34,197,94,0.16)";
  if (status === "rejected") return "rgba(244,63,94,0.16)";
  return "rgba(245,158,11,0.18)";
}

function getStatusText(status: User["status"]) {
  if (status === "approved") return "#16a34a";
  if (status === "rejected") return "#e11d48";
  return "#d97706";
}
