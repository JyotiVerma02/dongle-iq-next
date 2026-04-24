"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function VerifyPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [activeTab, setActiveTab] = useState<"telecom" | "bank">("telecom");
  const [isChecked, setIsChecked] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
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
    if (mobile.length !== 10) {
      alert("Enter 10 digit number");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to send OTP");
        return;
      }

      setOtpSent(true);
      setTimer(120);
      alert("OTP sent successfully");
    } catch {
      alert("Error sending OTP");
    } finally {
      setIsSending(false);
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
    if (!mobile || mobile.length < 10 || otp.join("").length !== 6 || !isChecked) return;
    setIsVerifying(true);
    sessionStorage.setItem("verifiedMobile", mobile);
    router.push(`/bank-telecom-form?type=${activeTab}&mobile=${mobile}`);
  };

  return (
    <main className="theme-transition hero-grid relative flex min-h-screen items-center justify-center px-4 pt-24" style={{ color: colors.text }}>
      <div className="hero-glow left-8 top-28 h-52 w-52" style={{ backgroundColor: colors.accent }} />
      <div className="hero-glow right-10 top-24 h-64 w-64" style={{ backgroundColor: "var(--accent-secondary)" }} />

      <div className="relative z-10 w-full max-w-sm">
        <div
          className="pointer-events-none absolute -inset-px rounded-lg blur-sm"
          style={{ background: premiumGradient, opacity: isDarkMode ? 0.34 : 0.18 }}
        />

        <section
          className="shine-border theme-transition relative rounded-lg border p-5 shadow-[0_20px_55px_rgba(0,0,0,0.14)] backdrop-blur-2xl"
          style={{ backgroundColor: colors.panelStrong, borderColor: colors.border }}
        >
          <div className="mb-4 text-center">
            <h1 className="text-xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>
              Identity <span style={{ color: colors.accent }}>Verification</span>
            </h1>
          </div>

          <div className="mb-4 flex rounded-lg p-1" style={{ backgroundColor: colors.panel }}>
            {(["telecom", "bank"] as const).map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="theme-transition flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest"
                  style={{
                    background: active ? premiumGradient : "transparent",
                    color: active ? "#ffffff" : colors.muted,
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div
            className="mb-4 rounded-lg px-3 py-2 text-center text-[11px]"
            style={{ backgroundColor: colors.accentSoft, color: colors.text }}
          >
            {activeTab === "telecom" ? "Verify via telecom records" : "Verify via bank identity API"}
          </div>

          <div className="space-y-4">
            <div className="items-stretch gap-3 sm:flex">
              <input
                type="tel"
                maxLength={10}
                inputMode="numeric"
                placeholder="Mobile Number"
                value={mobile}
                disabled={otpSent}
                onChange={(event) => setMobile(event.target.value.replace(/\D/g, ""))}
                className="glass-input theme-transition w-full flex-1 rounded-lg border px-4 py-3 text-sm font-semibold outline-none disabled:opacity-70"
                style={{ backgroundColor: colors.input, color: colors.text, borderColor: colors.inputBorder }}
              />

              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  disabled={isSending}
                  className="theme-primary-btn theme-transition mt-3 w-full rounded-lg px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap text-white disabled:opacity-60 sm:mt-0 sm:w-auto"
                >
                  {isSending ? "Sending..." : "Send OTP"}
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
                      className="glass-input theme-transition h-9 w-9 rounded-lg border text-center text-sm font-bold outline-none"
                      style={{ backgroundColor: colors.input, color: colors.text, borderColor: colors.inputBorder }}
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
          </div>

          <div
            className="mt-5 mb-5 flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3"
            style={{ borderColor: colors.borderSoft, backgroundColor: colors.panelStrong }}
            onClick={() => setIsChecked((current) => !current)}
          >
            <div
              className="theme-transition h-4 w-4 shrink-0 rounded border"
              style={{
                backgroundColor: isChecked ? colors.accent : "transparent",
                borderColor: isChecked ? colors.accent : colors.inputBorder,
              }}
            />
            <span className="text-[11px] leading-none" style={{ color: colors.muted }}>
              I agree to verification
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleVerify}
              disabled={!isChecked || otp.join("").length !== 6 || isVerifying}
              className="theme-primary-btn theme-transition w-full rounded-lg py-2.5 text-[11px] font-black uppercase tracking-[0.22em] text-white disabled:cursor-not-allowed disabled:opacity-60"
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
