import { useState } from "react";
import { Search, MapPin, Download, ExternalLink, MessageCircle } from "lucide-react";
import { User } from "../../types";
import { Table } from "../common/Table";

interface TrackDSCViewProps {
  users: User[];
}

export function TrackDSCView({ users }: TrackDSCViewProps) {
  const [searchId, setSearchId] = useState("");
  const dscUsers = users.filter(u => u.serviceType === "dsc" || u.appId?.startsWith("DSC"));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">
            DSC Application Tracking
          </h2>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
            Track and manage digital signature certificate processing.
          </p>
        </div>
      </div>

      <div className="mb-8 ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)" }}>
        <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-[var(--foreground)]">
              Track by Application ID
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-[var(--muted)]" />
              </div>
              <input
                type="text"
                className="block w-full rounded-xl border border-[var(--border-soft)] bg-[var(--background-alt)] py-3 pl-10 text-[var(--foreground)] shadow-sm focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] text-xs font-semibold uppercase tracking-wider placeholder:text-[var(--muted)]"
                placeholder="E.G. DSC2024001"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
          </div>
          <button className="theme-primary-btn theme-transition inline-flex items-center gap-2 rounded-lg px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white">
            <MapPin className="h-4 w-4" />
            Track Now
          </button>
        </div>
      </div>

      {/* Single Tracking Status */}
      <div className="mb-8 ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)" }}>
        <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">DSC APPLICATION STATUS</h3>
        
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">Application ID</p>
                <p className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">DSC2024001</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">Applicant Name</p>
                <p className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Rajesh Kumar</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">Email Address</p>
                <p className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">rajesh@example.com</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button className="theme-transition flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--accent)] bg-[var(--accent-faint)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)] hover:bg-[var(--accent-soft)]">
                <Download className="h-4 w-4" />
                Download Certificate
              </button>
              <div className="flex space-x-3">
                <button className="theme-transition flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--foreground)] hover:brightness-95">
                  <ExternalLink className="h-4 w-4" />
                  Portal
                </button>
                <button className="theme-transition flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--foreground)] hover:brightness-95">
                  <MessageCircle className="h-4 w-4" />
                  Support
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[var(--background-alt)] p-6">
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-[var(--foreground)]">Current Status</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">80%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: "80%" }}></div>
              </div>
              <p className="mt-2 text-xs font-medium text-[var(--muted)]">Processing at DSC Provider</p>
            </div>

            <div className="space-y-6 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
              <div className="relative">
                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-[var(--background-alt)]"></div>
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">Application Submitted</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Jan 01, 2024</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-[var(--background-alt)]"></div>
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">Document Verification</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Jan 02, 2024</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-[var(--background-alt)]"></div>
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">Payment Confirmed</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Jan 05, 2024</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-[var(--background-alt)] animate-pulse"></div>
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">DSC Processing</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Jan 10, 2024</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-[var(--border-soft)] ring-4 ring-[var(--background-alt)]"></div>
                <p className="text-sm font-bold uppercase tracking-wider text-[var(--muted)]">Expected Completion</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">Jan 15, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Tracking Table */}
      <div className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border" style={{ borderColor: "var(--border-soft)" }}>
        <div className="border-b border-[var(--border-soft)] p-4 sm:p-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">DSC BULK TRACKING</h3>
        </div>
        <Table
          className="rounded-b-xl"
          data={[
            { id: "DSC001", applicant: "Rajesh K", status: "Processing", progress: 80, expected: "2024-01-15", statusColor: "text-blue-500" },
            { id: "DSC002", applicant: "Priya M", status: "Pending", progress: 20, expected: "2024-01-18", statusColor: "text-amber-500" },
            { id: "DSC003", applicant: "Amit S", status: "Approved", progress: 100, expected: "2024-01-12", statusColor: "text-emerald-500" },
          ]}
          columns={[
            { header: "APP ID", accessor: "id", className: "font-semibold text-xs text-[var(--foreground)] uppercase" },
            { header: "APPLICANT", accessor: "applicant", className: "text-[10px] font-black uppercase tracking-wider text-[var(--muted)]" },
            {
              header: "STATUS",
              render: (item) => (
                <span className={`inline-flex rounded-full bg-[var(--background-alt)] px-2 py-1 text-[10px] font-black uppercase tracking-wider ${item.statusColor}`}>
                  {item.status}
                </span>
              ),
            },
            {
              header: "PROGRESS",
              render: (item) => (
                <div className="flex items-center">
                  <div className="mr-2 w-24 h-2 rounded-full bg-[var(--border-soft)]">
                    <div className={`h-2 rounded-full ${item.progress === 100 ? "bg-emerald-500" : item.progress === 20 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${item.progress}%` }}></div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">{item.progress}%</span>
                </div>
              ),
            },
            { header: "EXPECTED", accessor: "expected", align: "right", className: "text-[10px] font-black uppercase tracking-wider text-[var(--muted)]" },
          ]}
          keyExtractor={(item) => item.id}
        />
      </div>
    </div>
  );
}
