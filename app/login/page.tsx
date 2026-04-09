"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  const colors = getThemePalette(isDarkMode);

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
      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch {
      setError("System handshake error occurred");
      setLoading(false);
    }
  };

  return (
    <div
      className="theme-transition relative min-h-screen overflow-hidden bg-transparent font-sans antialiased tracking-tight"
      style={{ color: colors.text }}
    >
      <div className="relative z-10 flex min-h-screen pt-20">
        <div className="hidden w-[55%] flex-col justify-center px-24 lg:flex" style={{ borderRight: `1px solid ${colors.borderSoft}` }}>
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="mb-8 text-7xl font-black uppercase leading-[0.8] tracking-tighter">
              <span style={{ color: colors.text }}>Secure</span>
              <span
                className="animate-gradient bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${colors.accent}, ${colors.accentLight}, ${isDarkMode ? "#ffffff" : "#0f172a"})`,
                }}
              >
                {" "}
                Access
              </span>
            </h1>
            <p className="mb-12 max-w-lg text-lg font-medium leading-relaxed opacity-70" style={{ color: colors.muted }}>
              Enter your credentials to manage your Digital Signature Certificates and IRCTC Agent registrations in our unified dashboard.
            </p>
            <div
              className="group flex w-fit items-center gap-4 rounded-lg px-6 py-3 transition-all"
              style={{ border: `1px solid ${colors.borderSoft}`, backgroundColor: colors.panel }}
            >
              <ShieldCheck size={24} className="animate-pulse" style={{ color: colors.accent }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Military-Grade Encryption Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="group relative animate-[fadeIn_1.2s_ease-out]">
            <div className="absolute -inset-[1.5px] rounded-[30px] bg-gradient-to-r from-purple-600 via-transparent to-purple-600 opacity-30 blur-sm transition-opacity duration-500 group-hover:opacity-100" />

            <div
              className="relative w-full max-w-sm overflow-hidden rounded-[30px] border p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              }}
            >
              <div className="absolute left-0 top-0 h-[1px] w-full opacity-50" style={{ backgroundImage: `linear-gradient(to right, transparent, ${colors.accentLight}, transparent)` }} />

              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>Welcome Back</h2>
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.5em] opacity-50" style={{ color: colors.muted }}>
                  Identity Verification
                </p>
              </div>

              {registered ? (
                <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-2 text-center text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  Registration complete. Please log in.
                </div>
              ) : null}

              {error && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-center text-[10px] font-black uppercase tracking-widest text-red-500">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest opacity-50" style={{ color: colors.muted }}>Email or Mobile</label>

                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@dongleiq.com or 9876543210"
                    className="w-full rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/10"
                    style={{
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest opacity-50" style={{ color: colors.muted }}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/10"
                      style={{
                        backgroundColor: colors.input,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: colors.muted }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-2xl transition-all duration-500 hover:brightness-125 active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: colors.accent,
                    boxShadow: `0 15px 35px -10px ${colors.accent}aa`,
                  }}
                >
                  {loading ? "Processing..." : "Login"} <LogIn size={16} />
                </button>

                <div className="pt-3 text-center">
                  <Link href="/forgot-password">
                    <span className="cursor-pointer text-[9px] uppercase tracking-widest underline underline-offset-4" style={{ color: colors.muted }}>
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
