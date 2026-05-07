"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, ExternalLink, FileText, Search } from "lucide-react";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export interface DongleRecord {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  pan: string;
  ekycId: string;
  bpCode: string;
  certType: string;
  certificateClass: string;
  tokenType: string;
  validity: string;
  status: "pending" | "approved" | "rejected";
  internalRemarks: string;
  addressProof: string;
  idProof: string;
  photo: string;
  createdAt: string;
  updatedAt: string;
  documentCount: number;
  documentsReady: boolean;
}

export default function UserDongleView({
  onBack,
  records,
  loading,
}: {
  onBack: () => void;
  records: DongleRecord[];
  loading: boolean;
}) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return records;

    return records.filter((record) =>
      [
        record.name,
        record.email,
        record.mobile,
        record.pan,
        record.ekycId,
        record.bpCode,
        record.certType,
        record.status,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query))
    );
  }, [records, searchQuery]);

  // Reset to first page when search changes
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRecords.slice(startIndex, endIndex);
  }, [filteredRecords, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-xs font-semibold transition" style={{ color: colors.muted }}>
            <ArrowLeft size={14} />
            Back to overview
          </button>
          <h2 className="text-3xl font-black tracking-tight" style={{ color: colors.text }}>Dongle Records</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6" style={{ color: colors.muted }}>
            Production view for DSC processing with eKYC, BP code, certificate setup, document readiness,
            current status, and direct file access from backend records.
          </p>
        </div>

        <label
          className="theme-transition flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm lg:max-w-md"
          style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel }}
        >
          <Search size={16} style={{ color: colors.muted }} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search name, mobile, PAN, eKYC ID, BP code"
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: colors.text }}
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total records" value={records.length} colors={colors} />
        <SummaryCard label="Docs complete" value={records.filter((record) => record.documentsReady).length} colors={colors} />
        <SummaryCard label="USB token" value={records.filter((record) => record.tokenType === "USB Token").length} colors={colors} />
        <SummaryCard label="Approved" value={records.filter((record) => record.status === "approved").length} colors={colors} />
      </div>

      <div className="theme-transition overflow-hidden rounded-lg border shadow-2xl" style={{ borderColor: colors.borderSoft, backgroundColor: colors.panelStrong }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1380px] text-left">
            <thead style={{ backgroundColor: colors.panel }}>
              <tr className="text-[11px] uppercase tracking-[0.16em]" style={{ color: colors.muted }}>
                <th className="px-5 py-4">Applicant</th>
                <th className="px-4 py-4">Agent / KYC</th>
                <th className="px-4 py-4">Certificate</th>
                <th className="px-4 py-4">Token</th>
                <th className="px-4 py-4">Documents</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Last Update</th>
                <th className="px-5 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: colors.muted }}>
                    Loading dongle records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: colors.muted }}>
                    No dongle records matched your search.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr key={record._id} style={{ borderTop: `1px solid ${colors.borderSoft}` }}>
                    <td className="px-5 py-4 align-top">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: colors.text }}>{record.name || "Unknown user"}</p>
                        <p className="mt-1 break-all text-xs" style={{ color: colors.muted }}>{record.email || "Email not available"}</p>
                        <p className="mt-1 text-xs" style={{ color: colors.subtleText }}>{record.mobile || "Mobile not available"}</p>
                        <p className="mt-1 text-xs" style={{ color: colors.subtleText }}>{record.pan || "PAN not available"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <DataText label="BP code" value={record.bpCode || "Not entered"} colors={colors} />
                      <DataText label="eKYC ID" value={record.ekycId || "Not entered"} colors={colors} />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <DataText label="Type" value={record.certType || "Not selected"} colors={colors} />
                      <DataText label="Class" value={record.certificateClass || "Not selected"} colors={colors} />
                      <DataText label="Validity" value={record.validity || "Not selected"} colors={colors} />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm" style={{ color: colors.text }}>{record.tokenType || "Not selected"}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-2">
                        <DocsBadge ready={record.documentsReady} count={record.documentCount} />
                        <DocLinks record={record} colors={colors} />
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm" style={{ color: colors.text }}>{formatDate(record.updatedAt)}</p>
                      <p className="mt-1 text-xs" style={{ color: colors.subtleText }}>Created {formatDate(record.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="max-w-xs text-xs leading-6" style={{ color: colors.muted }}>
                        {record.internalRemarks || "No remarks"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm" style={{ color: colors.muted }}>
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredRecords.length)} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
          </p>
          <div className="flex flex-wrap items-center gap-2">
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
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, colors }: { label: string; value: number; colors: ReturnType<typeof getThemePalette> }) {
  return (
    <div className="theme-transition rounded-lg border p-5" style={{ borderColor: colors.borderSoft, backgroundColor: colors.panelStrong }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: colors.muted }}>{label}</p>
      <p className="mt-3 text-3xl font-black" style={{ color: colors.text }}>{value}</p>
    </div>
  );
}

function DataText({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof getThemePalette> }) {
  return (
    <div className="mb-2 last:mb-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: colors.subtleText }}>{label}</p>
      <p className="mt-1 text-sm" style={{ color: colors.text }}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: DongleRecord["status"] }) {
  const styles = {
    pending: "border-amber-400/25 bg-amber-400/10 text-amber-300",
    approved: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    rejected: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  };

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${styles[status]}`}>{status}</span>;
}

function DocsBadge({ ready, count }: { ready: boolean; count: number }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
        ready ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-amber-400/25 bg-amber-400/10 text-amber-300"
      }`}
    >
      {ready ? `Complete (${count}/3)` : `Pending (${count}/3)`}
    </span>
  );
}

function DocLinks({ record, colors }: { record: DongleRecord; colors: ReturnType<typeof getThemePalette> }) {
  return (
    <div className="space-y-1">
      <DocumentLink label="Address" href={record.addressProof} colors={colors} />
      <DocumentLink label="ID Proof" href={record.idProof} colors={colors} />
      <DocumentLink label="Photo" href={record.photo} colors={colors} />
    </div>
  );
}

function DocumentLink({ label, href, colors }: { label: string; href?: string; colors: ReturnType<typeof getThemePalette> }) {
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold" style={{ color: colors.accent }}>
      <FileText size={12} />
      {label}
      <ExternalLink size={12} />
    </a>
  ) : (
    <div className="text-xs" style={{ color: colors.subtleText }}>{label}: Missing</div>
  );
}

function formatDate(value?: string) {
  if (!value) return "Unknown date";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
