/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Cpu, ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, RefreshCw 
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

  const colors = {
    bg: "transparent", 
    card: "rgba(20, 20, 20, 0.4)", 
    accent: "#7C3AED",
    accentLight: "#A78BFA",
    text: "#F9FAFB",
    muted: "#9CA3AF",
    border: "rgba(124, 58, 237, 0.2)"
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
      setMessage("System handshake error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans antialiased tracking-tight relative overflow-hidden bg-transparent">
      
      {/* --- NAVBAR --- */}
      <nav 
        className="fixed top-0 w-full z-50 p-5 backdrop-blur-xl border-b animate-[slideDown_0.6s_ease-out]"
        style={{ backgroundColor: `rgba(5, 5, 5, 0.7)`, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:rotate-[360deg]"
              style={{ backgroundColor: colors.accent, boxShadow: `0 0 20px ${colors.accent}44` }}
            >
              <Cpu size={20} className="text-white" />
            </div>
            <span className="font-black text-xl italic uppercase tracking-tighter text-white">
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
        <div className="hidden lg:flex w-[55%] flex-col justify-center px-24 border-r border-white/5">
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="text-7xl xl:text-7xl font-black mb-8 leading-[0.8] tracking-tighter uppercase italic text-white">
              Update <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-300 to-white animate-gradient">Credentials</span>
            </h1>
            <p className="text-lg max-w-lg leading-relaxed font-medium mb-12 opacity-70" style={{ color: colors.muted }}>
              Finalize your account recovery by establishing a new high-entropy access key. 
              Ensure your profile remains protected within the Dongle IQ infrastructure.
            </p>
            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 w-fit group hover:border-purple-500/30 transition-all">
               <ShieldCheck size={24} className="text-purple-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">End-to-End Encryption Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - RESET CARD */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="relative group animate-[fadeIn_1.2s_ease-out] w-full max-w-md">
            {/* Animated Glow Border */}
            <div className="absolute -inset-[1.5px] bg-gradient-to-r from-purple-600 via-transparent to-purple-600 rounded-[32px] opacity-30 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
            
            <div 
              className="relative p-12 rounded-[30px] backdrop-blur-2xl w-full border shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              {/* Dynamic Inner Light */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50" />

              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">New Access</h2>
                <p className="text-[10px] uppercase tracking-[0.5em] font-black mt-3 opacity-50 text-white">Protocol Recovery Phase</p>
              </div>

              {message && (
                <div className={`mb-8 py-3 border text-[10px] font-black uppercase tracking-widest text-center rounded-xl flex items-center justify-center gap-2 ${
                  message.toLowerCase().includes("success") 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}>
                  {message.toLowerCase().includes("success") && <CheckCircle2 size={14} />}
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 group/input">
                  <label className="block font-black text-[10px] uppercase tracking-widest ml-1 opacity-50 group-focus-within/input:text-purple-400 transition-colors text-white">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-5 pl-14 rounded-2xl bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all duration-300 text-sm font-medium focus:ring-4 focus:ring-purple-500/10 text-white"
                    />
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 transition-colors">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 group/input">
                  <label className="block font-black text-[10px] uppercase tracking-widest ml-1 opacity-50 group-focus-within/input:text-purple-400 transition-colors text-white">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-5 pl-14 rounded-2xl bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all duration-300 text-sm font-medium focus:ring-4 focus:ring-purple-500/10 text-white"
                    />
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 transition-colors">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 rounded-2xl font-black uppercase text-[12px] tracking-[0.3em] text-white shadow-2xl hover:brightness-125 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50"
                  style={{ backgroundColor: colors.accent, boxShadow: `0 15px 35px -10px ${colors.accent}aa` }}
                >
                  {loading ? "Re-Encrypting..." : "Reset Password"} <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
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