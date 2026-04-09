"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Search,
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");

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
          <h2 className="text-3xl font-black tracking-tight text-white">Dongle Records</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
            Production view for DSC processing with eKYC, BP code, certificate setup, document readiness,
            current status, and direct file access from backend records.
          </p>
        </div>

        <label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#171b22] px-4 py-3 text-sm lg:max-w-md">
          <Search size={16} className="text-slate-500" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search name, mobile, PAN, eKYC ID, BP code"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total records" value={records.length} />
        <SummaryCard label="Docs complete" value={records.filter((record) => record.documentsReady).length} />
        <SummaryCard label="USB token" value={records.filter((record) => record.tokenType === "USB Token").length} />
        <SummaryCard label="Approved" value={records.filter((record) => record.status === "approved").length} />
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#11161d] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1380px] text-left">
            <thead className="bg-white/5 text-[11px] uppercase tracking-[0.16em] text-slate-400">
              <tr>
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
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">
                    Loading dongle records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400">
                    No dongle records matched your search.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-4 align-top">
                      <div>
                        <p className="text-sm font-semibold text-white">{record.name || "Unknown user"}</p>
                        <p className="mt-1 break-all text-xs text-slate-400">{record.email || "Email not available"}</p>
                        <p className="mt-1 text-xs text-slate-500">{record.mobile || "Mobile not available"}</p>
                        <p className="mt-1 text-xs text-slate-500">{record.pan || "PAN not available"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <DataText label="BP code" value={record.bpCode || "Not entered"} />
                      <DataText label="eKYC ID" value={record.ekycId || "Not entered"} />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <DataText label="Type" value={record.certType || "Not selected"} />
                      <DataText label="Class" value={record.certificateClass || "Not selected"} />
                      <DataText label="Validity" value={record.validity || "Not selected"} />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm text-slate-200">{record.tokenType || "Not selected"}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="space-y-2">
                        <DocsBadge ready={record.documentsReady} count={record.documentCount} />
                        <DocLinks record={record} />
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="text-sm text-slate-200">{formatDate(record.updatedAt)}</p>
                      <p className="mt-1 text-xs text-slate-500">Created {formatDate(record.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="max-w-xs text-xs leading-6 text-slate-400">
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
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#11161d] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function DataText({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 last:mb-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-200">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: DongleRecord["status"] }) {
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

function DocsBadge({ ready, count }: { ready: boolean; count: number }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
        ready
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          : "border-amber-400/25 bg-amber-400/10 text-amber-300"
      }`}
    >
      {ready ? `Complete (${count}/3)` : `Pending (${count}/3)`}
    </span>
  );
}

function DocLinks({ record }: { record: DongleRecord }) {
  return (
    <div className="space-y-1">
      <DocumentLink label="Address" href={record.addressProof} />
      <DocumentLink label="ID Proof" href={record.idProof} />
      <DocumentLink label="Photo" href={record.photo} />
    </div>
  );
}

function DocumentLink({ label, href }: { label: string; href?: string }) {
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 text-xs font-semibold text-[#45c3b9] hover:text-white"
    >
      <FileText size={12} />
      {label}
      <ExternalLink size={12} />
    </a>
  ) : (
    <div className="text-xs text-slate-500">{label}: Missing</div>
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
