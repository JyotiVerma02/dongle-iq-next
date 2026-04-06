/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Cpu, ShieldCheck, Lock, Eye, EyeOff, CheckCircle2 
} from "lucide-react";

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

  // Configuration based on your specific hex codes
  const colors = {
    bg: "#0F0F0F",
    card: "#1A1A1A",
    accent: "#7C3AED",
    accentLight: "#A78BFA",
    text: "#F9FAFB",
    muted: "#9CA3AF",
    border: "rgba(255,255,255,0.05)"
  };

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
      setMessage("Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen font-sans relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      
      {/* --- NAVBAR --- */}
      <nav 
        className="fixed top-0 w-full z-50 p-6 backdrop-blur-md border-b"
        style={{ backgroundColor: `${colors.bg}CC`, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
              style={{ backgroundColor: colors.accent, boxShadow: `0 10px 15px -3px ${colors.accent}33` }}
            >
              <Cpu size={18} className="text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">
              Dongle<span style={{ color: colors.accentLight }}>IQ</span>
            </span>
          </Link>
        </div>
      </nav>

      <div className="flex pt-24 min-h-screen">
        {/* LEFT PANEL */}
        <div 
          className="hidden md:flex w-3/5 relative overflow-hidden border-r"
          style={{ borderColor: colors.border }}
        >
          <div 
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-10"
            style={{ backgroundColor: colors.accent }}
          />
          
          <div className="relative z-10 p-16 flex flex-col justify-center h-full">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[0.85] tracking-tighter uppercase">
              Update <br /> 
              <span style={{ color: colors.accent }}>Credentials</span> <br />
              <span className="text-slate-200">Securely.</span>
            </h1>
            <p className="text-lg max-w-xl leading-relaxed font-medium mb-8" style={{ color: colors.muted }}>
              Create a strong, unique password to ensure your agent profile remains
              protected. We recommend a mix of symbols, numbers, and capital letters.
            </p>
            <div className="flex items-center gap-3 opacity-40">
               <ShieldCheck size={20} style={{ color: colors.accent }} />
               <span className="text-xs font-black uppercase tracking-[0.3em]">Strong Encryption Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - RESET CARD */}
        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div 
            className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-5"
            style={{ backgroundColor: colors.accent }}
          />

          <div 
            className="p-8 rounded-[20px] shadow-2xl w-full max-w-md border relative overflow-hidden"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            {/* Top Gradient Accent */}
            <div 
              className="absolute top-0 left-0 w-full h-1 opacity-30" 
              style={{ background: `linear-gradient(to right, transparent, ${colors.accent}, transparent)` }}
            />

            <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter">New Password</h2>
            <p className="text-[10px] mb-8 uppercase tracking-widest font-bold" style={{ color: colors.muted }}>Finalize your recovery</p>

            {message && (
              <div className={`mb-6 py-3 border text-[10px] font-black uppercase tracking-widest text-center rounded-xl flex items-center justify-center gap-2 ${
                message.toLowerCase().includes("success") 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {message.toLowerCase().includes("success") && <CheckCircle2 size={14} />}
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block font-black text-[9px] uppercase tracking-[0.2em] ml-1" style={{ color: colors.muted }}>
                  New Access Key
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-4 pl-12 rounded-xl border focus:outline-none transition-all text-sm font-medium"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: colors.muted }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors" style={{ color: colors.muted }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-black text-[9px] uppercase tracking-[0.2em] ml-1" style={{ color: colors.muted }}>
                  Confirm Access Key
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-4 pl-12 rounded-xl border focus:outline-none transition-all text-sm font-medium"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={16} style={{ color: colors.muted }} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors" style={{ color: colors.muted }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] text-white shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: colors.accent, boxShadow: `0 15px 20px -5px ${colors.accent}33` }}
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}