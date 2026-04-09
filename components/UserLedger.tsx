"use client";

import React, { useMemo, useState } from "react";
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
  onStatusChange: (userId: string, status: "approved" | "rejected", internalRemarks?: string) => Promise<void>;
}

export default function UserLedgerView({
  onBack,
  users,
  loading,
  onStatusChange,
}: UserLedgerProps) {
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<"approved" | "rejected" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState("");

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) =>
      [user.name, user.email, user.number, user.pan, user.status, user.ekycId]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query))
    );
  }, [searchQuery, users]);

  const selectedUserFromList = selectedUser
    ? users.find((user) => user._id === selectedUser._id) ?? selectedUser
    : null;

  const handleApprove = async () => {
    if (!selectedUserFromList) return;
    setActionError("");
    setActionLoading("approved");

    try {
      await onStatusChange(selectedUserFromList._id, "approved");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to approve application");
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
      setActionError(error instanceof Error ? error.message : "Failed to reject application");
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
            className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to overview
          </button>
          <h2 className="text-3xl font-black tracking-tight text-white">User Ledger</h2>
          <p className="mt-1 text-sm text-slate-400">
            Review applications, documents, and approval status from live backend data.
          </p>
        </div>

        <label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#171b22] px-4 py-3 text-sm lg:max-w-sm">
          <Search size={16} className="text-slate-500" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, email, PAN, mobile"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Applicants"
          value={users.length}
          accent="teal"
          icon={<FileText size={18} />}
        />
        <StatCard
          label="Pending"
          value={users.filter((user) => user.status === "pending").length}
          accent="amber"
          icon={<Hash size={18} />}
        />
        <StatCard
          label="Approved"
          value={users.filter((user) => user.status === "approved").length}
          accent="green"
          icon={<CheckCircle2 size={18} />}
        />
        <StatCard
          label="Rejected"
          value={users.filter((user) => user.status === "rejected").length}
          accent="red"
          icon={<XCircle size={18} />}
        />
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#11161d] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead className="bg-white/5 text-[11px] uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Applicant</th>
                <th className="px-4 py-4">Contact</th>
                <th className="px-4 py-4">Certificate</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Remarks</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    Loading user records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    No users matched your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1d2430] text-sm font-bold text-[#45c3b9]">
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{user.name || "Unknown user"}</p>
                          <p className="text-xs text-slate-500">{user.pan || "PAN not available"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-200">{user.email}</p>
                      <p className="text-xs text-slate-500">{user.number}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-200">{user.certType || "Not selected"}</p>
                      <p className="text-xs text-slate-500">
                        {user.certificateClass || "Class pending"} • {user.validity || "Validity pending"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="line-clamp-2 max-w-xs text-xs text-slate-400">
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
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
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

      {selectedUserFromList && (
        <div className="fixed inset-0 z-[80] bg-[#0b1015]/85 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#10151d] shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Application review</p>
                <h3 className="mt-1 text-2xl font-black text-white">{selectedUserFromList.name}</h3>
                <div className="mt-3">
                  <StatusBadge status={selectedUserFromList.status} />
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[1.35fr_0.95fr]">
              <div className="space-y-6">
                <SectionCard title="Identity">
                  <DetailItem icon={<Mail size={14} />} label="Email" value={selectedUserFromList.email} />
                  <DetailItem icon={<Phone size={14} />} label="Mobile" value={selectedUserFromList.number} />
                  <DetailItem icon={<Hash size={14} />} label="PAN" value={selectedUserFromList.pan || "Not available"} />
                  <DetailItem icon={<Calendar size={14} />} label="Date of birth" value={selectedUserFromList.dob || "Not available"} />
                </SectionCard>

                <SectionCard title="Address">
                  <DetailItem
                    icon={<MapPin size={14} />}
                    label="Address"
                    value={
                      [selectedUserFromList.address, selectedUserFromList.city, selectedUserFromList.state, selectedUserFromList.pincode]
                        .filter(Boolean)
                        .join(", ") || "Not available"
                    }
                  />
                </SectionCard>

                <SectionCard title="Documents">
                  <DocLink label="Address proof" href={selectedUserFromList.addressProof} />
                  <DocLink label="ID proof" href={selectedUserFromList.idProof} />
                  <DocLink label="Photo" href={selectedUserFromList.photo} />
                </SectionCard>

                {selectedUserFromList.status === "rejected" && (
                  <SectionCard title="Why Rejected">
                    <p className="text-sm leading-6 text-rose-200">
                      {selectedUserFromList.internalRemarks || "No rejection reason saved."}
                    </p>
                  </SectionCard>
                )}
              </div>

              <div className="space-y-6">
                <SectionCard title="Verification">
                  <DetailItem
                    icon={<ShieldCheck size={14} />}
                    label="Email verified"
                    value={selectedUserFromList.isVerified ? "Yes" : "No"}
                  />
                  <DetailItem
                    icon={<UserCheck size={14} />}
                    label="Aadhaar verified"
                    value={selectedUserFromList.isAadhaarVerified ? "Yes" : "No"}
                  />
                  <DetailItem
                    icon={<Hash size={14} />}
                    label="eKYC ID"
                    value={selectedUserFromList.ekycId || "Not available"}
                  />
                </SectionCard>

                <SectionCard title="Certificate">
                  <DetailItem icon={<FileText size={14} />} label="Type" value={selectedUserFromList.certType || "Not selected"} />
                  <DetailItem icon={<FileText size={14} />} label="Class" value={selectedUserFromList.certificateClass || "Not selected"} />
                  <DetailItem icon={<FileText size={14} />} label="Token" value={selectedUserFromList.tokenType || "Not selected"} />
                  <DetailItem icon={<FileText size={14} />} label="Validity" value={selectedUserFromList.validity || "Not selected"} />
                  <DetailItem
                    icon={<FileText size={14} />}
                    label="Price"
                    value={formatCurrency(selectedUserFromList.price || 0)}
                  />
                </SectionCard>

                <SectionCard title="Decision">
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Reject reason
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    rows={4}
                    placeholder="Tell the user what is missing or incorrect"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#171d26] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                  />
                  {actionError ? <p className="mt-3 text-sm text-rose-300">{actionError}</p> : null}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading !== null}
                      className="flex-1 rounded-2xl bg-[#45c3b9] px-4 py-3 text-sm font-black text-[#0d171a] transition hover:bg-[#38aca2] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {actionLoading === "approved" ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={actionLoading !== null}
                      className="flex-1 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm font-black text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {actionLoading === "rejected" ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </SectionCard>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: "teal" | "amber" | "green" | "red";
}) {
  const accentMap = {
    teal: "bg-[#45c3b9]/12 text-[#45c3b9]",
    amber: "bg-amber-400/12 text-amber-300",
    green: "bg-emerald-400/12 text-emerald-300",
    red: "bg-rose-400/12 text-rose-300",
  };

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-[#11161d] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-black text-white">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accentMap[accent]}`}>{icon}</div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-[#131923] p-5">
      <h4 className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-300">{title}</h4>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
      <div className="mt-0.5 text-[#45c3b9]">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-1 text-sm leading-6 text-white break-words">{value}</p>
      </div>
    </div>
  );
}

function DocLink({ label, href }: { label: string; href?: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-1 text-sm text-white">{href ? "Uploaded" : "Not uploaded"}</p>
      </div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
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
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${styles[status]}`}>
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
