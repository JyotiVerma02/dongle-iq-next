"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, ShieldCheck, Eye, EyeOff } from "lucide-react";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";

  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  const colors = getThemePalette(isDarkMode);
  const premiumGradient =
    "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))";

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
        remember: rememberMe,
      }),
    });

    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();

      setError(
        `Server returned unexpected response: ${
          text.startsWith("<") ? "HTML page" : text || "unknown format"
        }`
      );

      return;
    }

    let data: { message?: string; role?: string } | null = null;

    try {
      data = await res.json();
    } catch (jsonError) {
      const text = await res.text();
      console.error("Login JSON parse failed:", jsonError, text);
      setError("Server returned invalid JSON response.");
      return;
    }

    if (!data) {
      setError("Empty server response");
      return;
    }

    if (!res.ok) {
      setError(data.message || "Authentication failed");
      return;
    }

    if (data.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/user/dashboard");
    }
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    setError("Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      suppressHydrationWarning
      className="auth-page-shell theme-transition relative overflow-hidden bg-transparent font-sans antialiased tracking-tight"
      style={{ color: colors.text }}
    >
      <div className="relative z-10 flex w-full app-page-min-height items-center justify-center py-6 sm:py-8">
        {/* --- ULTRA-WIDE CONTAINER FIX --- */}
        <div className="content-container flex flex-col items-center justify-center lg:flex-row lg:gap-10 xl:gap-20">
          {/* ASIDE SECTION: Secure Access */}
          <div
            className="hidden lg:flex lg:w-full lg:max-w-[32rem] lg:flex-col lg:justify-center lg:pr-10 xl:max-w-[34rem] xl:pr-16"
            style={{ borderRight: `1px solid ${colors.borderSoft}` }}
          >
            <div className="animate-[fadeInLeft_0.8s_ease-out]">
              <h1 className="mb-5 text-4xl font-black uppercase leading-tight tracking-tight xl:text-5xl">
                <span style={{ color: colors.text }}>Secure</span>{" "}
                <span className="text-gradient-brand">Access</span>
              </h1>
              <p
                className="mb-7 max-w-lg text-sm font-medium leading-relaxed opacity-80"
                style={{ color: colors.muted }}
              >
                Enter your credentials to manage your Digital Signature
                Certificates and IRCTC Agent registrations in our unified
                dashboard.
              </p>
              <div className="grid max-w-xl grid-cols-2 gap-4">
                {[
                  { value: "Encrypted", label: "Access layer" },
                  { value: "7 Days", label: "Secure session" },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className={`auth-aside-card rounded-2xl p-4 ${index === 0 ? "float-slow" : "float-delay"}`}
                    style={{
                      borderColor: colors.borderSoft,
                      backgroundColor: colors.card,
                    }}
                  >
                    <div
                      className="mb-3 flex h-11 w-11 items-center justify-center rounded-md text-white"
                      style={{ background: premiumGradient }}
                    >
                      <ShieldCheck size={18} />
                    </div>
                    <p
                      className="text-xl font-black uppercase"
                      style={{ color: colors.text }}
                    >
                      {item.value}
                    </p>
                    <p
                      className="mt-1 text-[10px] font-black uppercase tracking-[0.22em]"
                      style={{ color: colors.muted }}
                    >
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FORM SECTION: Login Card */}
          <div className="no-scrollbar flex w-full max-w-md items-center justify-center px-4 py-6 lg:px-0">
            <div className="group relative w-full max-w-[32rem] animate-[fadeIn_1.2s_ease-out]">
              <div
                className="absolute -inset-px rounded-lg opacity-40 blur-sm transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: premiumGradient }}
              />

              <div
                className="auth-card glass-panel-premium shine-border relative w-full overflow-hidden p-3.5 md:p-5"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <div className="mb-4 text-center lg:text-left">
                  <h2
                    className="text-xl font-black uppercase tracking-tight"
                    style={{ color: colors.text }}
                  >
                    <span className="text-gradient-cool">Login</span>
                  </h2>
                  <p
                    className="mt-1.5 text-xs font-medium opacity-80"
                    style={{ color: colors.muted }}
                  >
                    See your growth and get consulting support.
                  </p>
                </div>

                {registered && (
                  <div
                    className="mb-4 rounded-xl border py-2 text-center text-[10px] font-black uppercase tracking-widest"
                    style={{
                      borderColor: isDarkMode
                        ? "rgba(16,185,129,0.28)"
                        : "rgba(16,185,129,0.35)",
                      backgroundColor: isDarkMode
                        ? "rgba(16,185,129,0.12)"
                        : "rgba(16,185,129,0.1)",
                      color: isDarkMode ? "#6ee7b7" : "#065f46",
                    }}
                  >
                    Registration complete. Please log in.
                  </div>
                )}

                {error && (
                  <div
                    className="mb-4 rounded-xl border py-2 text-center text-[10px] font-black uppercase tracking-widest"
                    style={{
                      borderColor: isDarkMode
                        ? "rgba(244,63,94,0.28)"
                        : "rgba(244,63,94,0.3)",
                      backgroundColor: isDarkMode
                        ? "rgba(244,63,94,0.12)"
                        : "rgba(244,63,94,0.1)",
                      color: isDarkMode ? "#fda4af" : "#9f1239",
                    }}
                  >
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label
                      className="text-[10px] font-black uppercase tracking-[0.22em]"
                      style={{ color: colors.subtleText }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      autoComplete="username"
                      placeholder="agent@dongleiq.com"
                      className="glass-input w-full rounded-md border px-3 py-2.5 text-sm lowercase font-semibold outline-none"
                      style={{
                        backgroundColor: colors.input,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      className="text-[10px] font-black uppercase tracking-[0.22em]"
                      style={{ color: colors.subtleText }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="glass-input w-full rounded-md border px-3 py-2.5 pr-11 text-sm font-semibold outline-none"
                        style={{
                          backgroundColor: colors.input,
                          borderColor: colors.inputBorder,
                          color: colors.text,
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                        style={{ color: colors.muted }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label
                      className="flex cursor-pointer items-center gap-2 text-xs font-semibold whitespace-nowrap"
                      style={{ color: colors.subtleText }}
                    >
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border"
                        style={{
                          accentColor: colors.accent,
                          borderColor: colors.inputBorder,
                        }}
                      />
                      Remember me
                    </label>
                    <Link href="/forgot-password">
                      <span
                        className="text-[9px] uppercase tracking-widest underline underline-offset-4"
                        style={{ color: colors.muted }}
                      >
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

                  <div
                    className="pt-2 text-center text-sm font-semibold"
                    style={{ color: colors.subtleText }}
                  >
                    Not registered yet?{" "}
                    <Link href="/signup">
                      <span className="underline ml-1 text-gradient-brand">
                        Create an Account
                      </span>
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* --- END OF FIX --- */}
      </div>

      <style jsx global>{`
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
    <Suspense fallback={<div className="min-h-dvh bg-transparent" />}>
      <LoginContent />
    </Suspense>
  );
}
