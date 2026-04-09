/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Cpu, ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, RefreshCw 
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const colors = getThemePalette(isDarkMode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Invalid or expired reset link");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setMessage("System handshake error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-transition relative min-h-screen overflow-hidden bg-transparent font-sans antialiased tracking-tight" style={{ color: colors.text }}>
      
      {/* --- NAVBAR --- */}
      <nav 
        className="fixed top-0 w-full z-50 p-5 backdrop-blur-xl border-b animate-[slideDown_0.6s_ease-out]"
        style={{ backgroundColor: colors.overlay, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:rotate-[360deg]"
              style={{ backgroundColor: colors.accent, boxShadow: `0 0 20px ${colors.accent}44` }}
            >
              <Cpu size={20} className="text-white" />
            </div>
            <span className="font-black text-xl uppercase tracking-tighter" style={{ color: colors.text }}>
              Dongle<span style={{ color: colors.accentLight }}>IQ</span>
            </span>
          </Link>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            Secure Node: Reset
          </div>
        </div>
      </nav>

      {/* --- PAGE CONTENT --- */}
      <div className="relative z-10 flex pt-20 min-h-screen">
        
        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-[55%] flex-col justify-center px-24" style={{ borderRight: `1px solid ${colors.borderSoft}` }}>
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="text-7xl xl:text-7xl font-black mb-8 leading-[0.8] tracking-tighter uppercase" style={{ color: colors.text }}>
              Update <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-300 to-white animate-gradient">Credentials</span>
            </h1>
            <p className="text-lg max-w-lg leading-relaxed font-medium mb-12 opacity-70" style={{ color: colors.muted }}>
              Finalize your account recovery by establishing a new high-entropy access key. 
              Ensure your profile remains protected within the Dongle IQ infrastructure.
            </p>
            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl w-fit group transition-all" style={{ backgroundColor: colors.panel, border: `1px solid ${colors.borderSoft}` }}>
               <ShieldCheck size={24} className="animate-pulse" style={{ color: colors.accent }} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: colors.text }}>End-to-End Encryption Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - RESET CARD */}
       <div className="flex-1 flex items-center justify-center p-6">
  <div className="relative group animate-[fadeIn_1.2s_ease-out] w-full max-w-sm">
    
    {/* Glow Border */}
    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600 via-transparent to-purple-600 rounded-xl opacity-30 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

    {/* CARD */}
    <div
      className="relative p-6 rounded-xl backdrop-blur-2xl w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      {/* Top Glow Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50" />

      {/* Heading */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>
          New Access
        </h2>
        <p className="mt-2 text-[9px] font-black uppercase tracking-[0.4em] opacity-50" style={{ color: colors.muted }}>
          Protocol Recovery
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 py-2 text-[10px] text-center rounded-lg ${
          message.toLowerCase().includes("success")
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-red-500/10 text-red-400"
        }`}>
          {message}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Password */}
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            className="w-full rounded-lg border p-2.5 text-xs outline-none"
            style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: colors.muted }}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full rounded-lg border p-2.5 text-xs outline-none"
            style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: colors.muted }}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all"
          style={{
            backgroundColor: colors.accent,
          }}
        >
          {loading ? "Processing..." : "Reset Password"}
        </button>
      </form>
    </div>
  </div>
</div>
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
