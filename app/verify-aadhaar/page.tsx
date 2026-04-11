"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import ParticleBackground from "@/components/ParticleBackground";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function AadhaarVerifyPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
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
  const premiumGradient = isDarkMode
    ? "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))"
    : "linear-gradient(135deg, #2563eb, #0ea5e9)";

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((current) => Math.max(current - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (otpSent) {
      inputRefs.current[0]?.focus();
    }
  }, [otpSent]);

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      console.error("[VERIFY-AADHAAR] Invalid mobile format:", mobile);
      setError("Enter valid 10-digit number");
      return;
    }

    console.log("[VERIFY-AADHAAR] Sending OTP for mobile:", mobile);
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
      console.log("[VERIFY-AADHAAR] Send OTP response:", response.status, data);

      if (!data.success) {
        console.error("[VERIFY-AADHAAR] Failed to send OTP:", data.message);
        setError(data.message || "Failed to send OTP");
        return;
      }

      console.log("[VERIFY-AADHAAR] OTP sent successfully to", mobile);
      setOtpSent(true);
      setTimer(120);
      setSuccess("OTP sent successfully.");
    } catch (error) {
      console.error("[VERIFY-AADHAAR] Connection error:", error);
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

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedOtp = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
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
      console.warn("[VERIFY-AADHAAR] Verification skipped - checkbox:", isChecked, "OTP length:", otp.join("").length);
      return;
    }

    console.log("[VERIFY-AADHAAR] Attempting verification for mobile:", mobile);
    console.log("[VERIFY-AADHAAR] OTP submitted:", otp.join(""));
    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/verify-aadhar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: otp.join(""), action: "verify" }),
      });

      const data = await response.json();
      console.log("[VERIFY-AADHAAR] Verification response:", response.status, data);

      if (!data.success) {
        console.error("[VERIFY-AADHAAR] Verification failed:", data.message);
        setError(data.message || "Verification failed");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      console.log("[VERIFY-AADHAAR] Verification successful! Redirecting to bank-telecom-form...");
      setSuccess("Verified successfully.");
      sessionStorage.setItem("verifiedMobile", mobile);
      setTimeout(() => router.push(`/bank-telecom-form?mobile=${mobile}`), 900);
    } catch (error) {
      console.error("[VERIFY-AADHAAR] Server error:", error);
      setError("Server error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="theme-transition hero-grid relative flex min-h-screen items-center justify-center px-4 pt-28" style={{ color: colors.text }}>
      <ParticleBackground />
      <div className="hero-glow left-8 top-28 h-52 w-52" style={{ backgroundColor: colors.accent }} />
      <div className="hero-glow right-10 top-24 h-64 w-64" style={{ backgroundColor: "var(--accent-secondary)" }} />

      <div className="relative z-10 w-full max-w-sm">
        <div
          className="pointer-events-none absolute -inset-px rounded-[1.75rem] blur-sm"
          style={{ background: premiumGradient, opacity: isDarkMode ? 0.34 : 0.18 }}
        />

        <section
          className="shine-border theme-transition relative rounded-[1.75rem] border p-6 shadow-[0_20px_55px_rgba(0,0,0,0.14)] backdrop-blur-2xl"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <div className="mb-4 text-center">
            <h1 className="text-xl font-black uppercase tracking-tighter">
              Aadhaar <span style={{ color: colors.accent }}>Verification</span>
            </h1>
          </div>

          {(error || success) && (
            <div className="mb-3 text-center text-[10px] font-black uppercase">
              {error ? <p className="text-rose-500">{error}</p> : null}
              {success ? <p style={{ color: colors.accent }}>{success}</p> : null}
            </div>
          )}

          <div
            className="mb-4 rounded-xl px-3 py-2 text-center text-[11px]"
            style={{ backgroundColor: `${colors.accent}12`, color: colors.muted }}
          >
            Enter Aadhaar linked mobile number
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="tel"
                maxLength={10}
                inputMode="numeric"
                value={mobile}
                disabled={otpSent}
                placeholder="Mobile Number"
                onChange={(event) => setMobile(event.target.value.replace(/\D/g, ""))}
                className="glass-input theme-transition flex-1 rounded-xl border px-3 py-3 text-sm font-semibold outline-none disabled:opacity-70"
                style={{ backgroundColor: colors.input, color: colors.text, borderColor: colors.inputBorder, caretColor: colors.text }}
              />
              {!otpSent && (
                <button
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="theme-primary-btn theme-transition rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:opacity-60 whitespace-nowrap"
                >
                  {isSendingOtp ? "Sending..." : "Send OTP"}
                </button>
              )}
            </div>

            {otpSent && (
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
                      className="glass-input theme-transition h-10 w-10 rounded-lg border text-center text-sm font-bold outline-none"
                      style={{ backgroundColor: colors.input, color: colors.text, borderColor: colors.inputBorder, caretColor: colors.text }}
                    />
                  ))}
                </div>

                <button onClick={() => timer === 0 && handleSendOtp()} className="text-[10px] font-semibold" style={{ color: colors.accent }}>
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </button>
              </div>
            )}

            <div className="flex cursor-pointer items-center gap-2 text-[10px]" onClick={() => setIsChecked((current) => !current)}>
              <div
                className="theme-transition flex h-5 w-5 items-center justify-center rounded border text-white"
                style={{
                  backgroundColor: isChecked ? colors.accent : "transparent",
                  borderColor: colors.accent,
                }}
              >
                {isChecked && <span className="text-xs font-bold">✓</span>}
              </div>
              <span style={{ color: colors.text }}>Consent for verification</span>
            </div>

            <button
              onClick={handleVerify}
              disabled={!isChecked || otp.join("").length !== 6 || isVerifying}
              className="theme-primary-btn theme-transition w-full rounded-xl py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-60"
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
