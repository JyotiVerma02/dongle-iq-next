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

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isChecked || otp.join("").length !== 6) return;

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
      setTimeout(() => router.push("/bank-telecom-form"), 900);
    } catch {
      setError("Server error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="theme-transition relative flex min-h-screen items-center justify-center px-4 pt-28" style={{ color: colors.text }}>
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-sm">
        <div
          className="pointer-events-none absolute -inset-[1px] rounded-[1.75rem] blur-sm"
          style={{ background: `linear-gradient(90deg, ${colors.accent}, transparent, ${colors.accent})`, opacity: isDarkMode ? 0.34 : 0.18 }}
        />

        <section
          className="theme-transition relative rounded-[1.75rem] border p-5 shadow-[0_20px_55px_rgba(0,0,0,0.14)] backdrop-blur-2xl"
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
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              disabled={otpSent}
              placeholder="Mobile Number"
              onChange={(event) => setMobile(event.target.value.replace(/\D/g, ""))}
              className="theme-transition w-full rounded-xl border px-3 py-3 text-sm outline-none disabled:opacity-70"
              style={{ backgroundColor: colors.input, color: colors.text, borderColor: colors.inputBorder }}
            />

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
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      className="theme-transition h-10 w-10 rounded-lg border text-center text-sm font-bold outline-none"
                      style={{ backgroundColor: colors.input, color: colors.text, borderColor: colors.inputBorder }}
                    />
                  ))}
                </div>

                <button onClick={() => timer === 0 && handleSendOtp()} className="text-[10px] font-semibold" style={{ color: colors.accent }}>
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="theme-transition w-full rounded-xl py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:opacity-60"
                style={{ backgroundColor: colors.accent }}
              >
                {isSendingOtp ? "Sending..." : "Send OTP"}
              </button>
            )}

            <div className="flex cursor-pointer items-center gap-2 text-[10px]" onClick={() => setIsChecked((current) => !current)}>
              <div
                className="theme-transition h-4 w-4 rounded border"
                style={{
                  backgroundColor: isChecked ? colors.accent : "transparent",
                  borderColor: isChecked ? colors.accent : colors.inputBorder,
                }}
              />
              <span style={{ color: colors.muted }}>Consent for verification</span>
            </div>

            <button
              onClick={handleVerify}
              disabled={!isChecked || otp.join("").length !== 6 || isVerifying}
              className="theme-transition w-full rounded-xl py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: isChecked && otp.join("").length === 6 ? colors.accent : colors.subtleText }}
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
