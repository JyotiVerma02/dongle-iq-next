"use client";

import React from "react";
import { CheckCircle2, Clock3, IndianRupee, Receipt, Wallet, XCircle } from "lucide-react";

import type { DashboardStats } from "@/components/admin-dashboard/types";

export function MetricsGrid({ stats, isDarkMode }: DashboardMetricsProps) {
  const cards = [
    {
      label: "DSC Commission",
      value: stats.dscCommission,
      icon: <IndianRupee size={22} />,
      background: "linear-gradient(135deg, #7c848d, #747d86)",
      textColor: "#0b1220",
    },
    {
      label: "Token Amount",
      value: stats.tokenAmount,
      icon: <Wallet size={22} />,
      background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
      textColor: "#ffffff",
    },
    {
      label: "Assisted Amount",
      value: stats.assistedAmount,
      icon: <Receipt size={22} />,
      background: "linear-gradient(135deg, #ffcf3c, #ffbf08)",
      textColor: "#0b1220",
    },
    {
      label: "Total Commission",
      value: stats.totalCommission,
      icon: <IndianRupee size={22} />,
      background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
      textColor: "#0b1220",
    },
    {
      label: "GST Paid Amount",
      value: stats.gstPaid,
      icon: <Receipt size={22} />,
      background: "linear-gradient(135deg, var(--accent), var(--accent-secondary))",
      textColor: "#0b1220",
    },
    {
      label: "Paid Commission",
      value: stats.paidCommission,
      icon: <CheckCircle2 size={22} />,
      background: "linear-gradient(135deg, #2cae40, #2aa33d)",
      textColor: "#0b1220",
    },
    {
      label: "Pending for Approval",
      value: stats.pendingApproval,
      icon: <Clock3 size={22} />,
      background: "linear-gradient(135deg, #ffcf3c, #ffbf08)",
      textColor: "#0b1220",
    },
    {
      label: "Unpaid Commission",
      value: stats.unpaidCommission,
      icon: <XCircle size={22} />,
      background: "linear-gradient(135deg, #e23449, #dd2f43)",
      textColor: "#0b1220",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <MetricCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          background={card.background}
          textColor={card.textColor}
          isDarkMode={isDarkMode}
        />
      ))}
    </section>
  );
}

type DashboardMetricsProps = {
  stats: DashboardStats;
  isDarkMode: boolean;
};

function MetricCard({
  label,
  value,
  icon,
  background,
  textColor,
  isDarkMode,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  background: string;
  textColor: string;
  isDarkMode: boolean;
}) {
  return (
    <div
      className="theme-transition rounded-lg border p-4 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        borderColor: "var(--border-soft)",
        background,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-[0.02em]" style={{ color: textColor }}>
            {label}
          </p>
          <p className="mt-4 text-4xl font-black leading-none" style={{ color: textColor }}>
            {value}
          </p>
        </div>
        <div
          className="flex h-16 w-16 items-center justify-center rounded-sm border"
          style={{
            color: textColor,
            borderColor: "rgba(17,24,39,0.18)",
            backgroundColor: "transparent",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
