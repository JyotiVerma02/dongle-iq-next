/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Cpu, LogIn, ShieldCheck, UserPlus, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const colors = {
    bg: "#050505",
    card: "rgba(20, 20, 20, 0.4)", // Ultra-translucent for glassmorphism
    accent: "#7C3AED",
    accentLight: "#A78BFA",
    text: "#F9FAFB",
    muted: "#9CA3AF",
    border: "rgba(124, 58, 237, 0.2)", // Purple-tinted border
  };

  const navLinks = ["Apply", "Why Us", "Agents", "FAQs", "Contact"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Credentials required to initialize session.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Authentication failed");
        setLoading(false);
        return;
      }
      data.role === "admin"
        ? router.push("/admin/dashboard")
        : router.push("/user/dashboard");
    } catch (err) {
      setError("System handshake error occurred");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen font-sans antialiased tracking-tight relative overflow-hidden bg-transparent"
      style={{ color: colors.text }}
    >
      {/* --- PAGE CONTENT --- */}
      <div className="relative z-10 flex pt-20 min-h-screen">
        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-[55%] flex-col justify-center px-24 border-r border-white/5">
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="text-7xl xl:text-7xl font-black mb-8 leading-[0.8] tracking-tighter uppercase ">
              Secure
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-300 to-white animate-gradient">
                {" "}
                Access
              </span>
            </h1>
            <p
              className="text-lg max-w-lg leading-relaxed font-medium mb-12 opacity-70"
              style={{ color: colors.muted }}
            >
              Enter your credentials to manage your Digital Signature
              Certificates and IRCTC Agent registrations in our unified
              dashboard.
            </p>
            <div className="flex items-center gap-4 px-6 py-3 rounded-lg bg-white/5 border border-white/5 w-fit group hover:border-purple-500/30 transition-all">
              <ShieldCheck
                size={24}
                className="text-purple-500 animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Military-Grade Encryption Active
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - PURPLE GLASSMORPHISM */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative group animate-[fadeIn_1.2s_ease-out]">
            {/* Glow Border (same) */}
            <div className="absolute -inset-[1.5px] bg-gradient-to-r from-purple-600 via-transparent to-purple-600 rounded-[30px] opacity-30 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

            <div
              className="relative p-6 rounded-[30px] backdrop-blur-2xl w-full max-w-sm border shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              {/* Top line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50" />

              {/* Heading */}
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-black  uppercase tracking-tighter">
                  Welcome Back
                </h2>
                <p className="text-[9px] uppercase tracking-[0.5em] font-black mt-2 opacity-50">
                  Identity Verification
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center rounded-xl">
                  {error}
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest opacity-50">
                    Email / Mobile
                  </label>

                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@dongleiq.com"
                    className="w-full p-3 rounded-lg text-sm bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none focus:ring-2 focus:ring-purple-500/10"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest opacity-50">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-3 rounded-lg text-sm bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none focus:ring-2 focus:ring-purple-500/10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
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
                  {loading ? "Processing..." : "Login"} <LogIn size={16} />
                </button>

                {/* Forgot */}
                <div className="text-center pt-3">
                  <Link href="/forgot-password">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 hover:text-purple-400 cursor-pointer underline underline-offset-4">
                      Forgot Password?
                    </span>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeInLeft {
          from {
            transform: translateX(-50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
