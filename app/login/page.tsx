"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navOffsetClass = "pt-24 md:pt-28";
  const registered = searchParams.get("registered") === "true";

  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);
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
        body: JSON.stringify({ email: normalizedEmail, password, remember: rememberMe }),
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
      suppressHydrationWarning
      className="theme-transition hero-grid relative min-h-[100dvh] overflow-hidden bg-transparent font-sans antialiased tracking-tight"
      style={{ color: colors.text }}
    >
      <div className="hero-glow left-0 top-24 h-56 w-56" style={{ backgroundColor: colors.accent }} />
      <div className="hero-glow right-16 top-28 h-72 w-72" style={{ backgroundColor: "var(--accent-secondary)" }} />
      <div className={`relative z-10 flex min-h-[100dvh] items-stretch ${navOffsetClass}`}>
        <div className="hidden w-[45%] flex-col justify-center px-10 lg:flex" style={{ borderRight: `1px solid ${colors.borderSoft}` }}>
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="mb-5 text-5xl font-black uppercase leading-tight tracking-tight">
              <span style={{ color: colors.text }}>Secure</span>{" "}
              <span style={{ color: colors.accent }}>Access</span>
            </h1>
            <p className="mb-7 max-w-lg text-sm font-medium leading-relaxed opacity-80" style={{ color: colors.muted }}>
              Enter your credentials to manage your Digital Signature Certificates and IRCTC Agent registrations in our unified dashboard.
            </p>
            <div className="grid max-w-xl grid-cols-2 gap-4">
              {[
                { value: "Encrypted", label: "Access layer" },
                { value: "7 Days", label: "Secure session" },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`rounded-lg border p-4 ${index === 0 ? "float-slow" : "float-delay"}`}
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

        <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 pb-4 md:px-6 md:pb-6 lg:items-center">
          <div className="group relative w-full max-w-[380px] animate-[fadeIn_1.2s_ease-out] lg:max-w-[390px]">
            <div className="absolute -inset-[1px] rounded-lg opacity-40 blur-sm transition-opacity duration-500 group-hover:opacity-100" style={{ background: premiumGradient }} />

            <div
              className="shine-border relative max-h-[calc(100dvh-7rem)] w-full overflow-y-auto rounded-lg border p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:p-5"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              }}
            >
              <div className="absolute left-0 top-0 h-px w-full opacity-50" style={{ backgroundImage: `linear-gradient(to right, transparent, ${colors.accentLight}, transparent)` }} />

              <div className="mb-2.5 text-center lg:text-left">
                <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: colors.text }}>Login</h2>
                <p className="mt-1.5 text-xs font-medium opacity-80" style={{ color: colors.muted }}>
                  See your growth and get consulting support.
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

              <form onSubmit={handleSubmit} className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => router.push("/api/auth/google")}
                  className="flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition hover:bg-slate-50"
                  style={{
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  }}
                >
                  <FcGoogle size={18} /> Sign in with Google
                </button>

                <div
                  className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: colors.muted }}
                >
                  <span
                    className="flex-1 border-t"
                    style={{
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.22)"
                        : "rgba(0,0,0,0.35)",
                    }}
                  />
                  <span>or sign in with email</span>
                  <span
                    className="flex-1 border-t"
                    style={{
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.22)"
                        : "rgba(0,0,0,0.35)",
                    }}
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: colors.subtleText }}>Email or Mobile</label>

                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    autoComplete="username"
                    placeholder="agent@dongleiq.com or 9876543210"
                    className="glass-input w-full rounded-md border px-3 py-2.5 text-sm lowercase font-semibold outline-none"
                    style={{
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    }}
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: colors.subtleText }}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="glass-input w-full rounded-md border px-3 py-2.5 pr-11 text-sm font-semibold outline-none"
                      style={{
                        backgroundColor: colors.input,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1"
                      style={{ color: colors.muted }}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: colors.subtleText }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border"
                      style={{ accentColor: colors.accent, borderColor: colors.inputBorder }}
                    />
                    Remember me
                  </label>
                  <Link href="/forgot-password">
                    <span className="cursor-pointer text-[9px] uppercase tracking-widest underline underline-offset-4" style={{ color: colors.muted }}>
                      Forgot Password?
                    </span>
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all duration-500 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: colors.accent }}
                >
                  {loading ? "Processing..." : "Login"} <LogIn size={16} />
                </button>

                <div className="pt-1.5 text-center text-sm font-semibold" style={{ color: colors.subtleText }}>
                  Not registered yet? <Link href="/signup"><span className="underline" style={{ color: colors.accent }}>Create an Account</span></Link>
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

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-transparent" />}>
      <LoginContent />
    </Suspense>
  );
}
