"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
}

export default function OtpModal({
  isOpen,
  onClose,
  onVerify,
  onResend,
}: Props) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const [timer, setTimer] = useState(30);
  const canResend = timer === 0;

  useEffect(() => {
    if (!isOpen || timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const resetModalState = () => {
    setTimer(30);
    setOtp(Array(6).fill(""));
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  if (!isOpen) return null;

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text");

    if (!/^\d{6}$/.test(paste)) return;

    const pasteArray = paste.split("");
    setOtp(pasteArray);

    pasteArray.forEach((digit, i) => {
      if (inputs.current[i]) {
        inputs.current[i]!.value = digit;
      }
    });
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      setVerifyError("Enter valid 6 digit OTP");
      return;
    }

    try {
      setVerifying(true);
      setVerifyError("");
      await onVerify(finalOtp);
      resetModalState();
      onClose();
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = () => {
    if (!canResend) return;

    onResend();
    resetModalState();
    inputs.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}>
      <div
        className="w-[400px] rounded-2xl border p-8 shadow-2xl backdrop-blur-2xl"
        style={{ backgroundColor: colors.card, color: colors.text, borderColor: colors.border }}
      >
        <h2 className="mb-2 text-2xl font-bold">Verify OTP</h2>

        <p className="mb-6" style={{ color: colors.muted }}>
          Enter the 6 digit OTP sent to your email
        </p>

        <div className="flex justify-between mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              // Fix: Proper ref callback that returns void
              ref={(el) => {
                inputs.current[index] = el;
              }}
              className="w-12 h-12 rounded-md border text-center text-xl focus:outline-none focus:ring-2"
              style={{
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
                color: colors.text,
              }}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              value={digit}
              disabled={verifying}
            />
          ))}
        </div>

        {verifyError && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-center text-sm text-red-500">
            {verifyError}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={verifying}
          className="w-full rounded-lg p-3 font-semibold text-white transition disabled:opacity-50"
          style={{ backgroundColor: colors.accent }}
        >
          {verifying ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center mt-4">
          {canResend ? (
            <button
              onClick={handleResend}
              className="transition"
              style={{ color: colors.accent }}
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-sm" style={{ color: colors.muted }}>
              Resend OTP in {timer}s
            </p>
          )}
        </div>

        <button
          onClick={handleClose}
          className="mt-4 w-full transition"
          style={{ color: colors.muted }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
