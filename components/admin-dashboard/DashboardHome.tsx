"use client";

import { useState } from "react";
import type { DashboardUser } from "@/components/UserLedger";
import {
  Download,
  FileText,
  ImagePlus,
  IndianRupee,
  MapPinned,
  Search,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";

import { MetricsGrid } from "@/components/admin-dashboard/MetricsGrid";
import type { DashboardStats, DashboardView } from "@/components/admin-dashboard/types";

export function DashboardHome({
  stats,
  latestUsers,
  filteredUsers,
  search,
  isDarkMode,
  colors,
  onSearchChange,
  onViewChange,
}: {
  admin: unknown;
  stats: DashboardStats;
  loading: boolean;
  search: string;
  latestPage: number;
  itemsPerPage: number;
  filteredUsers: DashboardUser[];
  latestUsers: DashboardUser[];
  totalLatestPages: number;
  expandedUserId: string | null;
  chartData: Array<{ name: string; value: number }>;
  isDarkMode: boolean;
  colors: {
    borderSoft: string;
    panel: string;
    panelStrong: string;
    subtleText: string;
    text: string;
    muted: string;
  };
  onSearchChange: (value: string) => void;
  onLatestPageChange: (value: number) => void;
  onExpandedUserIdChange: (value: string | null) => void;
  onViewChange: (view: DashboardView) => void;
}) {
  const [actionLoading, setActionLoading] = useState<"track" | "claim" | "apply" | null>(null);

  const topButtons = [
    {
      label: "Update Shipping Address",
      icon: <MapPinned size={16} />,
      onClick: () => onViewChange("admin"),
    },
    {
      label: "View Shipping Address",
      icon: <Truck size={16} />,
      onClick: () =>
        toast.success(
          latestUsers[0]?.number
            ? `Shipping contact: ${latestUsers[0].number}`
            : "No shipping address saved yet",
        ),
    },
    {
      label: "Download RA Agreement",
      icon: <Download size={16} />,
      onClick: () => toast.success("Agreement download can be connected here."),
    },
  ];

  const handleTrack = async () => {
    const candidateNumber = latestUsers[0]?.number || filteredUsers[0]?.number;
    if (!candidateNumber) {
      toast.error("No user mobile available to track DSC");
      return;
    }

    setActionLoading("track");
    try {
      const response = await fetch("/api/track-dsc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: candidateNumber }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to track DSC");
      toast.success(`Status: ${data.status}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to track DSC");
    } finally {
      setActionLoading(null);
    }
  };

  const handleClaim = async () => {
    const candidateUserId = latestUsers[0]?._id || filteredUsers[0]?._id;
    if (!candidateUserId) {
      toast.error("No user available to claim mTokens");
      return;
    }

    setActionLoading("claim");
    try {
      const response = await fetch("/api/claim-mtokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: candidateUserId }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Claim failed");
      toast.success(data.message || "mTokens claimed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Claim failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApply = () => {
    setActionLoading("apply");
    setTimeout(() => {
      setActionLoading(null);
      onViewChange("applications");
      toast.success("Open applications to apply for DSC");
    }, 250);
  };

  return (
    <div className="min-h-0 h-full space-y-6 overflow-y-auto pr-0 lg:pr-1">
      <section
        className="rounded-[1.75rem] border p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: colors.panelStrong,
        }}
      >
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: colors.subtleText }}>
              Dashboard overview
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight" style={{ color: colors.text }}>
              Commission and approval summary
            </h1>
          </div>

          <div
            className="rounded-2xl px-5 py-3 text-sm italic"
            style={{
              color: "#b91c1c",
              backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
            }}
          >
            Claim mTokens Rs315 (385-70 Cash Back scheme benefits for limited period)
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {topButtons.map((button) => (
              <TopActionButton
                key={button.label}
                label={button.label}
                icon={button.icon}
                onClick={button.onClick}
              />
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex min-w-56 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_rgba(245,158,11,0.8)] transition hover:-translate-y-0.5 hover:brightness-105"
              style={{ background: "linear-gradient(135deg, #ffb31a, #f59e0b)" }}
              onClick={() => toast.success("New Scheme button can be connected here.")}
            >
              <ImagePlus size={16} />
              New Scheme
            </button>
          </div>
        </div>
      </section>

      <MetricsGrid stats={stats} isDarkMode={isDarkMode} />

      <section
        className="rounded-[1.75rem] border p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: colors.panelStrong,
        }}
      >
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: colors.subtleText }}>
              Quick actions
            </p>
            <h2 className="mt-2 text-lg font-bold tracking-tight" style={{ color: colors.text }}>
              Service shortcuts
            </h2>
          </div>

          <label
            className="flex w-full max-w-xl items-center gap-3 rounded-2xl border px-4 py-3"
            style={{
              borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              backgroundColor: colors.panel,
            }}
          >
            <Search size={18} style={{ color: colors.subtleText }} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full bg-transparent text-[15px] outline-none"
              style={{ color: colors.text }}
            />
          </label>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <ServiceCard
            icon={<Search size={24} />}
            title="Track DSC"
            description="View the current status of your Digital Signature Certificate."
            buttonLabel="Track DSC"
            buttonTone="blue"
            loading={actionLoading === "track"}
            onClick={handleTrack}
            colors={colors}
          />
          <ServiceCard
            icon={<IndianRupee size={24} />}
            title="Claim mTokens"
            description="Rs315 (385-70 Cash Back scheme benefits for limited period)"
            buttonLabel="Claim Now"
            buttonTone="light"
            loading={actionLoading === "claim"}
            onClick={handleClaim}
            colors={colors}
            highlighted
          />
          <ServiceCard
            icon={<FileText size={24} />}
            title="Apply DSC"
            description="Register & apply for a new Digital Signature Certificate."
            buttonLabel="Apply Now"
            buttonTone="orange"
            loading={actionLoading === "apply"}
            onClick={handleApply}
            colors={colors}
          />
        </div>
      </section>

      <footer
        className="rounded-[1.75rem] border px-6 py-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.2)]"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.72)",
        }}
      >
        <div className="grid gap-4 text-sm lg:grid-cols-3 lg:items-center">
          <div style={{ color: colors.muted }}>
            <p className="font-semibold">All rights reserved by</p>
            <p className="mt-1 text-xl font-black" style={{ color: "#1d7fd0" }}>
              DongleIQ
            </p>
          </div>

          <div className="text-sm leading-7" style={{ color: colors.muted }}>
            <p>Version : 1.2.0.1 || BuildNumber : 20260420.1 || BuildID : 8358</p>
          </div>

          <div className="text-sm leading-7 lg:text-right" style={{ color: "#2563eb" }}>
            <p>Support call 020-49105678, 7777090977</p>
            <p>Support Email: info@dongleiq.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TopActionButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-5 text-base font-medium text-white shadow-[0_16px_30px_-18px_rgba(29,127,208,0.7)] transition hover:-translate-y-0.5 hover:brightness-105"
      style={{
        background: "linear-gradient(135deg, #1d7fd0, #2f92e8)",
        borderColor: "transparent",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  buttonLabel,
  buttonTone,
  loading,
  onClick,
  colors,
  highlighted = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  buttonTone: "blue" | "orange" | "light";
  loading: boolean;
  onClick: () => void;
  colors: {
    panelStrong: string;
    text: string;
    muted: string;
    borderSoft: string;
  };
  highlighted?: boolean;
}) {
  const buttonStyles = {
    blue: { background: "linear-gradient(135deg, #3578f6, #2563eb)", color: "#ffffff" },
    orange: { background: "linear-gradient(135deg, #ffb31a, #f59e0b)", color: "#ffffff" },
    light: { background: "#ffffff", color: "#2563eb" },
  } as const;

  return (
    <div
      className="rounded-[2rem] border px-10 py-10 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        borderColor: colors.borderSoft,
        background: highlighted ? "linear-gradient(180deg, #619cf4, #4f8ce9)" : colors.panelStrong,
        color: highlighted ? "#ffffff" : colors.text,
      }}
    >
      <div
        className="flex h-18 w-18 items-center justify-center rounded-full"
        style={{
          backgroundColor: highlighted
            ? "rgba(255,255,255,0.16)"
            : title === "Apply DSC"
              ? "rgba(255,179,26,0.12)"
              : "rgba(53,120,246,0.12)",
          color: highlighted ? "#ffffff" : title === "Apply DSC" ? "#f59e0b" : "#3578f6",
        }}
      >
        {icon}
      </div>

      <h3 className="mt-8 text-[2rem] font-medium leading-tight">{title}</h3>
      <p
        className="mt-8 min-h-24 text-[15px] leading-8"
        style={{ color: highlighted ? "rgba(255,255,255,0.95)" : colors.muted }}
      >
        {description}
      </p>

      <div
        className="mt-8 h-px w-full"
        style={{ backgroundColor: highlighted ? "rgba(255,255,255,0.3)" : colors.borderSoft }}
      />

      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="mt-8 rounded-2xl px-7 py-4 text-xl font-medium transition disabled:opacity-70"
        style={buttonStyles[buttonTone]}
      >
        {loading ? "Please wait..." : buttonLabel}
      </button>
    </div>
  );
}
