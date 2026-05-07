"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { ThemeProvider, useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const token = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") : null;
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const colors = getThemePalette(isDarkMode);
  const premiumGradient = "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!token) { setMessage("Invalid or expired reset link"); return; }
    if (!password || !confirmPassword) { setMessage("Please fill in both password fields"); return; }
    if (password.length < 6) { setMessage("Password must be at least 6 characters long"); return; }
    if (password !== confirmPassword) { setMessage("Passwords do not match"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      setMessage(data.message);
      if (res.ok) setTimeout(() => router.push("/login"), 2000);
    } catch {
      setMessage("System handshake error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-shell theme-transition relative overflow-hidden bg-transparent font-sans antialiased tracking-tight" style={{ color: colors.text }}>
      <div className="relative z-10 flex w-full app-page-min-height items-center justify-center">
        
        {/* ULTRA-WIDE FIX: Content Container */}
        <div className="content-container flex flex-col lg:flex-row items-center justify-center lg:gap-10 xl:gap-20">
          
          {/* ASIDE SECTION */}
          <div className="hidden lg:flex lg:flex-col lg:justify-center lg:w-full lg:max-w-[500px] lg:pr-12 xl:pr-24" style={{ borderRight: `1px solid ${colors.borderSoft}` }}>
            <div className="animate-[fadeInLeft_0.8s_ease-out]">
              <h1 className="mb-8 text-5xl font-black uppercase leading-[0.9] tracking-tight xl:text-6xl" style={{ color: colors.text }}>
                Update <br />
                <span style={{ color: colors.accent }}>Credentials</span>
              </h1>
              <p className="text-lg max-w-lg leading-relaxed font-medium mb-12 opacity-70" style={{ color: colors.muted }}>
                Finalize your account recovery by establishing a new high-entropy access key.
              </p>
              <div className="grid max-w-xl grid-cols-2 gap-4">
                {[{ value: "Protected", label: "Credential update" }, { value: "Clean", label: "Access refresh" }].map((item, index) => (
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
          <div className="flex w-full max-w-md items-center justify-center px-4 py-8 lg:px-0">
            <div className="relative group w-full animate-[fadeIn_1.2s_ease-out]">
              <div className="absolute inset-[-1.5px] rounded-lg opacity-35 blur-sm transition-opacity duration-500 group-hover:opacity-80" style={{ background: premiumGradient }} />
              <div className="auth-card relative w-full p-6 sm:p-8" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>New Access</h2>
                  <p className="mt-2 text-[9px] font-black uppercase tracking-[0.4em] opacity-50" style={{ color: colors.muted }}>Protocol Recovery</p>
                </div>

                {message && (
                  <div className={`mb-4 rounded-lg border px-3 py-2.5 text-center text-[11px] font-semibold ${message.toLowerCase().includes("success") ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-red-500/20 bg-red-500/10 text-red-400"}`}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" 
                      className="glass-input w-full rounded-lg border px-4 py-3.5 pr-10 text-sm font-semibold outline-none"
                      style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: colors.muted }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="relative">
                    <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password"
                      className="glass-input w-full rounded-lg border px-4 py-3.5 pr-10 text-sm font-semibold outline-none"
                      style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: colors.muted }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button type="submit" disabled={loading} className="theme-primary-btn w-full py-3.5 rounded-lg text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all">
                    {loading ? "Processing..." : "Reset Password"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}