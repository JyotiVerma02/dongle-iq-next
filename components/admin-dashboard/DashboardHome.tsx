"use client";

import { useState } from "react";
import type { DashboardUser } from "@/components/UserLedger";
import {
  Download,
  FileText,
  ImagePlus,
  IndianRupee,
  MapPinned,
  MessageCircle,
  Search,
  Send,
  Smartphone,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";

import { MetricsGrid } from "@/components/admin-dashboard/MetricsGrid";
import type {
  AdminProfile,
  DashboardStats,
  DashboardView,
} from "@/components/admin-dashboard/types";

export function DashboardHome({
  admin,
  stats,
  latestUsers,
  filteredUsers,
  search,
  isDarkMode,
  colors,
  onSearchChange,
  onViewChange,
}: {
  admin: AdminProfile | null;
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
    accent: string;
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
  void search;
  void onSearchChange;
  const [actionLoading, setActionLoading] = useState<
    "track" | "claim" | "apply" | null
  >(null);
  const [testMobile, setTestMobile] = useState(admin?.number || "");
  const [testMessage, setTestMessage] = useState("DongleIQ test notification");
  const [testingChannel, setTestingChannel] = useState<"sms" | "whatsapp" | null>(null);

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

  const handleTrack = () => {
    setActionLoading("track");

    setTimeout(() => {
      setActionLoading(null);
      onViewChange("track-dsc");
    }, 200);
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

  const handleNotificationTest = async (channel: "sms" | "whatsapp") => {
    if (!testMobile.trim()) {
      toast.error("Enter a mobile number first");
      return;
    }

    setTestingChannel(channel);
    try {
      const response = await fetch("/api/admin/test-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          mobileNumber: testMobile,
          message: testMessage.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || `Unable to send test ${channel}`);
      }

      toast.success(
        channel === "sms"
          ? "Test SMS sent successfully"
          : "Test WhatsApp message sent successfully",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Unable to send test ${channel}`,
      );
    } finally {
      setTestingChannel(null);
    }
  };

  return (
    <div className="min-h-0 h-full space-y-5 overflow-y-auto overflow-x-hidden pr-0 lg:pr-1">
      <section
        className="dashboard-shell-surface rounded-lg p-5 sm:p-6"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: colors.panelStrong,
        }}
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: colors.subtleText }}
              >
                Dashboard overview
              </p>
              <h1
                className="mt-2 text-2xl font-black tracking-tight"
                style={{ color: colors.text }}
              >
                Commission and approval summary
              </h1>
              <div
                className="mt-4 max-w-[560px] rounded-lg px-4 py-3 text-sm italic"
                style={{
                  color: isDarkMode ? "rgba(234,240,255,0.86)" : colors.text,
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.045)" : colors.panel,
                  border: `1px solid ${colors.borderSoft}`,
                }}
              >
                Claim mTokens Rs315 (385-70 Cash Back scheme benefits for
                limited period)
              </div>
            </div>

            <div className="flex-shrink-0">
              <button
                type="button"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:scale-[1.03] sm:min-w-[180px] sm:w-auto"
                style={{
                  background: "linear-gradient(135deg, var(--accent-light), var(--accent-secondary))",
                }}
              >
                <ImagePlus size={16} />
                New Scheme
              </button>
            </div>
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
        </div>
      </section>

      <MetricsGrid stats={stats} isDarkMode={isDarkMode} />

      <section
        className="dashboard-shell-surface rounded-lg p-5 sm:p-6"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: colors.panelStrong,
          color: colors.text,
        }}
      >
        <div className="grid gap-6 xl:grid-cols-3">
          <ServiceCard
            icon={<Search size={22} />}
            title="Track DSC"
            description="View the current status of your Digital Signature Certificate."
            buttonLabel="Track DSC"
            buttonTone="blue"
            loading={actionLoading === "track"}
            onClick={handleTrack}
            colors={colors}
          />
          <ServiceCard
            icon={<IndianRupee size={22} />}
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
            icon={<FileText size={22} />}
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

      <section
        className="dashboard-shell-surface rounded-lg p-5 sm:p-6"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: colors.panelStrong,
          color: colors.text,
        }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: colors.subtleText }}
            >
              Notification Testing
            </p>
            <h2 className="mt-2 text-xl font-black" style={{ color: colors.text }}>
              Test MSG91 SMS and WhatsApp
            </h2>
            <p className="mt-2 text-sm leading-7" style={{ color: colors.muted }}>
              Use this to verify your MSG91 configuration before relying on OTP
              or status notifications in the main flow.
            </p>
          </div>

          <div className="grid w-full gap-3 lg:max-w-3xl lg:grid-cols-[1.2fr,1.8fr,auto,auto]">
            <label className="flex min-w-0 flex-col gap-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: colors.subtleText }}
              >
                Mobile Number
              </span>
              <div
                className="flex min-h-11 items-center gap-2 rounded-xl border px-3"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                }}
              >
                <Smartphone size={16} style={{ color: colors.muted }} />
                <input
                  type="text"
                  value={testMobile}
                  onChange={(event) => setTestMobile(event.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: colors.text }}
                />
              </div>
            </label>

            <label className="flex min-w-0 flex-col gap-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: colors.subtleText }}
              >
                Test Message
              </span>
              <div
                className="flex min-h-11 items-center gap-2 rounded-xl border px-3"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                }}
              >
                <MessageCircle size={16} style={{ color: colors.muted }} />
                <input
                  type="text"
                  value={testMessage}
                  onChange={(event) => setTestMessage(event.target.value)}
                  placeholder="DongleIQ test notification"
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: colors.text }}
                />
              </div>
            </label>

            <button
              type="button"
              onClick={() => void handleNotificationTest("sms")}
              disabled={testingChannel !== null}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition disabled:opacity-70"
              style={{ background: "var(--brand-gradient)" }}
            >
              <Send size={15} />
              {testingChannel === "sms" ? "Sending SMS..." : "Test SMS"}
            </button>

            <button
              type="button"
              onClick={() => void handleNotificationTest("whatsapp")}
              disabled={testingChannel !== null}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:opacity-70"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: colors.panel,
                color: colors.text,
              }}
            >
              <MessageCircle size={15} />
              {testingChannel === "whatsapp"
                ? "Sending WhatsApp..."
                : "Test WhatsApp"}
            </button>
          </div>
        </div>
      </section>

      <footer
        className="dashboard-muted-surface rounded-lg px-5 py-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.2)]"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: isDarkMode
            ? "rgba(255,255,255,0.03)"
            : "rgba(255,255,255,0.72)",
        }}
      >
        <div className="grid gap-4 text-sm lg:grid-cols-3 lg:items-center">
          <div style={{ color: colors.muted }}>
            <p className="font-semibold">All rights reserved by</p>
            <p className="mt-1 text-xl font-black" style={{ color: colors.accent }}>
              DongleIQ
            </p>
          </div>

          <div className="text-sm leading-7" style={{ color: colors.muted }}>
            <p>
              Version : 1.2.0.1 || BuildNumber : 20260420.1 || BuildID : 8358
            </p>
          </div>

          <div
            className="break-words text-sm leading-7 lg:text-right"
            style={{ color: colors.accent }}
          >
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
      className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border px-3 py-2 text-center text-base font-medium text-white shadow-[0_16px_30px_-18px_var(--accent-shadow)] transition hover:-translate-y-0.5 hover:brightness-105"
      style={{
        background: "var(--brand-gradient)",
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
    blue: {
      background: "var(--brand-gradient)",
      color: "#ffffff",
    },
    orange: {
      background: "linear-gradient(135deg, var(--accent-light), var(--accent-secondary))",
      color: "#ffffff",
    },
    light: { background: "var(--card)", color: "var(--accent)" },
  } as const;

  const iconStyles = highlighted
    ? {
        wrapper: "rgba(255,255,255,0.14)",
        color: "#ffffff",
      }
    : title === "Apply DSC"
      ? {
          wrapper: "rgba(255,179,26,0.14)",
          color: "#f59e0b",
        }
      : {
          wrapper: "var(--accent-soft)",
          color: "var(--accent)",
        };

  return (
    <div
      className="rounded-lg border px-5 py-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:px-6 sm:py-7"
      style={{
        borderColor: colors.borderSoft,
        background: highlighted
          ? "var(--brand-gradient)"
          : colors.panelStrong,
        color: highlighted ? "#ffffff" : colors.text,
        margin: highlighted ? "-6px" : undefined,
      }}
    >
      <div className="mt-2 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{
            backgroundColor: iconStyles.wrapper,
            color: iconStyles.color,
          }}
        >
          {icon}
        </div>

        <h3 className="text-[18px] font-semibold leading-tight">{title}</h3>
      </div>

      <p
        className="mt-5 min-h-[96px] max-w-full text-[14px] leading-7 sm:max-w-[24ch]"
        style={{
          color: highlighted ? "rgba(255,255,255,0.95)" : colors.muted,
        }}
      >
        {description}
      </p>

      <div
        className="mt-6 h-px w-full"
        style={{
          backgroundColor: highlighted
            ? "rgba(255,255,255,0.3)"
            : colors.borderSoft,
        }}
      />

      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="mt-6 min-h-11 rounded-[0.8rem] px-4 py-2 text-[15px] font-medium transition disabled:opacity-70"
        style={buttonStyles[buttonTone]}
      >
        {loading ? "Please wait..." : buttonLabel}
      </button>
    </div>
  );
}
