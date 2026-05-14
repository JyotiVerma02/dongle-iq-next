"use client";

import type { DashboardUser } from "@/components/UserLedger";

type AdminApplicationsDeleteModalProps = {
  deleteTarget: DashboardUser;
  deletingUserId: string | null;
  colors: Record<string, string>;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AdminApplicationsDeleteModal({
  deleteTarget,
  deletingUserId,
  colors,
  onConfirm,
  onCancel,
}: AdminApplicationsDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
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
        <h3 className="mt-2 text-lg font-black" style={{ color: colors.text }}>
          Remove {deleteTarget.name}?
        </h3>
        <p className="mt-2 text-sm leading-6" style={{ color: colors.muted }}>
          This action will delete the applicant record from the admin list.
          Please confirm before continuing.
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
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
            onClick={onConfirm}
            disabled={deletingUserId === deleteTarget._id}
            className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #ef4444, #be123c)",
            }}
          >
            {deletingUserId === deleteTarget._id ? "Deleting..." : "Delete Applicant"}
          </button>
        </div>
      </div>
    </div>
  );
}
