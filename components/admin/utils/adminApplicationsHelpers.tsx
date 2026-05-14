"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { DashboardUser } from "@/components/UserLedger";
import type React from "react";

type FilterOption = {
  label: string;
  value: string;
};

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  colors: Record<string, string>;
};

export function FilterSelect({
  value,
  onChange,
  options,
  colors,
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-lg border px-3 text-sm font-semibold outline-none"
      style={{
        borderColor: colors.borderSoft,
        backgroundColor: colors.panel,
        color: colors.text,
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

type SortableHeadProps = {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
};

export function SortableHead({
  label,
  active,
  direction,
  onClick,
}: SortableHeadProps) {
  return (
    <th className="cursor-pointer px-4 py-3" onClick={onClick}>
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {active ? (
          direction === "asc" ? (
            <ArrowUp size={12} />
          ) : (
            <ArrowDown size={12} />
          )
        ) : (
          <ArrowUpDown size={12} className="opacity-40" />
        )}
      </div>
    </th>
  );
}

type ActionIconButtonProps = {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  danger?: boolean;
};

export function ActionIconButton({
  label,
  onClick,
  icon,
  danger = false,
}: ActionIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border transition hover:-translate-y-0.5 active:scale-95"
      style={{
        borderColor: danger ? "rgba(225,29,72,0.16)" : "var(--border-soft)",
        backgroundColor: "var(--card)",
        color: danger ? "#e11d48" : "var(--foreground)",
      }}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

type StatusBadgeProps = {
  status: DashboardUser["status"];
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const toneMap: Record<DashboardUser["status"], { bg: string; color: string }> = {
    pending: { bg: "rgba(245,158,11,0.16)", color: "#d97706" },
    approved: { bg: "rgba(34,197,94,0.16)", color: "#16a34a" },
    rejected: { bg: "rgba(244,63,94,0.16)", color: "#e11d48" },
    issued: { bg: "rgba(37,99,235,0.16)", color: "#2563eb" },
  };

  return (
    <span
      className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
      style={{
        backgroundColor: toneMap[status].bg,
        color: toneMap[status].color,
      }}
    >
      {status}
    </span>
  );
}

export function formatDate(value?: string) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function capitalizeValue(value: string) {
  if (value === "all") return "All Statuses";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
