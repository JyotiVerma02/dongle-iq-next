"use client";

import { UserPlus } from "lucide-react";

type AdminApplicationsHeaderProps = {
  colors: Record<string, string>;
  onCreate: () => void;
};

export default function AdminApplicationsHeader({ colors, onCreate }: AdminApplicationsHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-2">
      <p
        className="text-[10px] font-black uppercase tracking-[0.24em]"
        style={{ color: colors.accent }}
      >
        Application Workspace
      </p>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-black lg:text-2xl" style={{ color: colors.text }}>
            Applications
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: colors.muted }}>
            Compact applicant management with create, review, edit, filters, and exports in one admin flow.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="theme-transition inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_20px_30px_-22px_var(--accent-shadow)] transition hover:-translate-y-0.5 active:scale-[0.99] sm:w-auto"
          style={{ background: "var(--brand-gradient)" }}
        >
          <UserPlus size={15} />
          New Applicant
        </button>
      </div>
    </div>
  );
}
