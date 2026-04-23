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
  const premiumGradient = isDarkMode
    ? "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))"
    : "linear-gradient(135deg, #2563eb, #0ea5e9)";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Credentials required to initialize session.");
      return;
    }
    try {
      setLoading(true);
      const normalizedEmail = email.toLowerCase().trim();
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
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
      className="theme-transition hero-grid relative min-h-screen overflow-hidden bg-transparent font-sans antialiased tracking-tight"
      style={{ color: colors.text }}
    >
      <div className="hero-glow left-0 top-24 h-56 w-56" style={{ backgroundColor: colors.accent }} />
      <div className="hero-glow right-16 top-28 h-72 w-72" style={{ backgroundColor: "var(--accent-secondary)" }} />
      <div className="relative z-10 flex min-h-screen pt-[4.5rem]">
        <div className="hidden w-[55%] flex-col justify-center px-24 lg:flex" style={{ borderRight: `1px solid ${colors.borderSoft}` }}>
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="mb-8 text-6xl font-black uppercase leading-[0.9] tracking-tight">
              <span style={{ color: colors.text }}>Secure</span>{" "}
              <span style={{ color: colors.accent }}>Access</span>
            </h1>
            <p className="mb-12 max-w-lg text-lg font-medium leading-relaxed opacity-70" style={{ color: colors.muted }}>
              Enter your credentials to manage your Digital Signature Certificates and IRCTC Agent registrations in our unified dashboard.
            </p>
            <div className="grid max-w-xl grid-cols-2 gap-4">
              {[
                { value: "Encrypted", label: "Access layer" },
                { value: "7 Days", label: "Secure session" },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`rounded-lg border p-5 ${index === 0 ? "float-slow" : "float-delay"}`}
                  style={{ borderColor: colors.borderSoft, backgroundColor: colors.card }}
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md text-white" style={{ backgroundColor: colors.accent }}>
                    <ShieldCheck size={18} />
                  </div>
                  <p className="text-xl font-black uppercase" style={{ color: colors.text }}>{item.value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: colors.muted }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="group relative w-full max-w-md animate-[fadeIn_1.2s_ease-out]">
            <div className="absolute -inset-[1.5px] rounded-lg opacity-40 blur-sm transition-opacity duration-500 group-hover:opacity-100" style={{ background: premiumGradient }} />

            <div
              className="shine-border relative w-full overflow-hidden rounded-lg border p-8 shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              }}
            >
              <div className="absolute left-0 top-0 h-px w-full opacity-50" style={{ backgroundImage: `linear-gradient(to right, transparent, ${colors.accentLight}, transparent)` }} />

              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>Welcome Back</h2>
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.5em] opacity-50" style={{ color: colors.muted }}>
                  Identity Verification
                </p>
              </div>

              {registered ? (
                <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 py-2 text-center text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  Registration complete. Please log in.
                </div>
              ) : null}

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-center text-[10px] font-black uppercase tracking-widest text-red-500">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest opacity-50" style={{ color: colors.muted }}>Email or Mobile</label>

                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    placeholder="agent@dongleiq.com or 9876543210"
                    className="glass-input w-full rounded-md border px-4 py-3.5 text-sm lowercase font-semibold outline-none"
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
                      className="glass-input w-full rounded-md border px-4 py-3.5 text-sm font-semibold outline-none"
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
                  className="flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-2xl transition-all duration-500 hover:brightness-125 active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: colors.accent }}
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
      `}</style>
    </div>
  );
}
