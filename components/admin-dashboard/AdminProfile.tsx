"use client";

import { Mail, PencilLine, Phone, Settings, User } from "lucide-react";

import BackToPreviewButton from "@/components/BackToPreviewButton";
import type { AdminProfile } from "@/components/admin-dashboard/types";

export function AdminProfileSection({
  admin,
  adminForm,
  isDarkMode,
  colors,
  isEditingAdmin,
  savingAdmin,
  adminMessage,
  onToggleEdit,
  onAdminFormChange,
  onSave,
}: {
  admin: AdminProfile | null;
  adminForm: {
    name: string;
    email: string;
    number: string;
    role: string;
  };
  isDarkMode: boolean;
  colors: {
    panel: string;
    panelStrong: string;
    text: string;
    muted: string;
    subtleText: string;
    input: string;
    inputBorder: string;
  };
  isEditingAdmin: boolean;
  savingAdmin: boolean;
  adminMessage: string;
  onToggleEdit: () => void;
  onAdminFormChange: (field: "name" | "email" | "number" | "role", value: string) => void;
  onSave: () => void;
}) {
  return (
    <div className="h-full overflow-y-auto min-h-0">
      <div className="mb-4">
        <BackToPreviewButton />

        <div className="flex items-center justify-between">
          <h1 className="mt-1 text-xl font-black lg:text-2xl" style={{ color: colors.text }}>
            Admin Profile
          </h1>
        </div>

        <p className="mt-1 text-[13px]" style={{ color: colors.muted }}>
          Manage admin details, update profile information, and control system access.
        </p>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div
          className="theme-transition rounded-xl border p-4 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:shadow-2xl"
          style={{
            borderColor: colors.borderSoft,
            backgroundColor: colors.panelStrong,
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: colors.subtleText }}>
                Profile
              </p>
              <h2 className="mt-1 text-xl font-black lg:text-2xl" style={{ color: colors.text }}>
                {admin?.name || "Admin"}
              </h2>
              <p className="mt-2 max-w-xl text-[13px] leading-5" style={{ color: colors.muted }}>
                Keep your admin contact details updated so the panel always shows the correct owner and communication channel.
              </p>
            </div>
            <button
              onClick={onToggleEdit}
              className="theme-transition inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_var(--accent-shadow)]"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: colors.panel,
                color: colors.text,
              }}
            >
              <PencilLine size={16} />
              {isEditingAdmin ? "Close edit" : "Edit"}
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <ProfileCard label="Admin name" value={admin?.name || "Not set"} icon={<User size={16} />} isDarkMode={isDarkMode} colors={colors} />
            <ProfileCard label="Email" value={admin?.email || "Not set"} icon={<Mail size={16} />} isDarkMode={isDarkMode} colors={colors} />
            <ProfileCard label="Phone" value={admin?.number || "Not set"} icon={<Phone size={16} />} isDarkMode={isDarkMode} colors={colors} />
            <ProfileCard label="Role" value={admin?.role || "admin"} icon={<Settings size={16} />} isDarkMode={isDarkMode} colors={colors} />
          </div>

          {adminMessage ? (
            <div
              className="theme-transition mt-4 rounded-xl border px-4 py-3 text-[13px]"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: colors.panel,
                color: colors.text,
              }}
            >
              {adminMessage}
            </div>
          ) : null}
        </div>

        <div
          className="theme-transition rounded-xl border p-4 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:shadow-2xl"
          style={{
            borderColor: colors.borderSoft,
            backgroundColor: colors.panelStrong,
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: colors.subtleText }}>
            Edit details
          </p>
          <h3 className="mt-1 text-xl font-black" style={{ color: colors.text }}>
            Admin settings
          </h3>

          <div className="mt-4 space-y-3">
            <InputField label="Full name" value={adminForm.name} onChange={(value) => onAdminFormChange("name", value)} disabled={!isEditingAdmin} colors={colors} />
            <InputField label="Email" value={adminForm.email} onChange={(value) => onAdminFormChange("email", value)} disabled={!isEditingAdmin} colors={colors} />
            <InputField label="Phone" value={adminForm.number} onChange={(value) => onAdminFormChange("number", value)} disabled={!isEditingAdmin} colors={colors} />
            <InputField label="Role" value={adminForm.role} onChange={(value) => onAdminFormChange("role", value)} disabled={!isEditingAdmin} colors={colors} />
          </div>

          <button
            onClick={onSave}
            disabled={!isEditingAdmin || savingAdmin}
            className="mt-4 w-full rounded-xl px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_16px_30px_-18px_var(--accent-shadow)] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: "var(--brand-gradient)" }}
          >
            {savingAdmin ? "Saving..." : "Save admin profile"}
          </button>
        </div>
      </section>
    </div>
  );
}

function ProfileCard({
  label,
  value,
  icon,
  isDarkMode,
  colors,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  isDarkMode: boolean;
  colors: {
    panel: string;
    text: string;
    subtleText: string;
  };
}) {
  return (
    <div
      className="theme-transition min-w-0 rounded-xl border p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        borderColor: "var(--border-soft)",
        backgroundColor: colors.panel,
      }}
    >
      <div className="flex items-center gap-2" style={{ color: colors.text }}>
        <span style={{ color: "var(--accent)" }}>{icon}</span>
        <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: colors.subtleText }}>
          {label}
        </span>
      </div>
      <p className="mt-3 min-w-0 break-all text-[13px] font-bold" style={{ color: colors.text }}>
        {value}
      </p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  disabled,
  colors,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  colors: {
    subtleText: string;
    inputBorder: string;
    input: string;
    text: string;
  };
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: colors.subtleText }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="theme-transition mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-[13px] outline-none disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          borderColor: colors.inputBorder,
          backgroundColor: colors.input,
          color: colors.text,
        }}
      />
    </label>
  );
}
