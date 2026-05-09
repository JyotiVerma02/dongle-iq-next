"use client";

import { useState } from "react";
import { Search, FileText, IndianRupee, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ActionCards() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleTrack = async () => {
    setLoading("track");
    try {
      const res = await fetch("/api/track-dsc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: "9999999999" }), // replace dynamically
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      toast.success(`Status: ${data.status}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleClaim = async () => {
    setLoading("claim");
    try {
      const res = await fetch("/api/claim-mtokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "123" }), // replace with real user
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      toast.success(data.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleApply = async () => {
    setLoading("apply");
    try {
      const res = await fetch("/api/apply-dsc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test User",
          email: "test@mail.com",
          number: "9999999999",
          password: "123456",
        }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      toast.success(data.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* Track DSC */}
      <Card
        icon={<Search />}
        title="Track DSC"
        desc="View the current status of your Digital Signature Certificate."
        button="Track DSC"
        onClick={handleTrack}
        loading={loading === "track"}
      />

      {/* Claim Tokens */}
      <Card
        icon={<IndianRupee />}
        title="Claim mTokens"
        desc="Rs315 (385-70 Cash Back scheme benefits for limited period)"
        button="Claim Now"
        onClick={handleClaim}
        highlight
        loading={loading === "claim"}
      />

      {/* Apply DSC */}
      <Card
        icon={<FileText />}
        title="Apply DSC"
        desc="Register & apply for a new Digital Signature Certificate."
        button="Apply Now"
        onClick={handleApply}
        loading={loading === "apply"}
      />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Card({ icon, title, desc, button, onClick, highlight, loading }: any) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-md transition hover:shadow-xl ${
        highlight
          ? "bg-[linear-gradient(135deg,var(--accent),var(--accent-light),var(--accent-secondary))] text-white"
          : "bg-white dark:bg-slate-900"
      }`}
    >
      <div className="mb-3">{icon}</div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm mt-2 opacity-80">{desc}</p>

      <button
        onClick={onClick}
        disabled={loading}
        className="mt-4 rounded-lg bg-[linear-gradient(135deg,var(--accent),var(--accent-light))] px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? <Loader2 className="animate-spin" /> : button}
      </button>
    </div>
  );
}
