"use client";

import { Loader2 } from "lucide-react";
import { useMemo } from "react";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export function useDashboardPalette() {
  const { isDarkMode } = useTheme();
  return useMemo(() => getThemePalette(isDarkMode), [isDarkMode]);
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const colors = useDashboardPalette();

  return (
    <section
      className={`rounded-2xl border shadow-[0_18px_50px_-34px_var(--accent-shadow)] ${className}`}
      style={{
        borderColor: colors.borderSoft,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)), var(--card-strong)",
      }}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  const colors = useDashboardPalette();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p
          className="text-[11px] font-black uppercase tracking-[0.24em]"
          style={{ color: colors.accent }}
        >
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-black" style={{ color: colors.text }}>
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm" style={{ color: colors.muted }}>
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-2xl ${className}`}
      style={{ backgroundColor: "var(--skeleton)" }}
      aria-hidden="true"
    />
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const colors = useDashboardPalette();

  return (
    <div
      className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center"
      style={{
        borderColor: colors.borderSoft,
        backgroundColor: colors.panel,
      }}
    >
      <p className="text-lg font-black" style={{ color: colors.text }}>
        {title}
      </p>
      <p className="mt-2 max-w-md text-sm" style={{ color: colors.muted }}>
        {description}
      </p>
    </div>
  );
}

export function InlineLoader({ label }: { label: string }) {
  const colors = useDashboardPalette();

  return (
    <div className="flex items-center gap-2 text-sm" style={{ color: colors.muted }}>
      <Loader2 size={16} className="animate-spin" />
      {label}
    </div>
  );
}
