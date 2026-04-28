"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Send } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

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
    <div className="auth-page-shell theme-transition  relative overflow-hidden bg-transparent font-sans antialiased tracking-tight" style={{ color: colors.text }}>
      <div className="relative z-10 flex  w-full app-page-min-height">
        <div className="hidden lg:flex lg:min-w-0 lg:flex-[1.05] lg:flex-col lg:justify-center lg:px-12 xl:px-24" style={{ borderRight: `1px solid ${colors.borderSoft}` }}>
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="mb-8 text-5xl font-black uppercase leading-[0.9] tracking-tight xl:text-6xl" style={{ color: colors.text }}>
              Account <br />
              <span style={{ color: colors.accent }}>Recovery</span>
            </h1>
            <p className="text-lg max-w-lg leading-relaxed font-medium mb-12 opacity-70" style={{ color: colors.muted }}>
              Reset your password securely and continue managing your digital signature 
              applications through the Dongle IQ encrypted portal.
            </p>
            <div className="grid max-w-xl grid-cols-2 gap-4">
              {[
                { value: "Secure", label: "Recovery flow" },
                { value: "Instant", label: "Mail dispatch" },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`auth-aside-card rounded-2xl p-5 ${index === 0 ? "float-slow" : "float-delay"}`}
                  style={{ borderColor: colors.borderSoft, backgroundColor: colors.card }}
                >
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

        <div className="flex flex-1 items-start justify-center px-4 pb-8 pt-4 sm:px-6 lg:flex-[0.95] lg:items-center lg:px-8">
          <div className="relative group w-full max-w-md animate-[fadeIn_1.2s_ease-out]">
            <div className="absolute -inset-[1.5px] rounded-lg opacity-35 blur-sm transition-opacity duration-500 group-hover:opacity-80" style={{ background: premiumGradient }} />

            <div
              className="auth-card relative w-full p-6 sm:p-8"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>
                  Forgot Access?
                </h2>
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.5em] opacity-50" style={{ color: colors.muted }}>
                  Verification Required
                </p>
              </div>

              {message && (
                <div
                  className={`mb-4 py-2 border text-[10px] font-black uppercase tracking-widest text-center rounded-lg ${
                    message.toLowerCase().includes("sent") ||
                    message.toLowerCase().includes("successful")
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-500"
                  }`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70" style={{ color: colors.muted }}>
                    Registered Email
                  </label>

                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      placeholder="agent@dongleiq.com"
                      className="glass-input w-full rounded-lg border py-3.5 pl-10 pr-4 text-sm lowercase font-semibold outline-none"
                      style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.muted }} size={16} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="theme-primary-btn w-full py-3.5 rounded-lg font-black uppercase text-[11px] tracking-[0.3em] text-white shadow-2xl hover:brightness-125 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Send Reset Link"} <Send size={16} />
                </button>

                <div className="text-center pt-3">
                  <Link
                    href="/login"
                    className="text-[10px] font-semibold uppercase tracking-[0.2em] underline underline-offset-4"
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
        @keyframes fadeInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
