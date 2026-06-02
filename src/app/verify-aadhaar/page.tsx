"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Moon, SunMedium } from "lucide-react";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

export default function AadhaarVerifyPage() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isChecked, setIsChecked] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const premiumGradient =
    "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))";

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(
      () => setTimer((current) => Math.max(current - 1, 0)),
      1000,
    );
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (otpSent) {
      inputRefs.current[0]?.focus();
    }
  }, [otpSent]);

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter valid 10-digit number");
      return;
    }

    setError("");
    setSuccess("");
    setIsSendingOtp(true);

    try {
      const response = await fetch("/api/verify-aadhar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, action: "send-otp" }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
      setTimer(120);
      setSuccess("OTP sent successfully.");
    } catch {
      setError("Connection error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedOtp = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedOtp) {
      return;
    }

    event.preventDefault();
    const nextOtp = [...otp];

    pastedOtp.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);
    inputRefs.current[Math.min(pastedOtp.length, 6) - 1]?.focus();
  };

  const handleVerify = async () => {
    if (!isChecked || otp.join("").length !== 6) {
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/verify-aadhar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: otp.join(""), action: "verify" }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Verification failed");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      setSuccess("Verified successfully.");
      sessionStorage.setItem("verifiedMobile", mobile);
      setTimeout(() => router.push(`/bank-telecom-form?mobile=${mobile}`), 900);
    } catch {
      setError("Server error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main
      className="theme-transition hero-grid fixed inset-0 flex h-dvh w-full items-center justify-center overflow-hidden px-2 py-2 sm:px-3 sm:py-3"
      style={{ color: colors.text }}
    >
      {/* Fixed Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.borderSoft,
          color: colors.accent,
          boxShadow: `0 8px 20px -12px ${colors.accentShadow}`,
        }}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle theme"
      >
        {isDarkMode ? <SunMedium size={20} /> : <Moon size={20} />}
      </button>
      <div className="relative z-10 w-full max-w-sm">
        <div
          className="pointer-events-none absolute -inset-px rounded-lg blur-sm"
          style={{ background: premiumGradient, opacity: isDarkMode ? 0.34 : 0.18 }}
        />

        <section
          className="shine-border theme-transition relative rounded-3xl border p-3.5 shadow-[0_20px_55px_rgba(0,0,0,0.14)] backdrop-blur-2xl sm:p-4"
          style={{ backgroundColor: colors.panelStrong, borderColor: colors.border }}
        >
          <div className="mb-3 text-center">
            <div
              className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl text-white"
              style={{ background: premiumGradient }}
            >
              <ShieldCheck size={18} />
            </div>
            <h1 className="text-xl font-black uppercase tracking-tighter">
              Aadhaar <span style={{ color: colors.accent }}>Verification</span>
            </h1>
          </div>

          {(error || success) && (
            <div
              className="mb-3 rounded-2xl border px-4 py-3 text-center text-[11px] font-semibold"
              style={{
                borderColor: error ? "rgba(244, 63, 94, 0.2)" : colors.borderSoft,
                backgroundColor: error
                  ? "rgba(244, 63, 94, 0.08)"
                  : colors.accentSoft,
              }}
            >
              {error ? <p className="text-rose-500">{error}</p> : null}
              {success ? <p style={{ color: colors.accent }}>{success}</p> : null}
            </div>
          )}

          <div
            className="mb-3 rounded-lg px-3 py-2 text-center text-[11px]"
            style={{ backgroundColor: colors.accentSoft, color: colors.text }}
          >
            Enter Aadhaar linked mobile number
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="tel"
                maxLength={10}
                inputMode="numeric"
                value={mobile}
                disabled={otpSent}
                placeholder="Mobile Number"
                onChange={(event) => setMobile(event.target.value.replace(/\D/g, ""))}
                className="glass-input theme-transition flex-1 rounded-2xl border px-4 py-2.5 text-sm font-semibold outline-none disabled:opacity-70"
                style={{
                  backgroundColor: colors.input,
                  color: colors.text,
                  borderColor: colors.inputBorder,
                  caretColor: colors.text,
                }}
              />
              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="theme-primary-btn theme-transition rounded-2xl px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap text-white disabled:opacity-60"
                >
                  {isSendingOtp ? "Sending..." : "Send OTP"}
                </button>
              ) : null}
            </div>

            {otpSent ? (
              <div className="space-y-3 text-center">
                <div className="flex justify-center gap-1.5">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      value={digit}
                      maxLength={1}
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      onPaste={handleOtpPaste}
                      className="glass-input theme-transition h-10 w-10 rounded-2xl border text-center text-sm font-bold outline-none sm:h-11 sm:w-11"
                      style={{
                        backgroundColor: colors.input,
                        color: colors.text,
                        borderColor: colors.inputBorder,
                        caretColor: colors.text,
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => timer === 0 && handleSendOtp()}
                  className="text-[10px] font-semibold"
                  style={{ color: colors.accent }}
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </button>
              </div>
            ) : null}

            <div
              className="flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-2.5 text-[11px]"
              style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel }}
              onClick={() => setIsChecked((current) => !current)}
            >
              <div
                className="theme-transition mt-0.5 flex h-5 w-5 items-center justify-center rounded border text-white"
                style={{
                  backgroundColor: isChecked ? colors.accent : "transparent",
                  borderColor: colors.accent,
                }}
              >
                {isChecked ? <span className="text-xs font-bold">✓</span> : null}
              </div>
              <span style={{ color: colors.text }}>
                I consent to Aadhaar-linked mobile verification for this application.
              </span>
            </div>

            <button
              onClick={handleVerify}
              disabled={!isChecked || otp.join("").length !== 6 || isVerifying}
              className="theme-primary-btn theme-transition w-full rounded-2xl py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ opacity: isChecked && otp.join("").length === 6 ? 1 : 0.55 }}
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
