"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ShieldCheck } from "lucide-react";

import OTPInput from "@/components/OTPInput";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

export default function VerifyOTP() {
  const router = useRouter();
  const emailFromUrl =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("email") || ""
      : "";
  const [email, setEmail] = useState<string>(emailFromUrl);
  const [otp, setOtp] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const premiumGradient =
    "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || otp.length !== 6) {
      setMessage("Please enter your email and 6-digit OTP.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Email verified successfully!");
      setMessageType("success");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setMessage(data?.message || "OTP verification failed.");
      setMessageType("error");
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (!email) {
      setMessage("Please enter your email first.");
      setMessageType("error");
      return;
    }

    setResending(true);
    const res = await fetch("/api/resend-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setMessage(data?.message || (res.ok ? "OTP resent." : "Failed to resend OTP."));
    setMessageType(res.ok ? "success" : "error");
    setResending(false);
  };

  return (
    <div
      suppressHydrationWarning
      className="auth-page-shell theme-transition relative overflow-x-hidden overflow-y-auto bg-transparent font-sans antialiased tracking-tight"
      style={{ color: colors.text }}
    >
      <div className="relative z-10 flex min-h-dvh w-full items-start justify-center px-4 py-6 sm:items-center sm:py-8">
        <div className="content-container flex w-full items-center justify-center">
          <div className="group relative w-full max-w-md">
            <div
              className="absolute -inset-px rounded-lg opacity-40 blur-sm transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: premiumGradient }}
            />

            <div
              className="auth-card shine-border relative w-full overflow-hidden p-5 shadow-2xl sm:p-7"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <div className="mb-5 text-center">
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                  style={{ background: premiumGradient }}
                >
                  <ShieldCheck size={18} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  Check <span style={{ color: colors.accent }}>OTP</span>
                </h2>
                <p className="mt-2 text-xs font-medium" style={{ color: colors.muted }}>
                  Enter the 6-digit code sent to your email.
                </p>
              </div>

              {message ? (
                <div
                  className={`mb-4 rounded-2xl border px-4 py-3 text-center text-[11px] font-semibold ${
                    messageType === "success"
                      ? "border-orange-500/20 bg-orange-500/10 text-orange-400"
                      : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {message}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    className="text-[10px] font-black uppercase tracking-[0.22em]"
                    style={{ color: colors.subtleText }}
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      placeholder="agent@dongleiq.com"
                      className="glass-input w-full rounded-2xl border py-3 pl-10 pr-4 text-sm font-semibold outline-none"
                      style={{
                        backgroundColor: colors.input,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }}
                      required
                    />
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: colors.muted }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black uppercase tracking-[0.22em]"
                    style={{ color: colors.subtleText }}
                  >
                    One-time password
                  </label>
                  <OTPInput
                    length={6}
                    onComplete={(value) => setOtp(value)}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="theme-primary-btn theme-transition flex w-full items-center justify-center rounded-2xl py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Continue"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending || loading}
                  className="w-full rounded-2xl border py-3 text-[11px] font-black uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.panelStrong,
                    color: colors.accent,
                  }}
                >
                  {resending ? "Resending..." : "Send again"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
