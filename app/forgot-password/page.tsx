/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Cpu, ShieldCheck, Mail, ArrowLeft, Send
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  const colors = getThemePalette(isDarkMode);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    if (!email) {
      setMessage("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("System handshake error occurred");
    }
    setLoading(false);
  };

  return (
    <div className="theme-transition relative min-h-screen overflow-hidden bg-transparent font-sans antialiased tracking-tight" style={{ color: colors.text }}>
      
      {/* --- NAVBAR (Consistent with Login) --- */}
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
            <span className="font-black text-xl  uppercase tracking-tighter" style={{ color: colors.text }}>
              Dongle<span style={{ color: colors.accentLight }}>IQ</span>
            </span>
          </Link>
          <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] transition-colors" style={{ color: colors.muted }}>
             Back to Login
          </Link>
        </div>
      </nav>

      {/* --- PAGE CONTENT --- */}
      <div className="relative z-10 flex pt-20 min-h-screen">
        
        {/* LEFT PANEL (Apply Login page text style) */}
        <div className="hidden lg:flex w-[55%] flex-col justify-center px-24" style={{ borderRight: `1px solid ${colors.borderSoft}` }}>
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="text-7xl xl:text-7xl font-black mb-8 leading-[0.8] tracking-tighter uppercase" style={{ color: colors.text }}>
              Account <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-300 to-white animate-gradient">Recovery</span>
            </h1>
            <p className="text-lg max-w-lg leading-relaxed font-medium mb-12 opacity-70" style={{ color: colors.muted }}>
              Reset your password securely and continue managing your digital signature 
              applications through the Dongle IQ encrypted portal.
            </p>
            <div className="flex items-center gap-4 px-6 py-3 rounded-lg w-fit group transition-all" style={{ backgroundColor: colors.panel, border: `1px solid ${colors.borderSoft}` }}>
               <ShieldCheck size={24} className="animate-pulse" style={{ color: colors.accent }} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: colors.text }}>Secure Recovery Protocol Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - FORM CARD (Glassmorphism) */}
     <div className="flex-1 flex items-center justify-center p-6">
  <div className="relative group animate-[fadeIn_1.2s_ease-out] w-full max-w-sm">

    {/* Glow Border */}
    <div className="absolute -inset-[1.5px] bg-gradient-to-r from-purple-600 via-transparent to-purple-600 rounded-[30px] opacity-30 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

    <div
      className="relative p-6 rounded-[30px] backdrop-blur-2xl w-full border shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      {/* Top Glow Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50" />

      {/* Heading */}
      <div className="mb-6 text-center lg:text-left">
        <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>
          Forgot Access?
        </h2>
        <p className="mt-2 text-[9px] font-black uppercase tracking-[0.5em] opacity-50" style={{ color: colors.muted }}>
          Verification Required
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 py-2 border text-[10px] font-black uppercase tracking-widest text-center rounded-xl ${
            message.toLowerCase().includes("sent") ||
            message.toLowerCase().includes("successful")
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}
        >
          {message}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-widest opacity-50" style={{ color: colors.muted }}>
            Registered Email
          </label>

          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@dongleiq.com"
              className="w-full rounded-lg border p-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-purple-500/10"
              style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.muted }} size={16} />
          </div>
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-black uppercase text-[11px] tracking-[0.3em] text-white shadow-2xl hover:brightness-125 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 disabled:opacity-50"
          style={{
            backgroundColor: colors.accent,
            boxShadow: `0 15px 35px -10px ${colors.accent}aa`,
          }}
        >
          {loading ? "Processing..." : "Send Reset Link"} <Send size={16} />
        </button>

        {/* Back to login */}
        <div className="text-center pt-3">
          <Link
            href="/login"
            className="text-[9px] uppercase tracking-widest underline underline-offset-4"
            style={{ color: colors.muted }}
          >
            Back to Login
          </Link>
        </div>
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
