/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Cpu, ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, Sun, Moon 
} from "lucide-react";

// --- THEME IMPORTS ---

import { getThemeConfig } from "@/app/utils/themeConfig";

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

  // --- GLOBAL THEME LOGIC ---

  const theme = getThemeConfig(false);

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
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans relative overflow-hidden transition-colors duration-300`}>
      
      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 p-6 ${theme.nav} backdrop-blur-md border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className={`w-8 h-8 ${theme.accent} rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20`}>
              <Cpu size={18} className="text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">
              Dongle<span className="text-purple-500">IQ</span>
            </span>
          </Link>

          {/* Theme Toggle Button */}
        
        </div>
      </nav>

      <div className="flex pt-24 min-h-screen">
        {/* LEFT PANEL */}
        <div className={`hidden md:flex w-3/5 relative overflow-hidden border-r ${theme.border}`}>
          {/* Animated Glow Background */}
          <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 p-16 flex flex-col justify-center h-full">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[0.85] tracking-tighter uppercase">
              Update <br /> 
              <span className="text-emerald-400 italic">Credentials</span> <br />
              <span className="text-slate-200">Securely.</span>
            </h1>
            <p className={`${theme.textMuted} text-lg max-w-xl leading-relaxed font-medium mb-8`}>
              Create a strong, unique password to ensure your agent profile remains
              protected. We recommend a mix of symbols, numbers, and capital letters.
            </p>
            <div className="flex items-center gap-3 opacity-40">
               <ShieldCheck size={20} className="text-purple-500" />
               <span className="text-xs font-black uppercase tracking-[0.3em]">Strong Encryption Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - RESET CARD */}
        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />

          <div className={`${theme.card} p-8 rounded-4xl shadow-2xl w-full max-w-100 border ${theme.border} relative overflow-hidden`}>
            {/* Top Gradient Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />

            <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter italic">New Password</h2>
            <p className={`${theme.textMuted} text-[10px] mb-8 uppercase tracking-widest font-bold`}>Finalize your recovery</p>

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
                <label className="block text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] ml-1">
                  New Access Key
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full p-4 pl-12 rounded-xl ${theme.inputBg} border ${theme.border} ${theme.text} focus:outline-none focus:border-purple-500 transition-all text-sm`}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-500 transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] ml-1">
                  Confirm Access Key
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full p-4 pl-12 rounded-xl ${theme.inputBg} border ${theme.border} ${theme.text} focus:outline-none focus:border-purple-500 transition-all text-sm`}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-500 transition-colors">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${theme.accent} w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] text-white shadow-lg shadow-purple-600/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50`}
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