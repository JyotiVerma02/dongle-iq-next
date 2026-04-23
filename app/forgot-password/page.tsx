"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Cpu, ShieldCheck, Mail, Send
} from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  const colors = getThemePalette(isDarkMode);
  const premiumGradient = isDarkMode
    ? "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))"
    : "linear-gradient(135deg, #2563eb, #0ea5e9)";

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
    <div className="theme-transition hero-grid relative min-h-screen overflow-hidden bg-transparent font-sans antialiased tracking-tight" style={{ color: colors.text }}>
      <div className="hero-glow left-8 top-24 h-56 w-56" style={{ backgroundColor: colors.accent }} />
      <div className="hero-glow right-12 top-28 h-72 w-72" style={{ backgroundColor: "var(--accent-secondary)" }} />

      <nav 
        className="fixed top-0 w-full z-50 p-5 backdrop-blur-xl border-b animate-[slideDown_0.6s_ease-out]"
        style={{ backgroundColor: colors.overlay, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-all duration-500 group-hover:rotate-360"
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

      <div className="relative z-10 flex min-h-screen pt-[4.5rem]">
        <div className="hidden lg:flex w-[55%] flex-col justify-center px-24" style={{ borderRight: `1px solid ${colors.borderSoft}` }}>
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="text-6xl xl:text-6xl font-black mb-8 leading-[0.9] tracking-tight uppercase" style={{ color: colors.text }}>
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
                  className={`rounded-lg border p-5 ${index === 0 ? "float-slow" : "float-delay"}`}
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

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative group animate-[fadeIn_1.2s_ease-out] w-full max-w-sm">
            <div className="absolute -inset-[1.5px] rounded-lg opacity-35 blur-sm transition-opacity duration-500 group-hover:opacity-80" style={{ background: premiumGradient }} />

            <div
              className="relative p-8 rounded-lg backdrop-blur-2xl w-full border shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
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
                  <label className="text-[9px] uppercase tracking-widest opacity-50" style={{ color: colors.muted }}>
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
      `}</style>
    </div>
  );
}
