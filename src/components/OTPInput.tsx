"use client";

import { useMemo, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

type Props = {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
};

export default function OTPInput({ length = 6, onComplete, disabled = false }: Props) {
  const { isDarkMode } = useTheme();
  const colors = useMemo(() => getThemePalette(isDarkMode), [isDarkMode]);

  const [otp, setOtp] = useState<string[]>(() => Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const commit = (next: string[]) => {
    setOtp(next);
    if (next.every((digit) => digit !== "")) {
      onComplete(next.join(""));
    }
  };

  const handleChange = (rawValue: string, index: number) => {
    if (disabled) return;

    const value = rawValue.replace(/\D/g, "").slice(-1);
    if (rawValue && !value) return;

    const next = [...otp];
    next[index] = value;
    commit(next);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          id={`otp-${index}`}
          type="tel"
          maxLength={1}
          value={digit}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => {
            if (disabled) return;

            if (e.key === "Backspace") {
              if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
                return;
              }
              return;
            }

            if (e.key === "ArrowLeft" && index > 0) {
              inputRefs.current[index - 1]?.focus();
              return;
            }

            if (e.key === "ArrowRight" && index < length - 1) {
              inputRefs.current[index + 1]?.focus();
            }
          }}
          onPaste={(e) => {
            if (disabled) return;

            const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
            if (!pasted) return;

            e.preventDefault();
            const digits = pasted.slice(0, length).split("");
            const next = [...otp];
            digits.forEach((d, i) => {
              next[i] = d;
            });
            commit(next);
            inputRefs.current[Math.min(digits.length, length) - 1]?.focus();
          }}
          disabled={disabled}
          aria-label={`OTP digit ${index + 1}`}
          className="glass-input h-10 w-10 rounded-xl border text-center text-lg font-black outline-none disabled:opacity-60 sm:h-12 sm:w-12 sm:text-xl"
          style={{
            backgroundColor: colors.input,
            color: colors.text,
            borderColor: colors.inputBorder,
          }}
        />
      ))}
    </div>
  );
}
