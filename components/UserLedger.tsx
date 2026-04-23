"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  Hash,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";

import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export interface DashboardUser {
  _id: string;
  name: string;
  email: string;
  number: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  isVerified: boolean;
  isAadhaarVerified: boolean;
  city?: string;
  state?: string;
  address?: string;
  pincode?: string;
  dob?: string;
  gender?: string;
  pan?: string;
  certType?: string;
  certificateClass?: string;
  validity?: string;
  tokenType?: string;
  price?: number;
  ekycId?: string;
  ekycPin?: string;
  bpCode?: string;
  addressProof?: string;
  idProof?: string;
  photo?: string;
  internalRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserLedgerProps {
  onBack: () => void;
  users: DashboardUser[];
  loading: boolean;
  onStatusChange: (
    userId: string,
    status: "approved" | "rejected",
    internalRemarks?: string,
  ) => Promise<void>;
}

export default function UserLedgerView({
  onBack,
  users,
  loading,
  onStatusChange,
}: UserLedgerProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<
    "approved" | "rejected" | null
  >(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) =>
      [user.name, user.email, user.number, user.pan, user.status, user.ekycId]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query)),
    );
  }, [searchQuery, users]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const selectedUserFromList = selectedUser
    ? (users.find((user) => user._id === selectedUser._id) ?? selectedUser)
    : null;

  const handleApprove = async () => {
    if (!selectedUserFromList) return;
    setActionError("");
    setActionLoading("approved");

    try {
      await onStatusChange(selectedUserFromList._id, "approved");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to approve application",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedUserFromList) return;
    if (!rejectReason.trim()) {
      setActionError("Please enter why this application is being rejected.");
      return;
    }

    setActionError("");
    setActionLoading("rejected");

    try {
      await onStatusChange(selectedUserFromList._id, "rejected", rejectReason);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to reject application",
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 text-xs font-semibold transition"
            style={{ color: colors.muted }}
          >
            <ArrowLeft size={14} />
            Back to overview
          </button>
          <h2
            className="text-3xl font-black tracking-tight"
            style={{ color: colors.text }}
          >
            User Ledger
          </h2>
          <p className="mt-1 text-sm" style={{ color: colors.muted }}>
            Review applications, documents, and approval status from live
            backend data.
          </p>
        </div>

      <label
  className="theme-transition flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm lg:max-w-sm outline-none focus-within:ring-0 focus-within:outline-none"
  style={{
    borderColor: colors.borderSoft,
    backgroundColor: colors.panel,
    // Add this to ensure no browser-specific outline appears on the label
    outline: 'none', 
    boxShadow: 'none'
  }}
>
  <Search size={16} style={{ color: colors.muted }} />
  <input
    value={searchQuery}
    onChange={(event) => setSearchQuery(event.target.value)}
    placeholder="Search by name, email, PAN, mobile"
    className="w-full bg-transparent text-sm outline-none focus:ring-0"
    style={{ 
      color: colors.text,
      border: 'none',
      boxShadow: 'none'
    }}
  />
</label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Applicants"
          value={users.length}
          accent="teal"
          icon={<FileText size={18} />}
          colors={colors}
        />
        <StatCard
          label="Pending"
          value={users.filter((user) => user.status === "pending").length}
          accent="amber"
          icon={<Hash size={18} />}
          colors={colors}
        />
        <StatCard
          label="Approved"
          value={users.filter((user) => user.status === "approved").length}
          accent="green"
          icon={<CheckCircle2 size={18} />}
          colors={colors}
        />
        <StatCard
          label="Rejected"
          value={users.filter((user) => user.status === "rejected").length}
          accent="red"
          icon={<XCircle size={18} />}
          colors={colors}
        />
      </div>

      <div
        className="theme-transition overflow-hidden rounded-lg border shadow-2xl"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: colors.panelStrong,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-230 text-left">
            <thead style={{ backgroundColor: colors.panel }}>
              <tr
                className="text-[11px] uppercase tracking-[0.18em]"
                style={{ color: colors.muted }}
              >
                <th className="px-5 py-4">Applicant</th>
                <th className="px-4 py-4">Contact</th>
                <th className="px-4 py-4">Certificate</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Remarks</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm"
                    style={{ color: colors.muted }}
                  >
                    Loading user records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm"
                    style={{ color: colors.muted }}
                  >
                    No users matched your search.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className="transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      borderTop: `1px solid ${colors.borderSoft}`,
                      backgroundColor:
                        index % 2 === 0
                          ? colors.panel
                          : isDarkMode
                            ? "rgba(255,255,255,0.03)"
                            : "rgba(0,0,0,0.02)",
                    }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
                          style={{
                            backgroundColor: `${colors.accent}15`,
                            color: colors.accent,
                          }}
                        >
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: colors.text }}
                          >
                            {user.name || "Unknown user"}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: colors.subtleText }}
                          >
                            {user.pan || "PAN not available"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm" style={{ color: colors.text }}>
                        {user.email}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: colors.subtleText }}
                      >
                        {user.number}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm" style={{ color: colors.text }}>
                        {user.certType || "Not selected"}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: colors.subtleText }}
                      >
                        {user.certificateClass || "Class pending"} •{" "}
                        {user.validity || "Validity pending"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-4">
                      <p
                        className="line-clamp-2 max-w-xs text-xs"
                        style={{ color: colors.muted }}
                      >
                        {user.internalRemarks || "No remarks"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setRejectReason(user.internalRemarks || "");
                          setActionError("");
                        }}
                        className="theme-transition rounded-lg border px-4 py-2 text-xs font-semibold"
                        style={{
                          borderColor: colors.borderSoft,
                          backgroundColor: colors.panel,
                          color: colors.text,
                        }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: colors.muted }}>
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="theme-transition rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                  color: colors.text,
                }}
              >
                Previous
              </button>
              <span className="text-sm" style={{ color: colors.text }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="theme-transition rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                  color: colors.text,
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {selectedUserFromList ? (
        <div
          className="fixed inset-0 z-80 p-4 backdrop-blur-sm"
          style={{
            backgroundColor: isDarkMode
              ? "rgba(11,16,21,0.85)"
              : "rgba(221,232,245,0.74)",
          }}
        >
          <div
            className="theme-transition mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-lg border shadow-[0_40px_120px_rgba(0,0,0,0.45)]"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.panelStrong,
            }}
          >
            <div
              className="theme-transition flex items-start justify-between border-b px-6 py-5"
              style={{ borderColor: colors.borderSoft }}
            >
              <div>
                <p
                  className="text-xs uppercase tracking-[0.22em]"
                  style={{ color: colors.subtleText }}
                >
                  Application review
                </p>
                <h3
                  className="mt-1 text-2xl font-black"
                  style={{ color: colors.text }}
                >
                  {selectedUserFromList.name}
                </h3>
                <div className="mt-3">
                  <StatusBadge status={selectedUserFromList.status} />
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="theme-transition rounded-lg border px-4 py-2 text-xs font-semibold"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                  color: colors.text,
                }}
              >
                Close
              </button>
            </div>

            <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-2">
              <div className="space-y-6">
                <SectionCard title="Identity" colors={colors}>
                  <DetailItem
                    icon={<Mail size={14} />}
                    label="Email"
                    value={selectedUserFromList.email}
                    colors={colors}
                  />
                  <DetailItem
                    icon={<Phone size={14} />}
                    label="Mobile"
                    value={selectedUserFromList.number}
                    colors={colors}
                  />
                  <DetailItem
                    icon={<Hash size={14} />}
                    label="PAN"
                    value={selectedUserFromList.pan || "Not available"}
                    colors={colors}
                  />
                  <DetailItem
                    icon={<Calendar size={14} />}
                    label="Date of birth"
                    value={selectedUserFromList.dob || "Not available"}
                    colors={colors}
                  />
                </SectionCard>

                <SectionCard title="Address" colors={colors}>
                  <DetailItem
                    icon={<MapPin size={14} />}
                    label="Address"
                    value={
                      [
                        selectedUserFromList.address,
                        selectedUserFromList.city,
                        selectedUserFromList.state,
                        selectedUserFromList.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Not available"
                    }
                    colors={colors}
                  />
                </SectionCard>

                <SectionCard title="Documents" colors={colors}>
                  <DocLink
                    label="Address proof"
                    href={selectedUserFromList.addressProof}
                    colors={colors}
                  />
                  <DocLink
                    label="ID proof"
                    href={selectedUserFromList.idProof}
                    colors={colors}
                  />
                  <DocLink
                    label="Photo"
                    href={selectedUserFromList.photo}
                    colors={colors}
                  />
                </SectionCard>

                {selectedUserFromList.status === "rejected" ? (
                  <SectionCard title="Why Rejected" colors={colors}>
                    <p className="text-sm leading-6 text-rose-300">
                      {selectedUserFromList.internalRemarks ||
                        "No rejection reason saved."}
                    </p>
                  </SectionCard>
                ) : null}
              </div>

              <div className="space-y-6">
                <SectionCard title="Verification" colors={colors}>
                  <DetailItem
                    icon={<ShieldCheck size={14} />}
                    label="Email verified"
                    value={selectedUserFromList.isVerified ? "Yes" : "No"}
                    colors={colors}
                  />
                  <DetailItem
                    icon={<UserCheck size={14} />}
                    label="Aadhaar verified"
                    value={
                      selectedUserFromList.isAadhaarVerified ? "Yes" : "No"
                    }
                    colors={colors}
                  />
                  <DetailItem
                    icon={<Hash size={14} />}
                    label="eKYC ID"
                    value={selectedUserFromList.ekycId || "Not available"}
                    colors={colors}
                  />
                </SectionCard>

                <SectionCard title="Certificate" colors={colors}>
                  <DetailItem
                    icon={<FileText size={14} />}
                    label="Type"
                    value={selectedUserFromList.certType || "Not selected"}
                    colors={colors}
                  />
                  <DetailItem
                    icon={<FileText size={14} />}
                    label="Class"
                    value={
                      selectedUserFromList.certificateClass || "Not selected"
                    }
                    colors={colors}
                  />
                  <DetailItem
                    icon={<FileText size={14} />}
                    label="Token"
                    value={selectedUserFromList.tokenType || "Not selected"}
                    colors={colors}
                  />
                  <DetailItem
                    icon={<FileText size={14} />}
                    label="Validity"
                    value={selectedUserFromList.validity || "Not selected"}
                    colors={colors}
                  />
                  <DetailItem
                    icon={<FileText size={14} />}
                    label="Price"
                    value={formatCurrency(selectedUserFromList.price || 0)}
                    colors={colors}
                  />
                </SectionCard>

                <SectionCard title="Decision" colors={colors}>
                  <label
                    className="block text-xs font-semibold uppercase tracking-[0.16em]"
                    style={{ color: colors.muted }}
                  >
                    Reject reason
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    rows={4}
                    placeholder="Tell the user what is missing or incorrect"
                    className="theme-transition mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none"
                    style={{
                      borderColor: colors.inputBorder,
                      backgroundColor: colors.input,
                      color: colors.text,
                    }}
                  />
                  {actionError ? (
                    <p className="mt-3 text-sm text-rose-300">{actionError}</p>
                  ) : null}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading !== null}
                      className="flex-1 rounded-lg px-4 py-3 text-sm font-black text-[#0d171a] disabled:opacity-70"
                      style={{ backgroundColor: "#45c3b9" }}
                    >
                      {actionLoading === "approved"
                        ? "Approving..."
                        : "Approve"}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading !== null}
                      className="flex-1 rounded-lg border px-4 py-3 text-sm font-black disabled:opacity-70"
                      style={{
                        borderColor: "#f87171",
                        backgroundColor: isDarkMode
                          ? "rgba(248,113,113,0.18)"
                          : "rgba(251,113,133,0.2)",
                        color: isDarkMode ? "#fee2e2" : "#9f1239",
                      }}
                    >
                      {actionLoading === "rejected" ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </SectionCard>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
  colors,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: "teal" | "amber" | "green" | "red";
  colors: ReturnType<typeof getThemePalette>;
}) {
  const accentMap = {
    teal: "bg-[#45c3b9]/12 text-[#45c3b9]",
    amber: "bg-amber-400/12 text-amber-300",
    green: "bg-emerald-400/12 text-emerald-300",
    red: "bg-rose-400/12 text-rose-300",
  };

  return (
    <div
      className="theme-transition rounded-lg border p-5"
      style={{
        borderColor: colors.borderSoft,
        backgroundColor: colors.panelStrong,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: colors.muted }}
          >
            {label}
          </p>
          <p
            className="mt-3 text-3xl font-black"
            style={{ color: colors.text }}
          >
            {value}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${accentMap[accent]}`}>{icon}</div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof getThemePalette>;
}) {
  return (
    <section
      className="theme-transition rounded-lg border p-5"
      style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel }}
    >
      <h4
        className="mb-4 text-xs font-black uppercase tracking-[0.18em]"
        style={{ color: colors.muted }}
      >
        {title}
      </h4>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function DetailItem({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colors: ReturnType<typeof getThemePalette>;
}) {
  return (
    <div
      className="theme-transition flex items-start gap-3 rounded-lg border px-4 py-3"
      style={{
        borderColor: colors.borderSoft,
        backgroundColor: colors.panelStrong,
      }}
    >
      <div className="mt-0.5 text-[#45c3b9]">{icon}</div>
      <div className="min-w-0">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: colors.subtleText }}
        >
          {label}
        </p>
        <p
          className="mt-1 wrap-break-word text-sm leading-6"
          style={{ color: colors.text }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function DocLink({
  label,
  href,
  colors,
}: {
  label: string;
  href?: string;
  colors: ReturnType<typeof getThemePalette>;
}) {
  return (
    <div
      className="theme-transition flex items-center justify-between rounded-lg border px-4 py-3"
      style={{
        borderColor: colors.borderSoft,
        backgroundColor: colors.panelStrong,
      }}
    >
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: colors.subtleText }}
        >
          {label}
        </p>
        <p className="mt-1 text-sm" style={{ color: colors.text }}>
          {href ? "Uploaded" : "Not uploaded"}
        </p>
      </div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="theme-transition rounded-lg border px-3 py-2 text-xs font-semibold"
          style={{
            borderColor: colors.borderSoft,
            backgroundColor: colors.panel,
            color: colors.text,
          }}
        >
          Open
        </a>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: DashboardUser["status"] }) {
  const styles = {
    pending: "border-amber-400/25 bg-amber-400/10 text-amber-300",
    approved: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    rejected: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
