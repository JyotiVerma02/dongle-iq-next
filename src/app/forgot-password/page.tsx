"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Send } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  const colors = getThemePalette(isDarkMode);
  const premiumGradient =
    "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))";

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
    } catch {
      setMessage("System handshake error occurred");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page-shell theme-transition fixed inset-0 w-full overflow-x-hidden overflow-y-auto bg-transparent font-sans antialiased tracking-tight text-base" style={{ color: colors.text }}>
      <div className="relative z-10 flex min-h-dvh w-full items-start justify-center px-4 py-6 sm:items-center sm:px-6 sm:py-8 lg:py-0">
        
        {/* ULTRA-WIDE FIX: Content Container */}
        <div className="content-container flex w-full flex-col items-center justify-center lg:flex-row lg:gap-10 xl:gap-20">
          
          {/* ASIDE SECTION */}
          <div className="hidden lg:flex lg:w-full lg:max-w-[32rem] lg:flex-col lg:justify-center lg:pr-12 xl:max-w-[34rem] xl:pr-24" style={{ borderRight: `1px solid ${colors.borderSoft}` }}>
            <div className="animate-[fadeInLeft_0.8s_ease-out]">
              <h1 className="mb-8 text-5xl font-black uppercase leading-[0.9] tracking-tight xl:text-6xl whitespace-nowrap" style={{ color: colors.text }}>
                Reset <span className="text-gradient-brand">Password</span>
              </h1>
              <p className="text-lg max-w-lg leading-relaxed font-medium mb-12 opacity-70" style={{ color: colors.muted }}>
                Enter your email and we will send a reset link.
              </p>
              <div className="grid max-w-xl grid-cols-2 gap-4">
                {[{ value: "Secure", label: "Recovery flow" }, { value: "Instant", label: "Mail dispatch" }].map((item, index) => (
                  <div key={item.label} className={`auth-aside-card rounded-2xl p-5 ${index === 0 ? "float-slow" : "float-delay"}`} style={{ borderColor: colors.borderSoft, backgroundColor: colors.card }}>
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg text-white" style={{ background: premiumGradient }}>
                      <ShieldCheck size={18} />
                    </div>
                    <p className="text-xl font-black uppercase">{item.value}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: colors.muted }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FORM SECTION */}
          <div className="flex w-full max-w-md items-start justify-center px-0 pt-2 sm:items-center lg:px-0">
            <div className="group relative w-full max-w-[32rem] animate-[fadeIn_1.2s_ease-out]">
              <div className="absolute inset-[-1.5px] rounded-lg opacity-35 blur-sm transition-opacity duration-500 group-hover:opacity-80" style={{ background: premiumGradient }} />
              <div className="auth-card relative w-full p-5 shadow-2xl sm:p-8" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>
                    Reset <span className="text-gradient-cool">Password</span>
                  </h2>
                  <p className="mt-2 text-[9px] font-black uppercase tracking-[0.5em] opacity-50" style={{ color: colors.muted }}>Email required</p>
                </div>

                {message && (
                  <div className={`mb-4 py-2 border text-[10px] font-black uppercase tracking-widest text-center rounded-lg ${message.toLowerCase().includes("sent") ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : "bg-red-500/10 border-red-500/20 text-red-500"}`}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70" style={{ color: colors.muted }}>Email address</label>
                    <div className="relative">
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} placeholder="agent@dongleiq.com"
                      className="glass-input w-full rounded-lg border py-3.5 pl-10 pr-4 text-sm font-semibold outline-none"
                        style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }} />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.muted }} size={16} />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="theme-primary-btn w-full py-3.5 rounded-lg font-black uppercase text-[11px] tracking-[0.3em] text-white shadow-2xl transition-all duration-500 flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? "Sending..." : "Send reset link"} <Send size={16} />
                  </button>

                  <div className="text-center pt-3">
                    <Link href="/login" className="text-[10px] font-semibold uppercase tracking-[0.2em] underline underline-offset-4" style={{ color: colors.muted }}>Back to sign in</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
