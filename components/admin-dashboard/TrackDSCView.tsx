"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import toast from "react-hot-toast";

export default function TrackDSCView() {
  const [pid, setPid] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

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
      <div className="w-full max-w-3xl overflow-hidden rounded-md border border-white/10 bg-[#111b2e] shadow-[0_28px_80px_-40px_rgba(15,23,42,0.9)]">
        <div className="bg-blue-600 px-6 py-4 text-lg font-semibold text-white">
          Track DSC Status
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <label className="block text-sm font-medium text-white/80 sm:mb-0 sm:min-w-[72px]">
              PID
            </label>

            <input
              type="text"
              value={pid}
              onChange={(e) => setPid(e.target.value)}
              placeholder="Enter Person ID"
              className="w-full rounded-md border border-white/15 bg-white/8 px-4 py-2 text-white outline-none transition placeholder:text-white/35 focus:border-blue-900"
            />
          </div>

          <button
            onClick={handleTrack}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-medium text-white transition disabled:opacity-70"
            style={{
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              boxShadow: "0 18px 35px -20px rgba(22,163,74,0.8)",
            }}
          >
            <Search size={18} />
            {loading ? "Tracking..." : "Track DSC"}
          </button>
        </div>
      </div>

      {isResultOpen && status ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-md bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                DSC Status
              </h2>
              <button
                type="button"
                onClick={() => setIsResultOpen(false)}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-8 text-center">
              <p className="text-sm text-slate-500">Status for PID</p>
              <p className="mt-2 break-all text-base font-medium text-slate-900">
                {pid}
              </p>

              <div className="mt-6 flex justify-center">
                <span
                  className="rounded-full px-5 py-2 text-sm font-semibold"
                  style={{
                    backgroundColor: isApproved ? "#dcfce7" : "#fef3c7",
                    color: isApproved ? "#166534" : "#92400e",
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
