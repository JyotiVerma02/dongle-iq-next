"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Cpu, ShieldCheck, Eye, EyeOff 
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
  const premiumGradient = isDarkMode
    ? "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))"
    : "linear-gradient(135deg, #2563eb, #0ea5e9)";

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
    } catch {
      setMessage("System handshake error occurred");
    } finally {
      setLoading(false);
    }
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
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:rotate-360"
              style={{ backgroundColor: colors.accent, boxShadow: `0 0 20px ${colors.accent}44` }}
            >
              <Cpu size={20} className="text-white" />
            </div>
            <span className="font-black text-xl uppercase tracking-tighter" style={{ color: colors.text }}>
              Dongle<span style={{ color: colors.accentLight }}>IQ</span>
            </span>
          </Link>
          <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: colors.muted }}>
            Back to Login
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex pt-20 min-h-screen">
        <div className="hidden lg:flex w-[55%] flex-col justify-center px-24" style={{ borderRight: `1px solid ${colors.borderSoft}` }}>
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <div
              className="mb-8 inline-flex rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em]"
              style={{ borderColor: colors.borderSoft, backgroundColor: colors.card, color: colors.accentLight }}
            >
              Premium Reset
            </div>
            <h1 className="text-7xl xl:text-7xl font-black mb-8 leading-[0.8] tracking-tighter uppercase" style={{ color: colors.text }}>
              Update <br /> 
              <span className="gradient-text">Credentials</span>
            </h1>
            <p className="text-lg max-w-lg leading-relaxed font-medium mb-12 opacity-70" style={{ color: colors.muted }}>
              Finalize your account recovery by establishing a new high-entropy access key. 
              Ensure your profile remains protected within the Dongle IQ infrastructure.
            </p>
            <div className="grid max-w-xl grid-cols-2 gap-4">
              {[
                { value: "Protected", label: "Credential update" },
                { value: "Clean", label: "Access refresh" },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`rounded-[1.5rem] border p-5 ${index === 0 ? "float-slow" : "float-delay"}`}
                  style={{ borderColor: colors.borderSoft, backgroundColor: colors.card }}
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl text-white" style={{ background: premiumGradient }}>
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
            <div className="absolute -inset-[1.5px] rounded-[34px] opacity-35 blur-sm transition-opacity duration-500 group-hover:opacity-80" style={{ background: premiumGradient }} />

            <div
              className="relative p-8 rounded-[34px] backdrop-blur-2xl w-full border shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>
                  New Access
                </h2>
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.4em] opacity-50" style={{ color: colors.muted }}>
                  Protocol Recovery
                </p>
              </div>

              {message && (
                <div className={`mb-4 py-2 text-[10px] text-center rounded-lg ${
                  message.toLowerCase().includes("success")
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New Password"
                    className="glass-input w-full rounded-2xl border px-4 py-3.5 pr-10 text-sm font-semibold outline-none"
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

                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="glass-input w-full rounded-2xl border px-4 py-3.5 pr-10 text-sm font-semibold outline-none"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="theme-primary-btn w-full py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all"
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
      `}</style>
    </div>
  );
}
