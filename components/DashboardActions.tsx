/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Search, IndianRupee, FileText, Loader2 } from "lucide-react";

export default function DashboardActions({ userId }: { userId?: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  // 🔍 Track DSC
  const handleTrack = async () => {
    setLoading("track");
    try {
      const res = await fetch("/api/track-dsc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: "9876543210" }), // 🔴 replace later
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      toast.success(`Status: ${data.status}`);
    } catch (err) {
      toast.error("Failed to track DSC");
    } finally {
      setLoading(null);
    }
  };

  // 💰 Claim mTokens
  const handleClaim = async () => {
    setLoading("claim");
    try {
      const res = await fetch("/api/claim-mtokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      toast.success(data.message);
    } catch {
      toast.error("Claim failed");
    } finally {
      setLoading(null);
    }
  };

  // 📄 Apply DSC
  const handleApply = async () => {
    setLoading("apply");
    try {
      const res = await fetch("/api/apply-dsc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "test@mail.com",
          number: "9876543210",
          password: "123456",
        }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      toast.success(data.message);
    } catch {
      toast.error("Apply failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="grid gap-4 md:grid-cols-3 mt-4">
      {/* Track DSC */}
      <div className="rounded-2xl border p-5 shadow-sm hover:shadow-lg transition">
        <div className="flex items-center gap-3">
          <Search />
          <h3 className="font-semibold">Track DSC</h3>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          View the current status of your Digital Signature Certificate.
        </p>

        <button
          onClick={handleTrack}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"
        >
          {loading === "track" && <Loader2 className="animate-spin" size={14} />}
          Track DSC
        </button>
      </div>

      {/* Claim mTokens */}
      <div className="rounded-2xl p-5 text-white bg-linear-to-r from-blue-500 to-blue-600 shadow-sm hover:shadow-lg transition">
        <div className="flex items-center gap-3">
          <IndianRupee />
          <h3 className="font-semibold">Claim mTokens</h3>
        </div>

        <p className="mt-2 text-sm">
          Rs315 (385-70 Cash Back scheme benefits for limited period)
        </p>

        <button
          onClick={handleClaim}
          className="mt-4 px-4 py-2 bg-white text-blue-600 rounded-lg flex items-center gap-2"
        >
          {loading === "claim" && <Loader2 className="animate-spin" size={14} />}
          Claim Now
        </button>
      </div>

      {/* Apply DSC */}
      <div className="rounded-2xl border p-5 shadow-sm hover:shadow-lg transition">
        <div className="flex items-center gap-3">
          <FileText />
          <h3 className="font-semibold">Apply DSC</h3>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          Register & apply for a new Digital Signature Certificate.
        </p>

        <button
          onClick={handleApply}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2"
        >
          {loading === "apply" && <Loader2 className="animate-spin" size={14} />}
          Apply Now
        </button>
      </div>
    </section>
  );
}