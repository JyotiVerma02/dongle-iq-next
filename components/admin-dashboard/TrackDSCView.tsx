"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import toast from "react-hot-toast";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function TrackDSCView() {
  const [pid, setPid] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const handleTrack = async () => {
    if (!pid.trim()) {
      toast.error("Enter PID");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/track-dsc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ number: pid.trim() }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Failed to fetch status");
        return;
      }

      setStatus(data.status || "pending");
      setIsResultOpen(true);
    } catch {
      toast.error("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isApproved = status?.toLowerCase() === "approved";

  return (
    <div className="mt-6 flex justify-center px-4 sm:mt-10">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border shadow-[0_22px_60px_-42px_rgba(15,23,42,0.35)]"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: isDarkMode ? colors.panelStrong : colors.card,
        }}
      >
        <div
          className="border-b px-5 py-3 text-sm font-black uppercase tracking-[0.18em]"
          style={{
            borderColor: colors.borderSoft,
            backgroundColor: colors.panel,
            color: colors.text,
          }}
        >
          Track DSC Status
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <label
              className="block text-[11px] font-black uppercase tracking-[0.22em] sm:mb-0 sm:min-w-[72px]"
              style={{ color: colors.subtleText }}
            >
              PID
            </label>

            <input
              type="text"
              value={pid}
              onChange={(e) => setPid(e.target.value)}
              placeholder="Enter Person ID"
              className="glass-input theme-transition w-full rounded-xl border px-4 py-3 text-sm font-semibold outline-none"
              style={{
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
              }}
            />
          </div>

          <button
            onClick={handleTrack}
            disabled={loading}
            className="theme-primary-btn theme-transition inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:opacity-70"
          >
            <Search size={18} />
            {loading ? "Tracking..." : "Track DSC"}
          </button>
        </div>
      </div>

      {isResultOpen && status ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(2, 6, 23, 0.55)" }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: isDarkMode ? colors.panelStrong : colors.card,
            }}
          >
            <div
              className="flex items-center justify-between border-b px-6 py-4"
              style={{ borderColor: colors.borderSoft }}
            >
              <h2 className="text-base font-black uppercase tracking-tight" style={{ color: colors.text }}>
                DSC Status
              </h2>
              <button
                type="button"
                onClick={() => setIsResultOpen(false)}
                className="rounded-full p-2 transition"
                style={{ color: colors.muted }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-8 text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: colors.muted }}>
                Status for PID
              </p>
              <p className="mt-2 break-all text-sm font-semibold" style={{ color: colors.text }}>
                {pid}
              </p>

              <div className="mt-6 flex justify-center">
                <span
                  className="rounded-full px-5 py-2 text-xs font-black uppercase tracking-[0.18em]"
                  style={{
                    backgroundColor: isApproved ? "rgba(34,197,94,0.14)" : "rgba(245,158,11,0.18)",
                    color: isApproved ? "#16a34a" : "#d97706",
                    border: `1px solid ${
                      isApproved ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.3)"
                    }`,
                  }}
                >
                  {status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
