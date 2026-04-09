"use client";

import { useState } from "react";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

type Props = {
  length?: number;
  onComplete: (otp: string) => void;
};

export default function OTPInput({ length = 6, onComplete }: Props) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));

  const handleChange = (value: string, index: number) => {

    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    if (value && index < length - 1) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    if (newOtp.every((digit) => digit !== "")) {
      onComplete(newOtp.join(""));
    }
  };

  return (

    <div className="flex justify-center gap-3">

      {otp.map((digit, index) => (

        <input
          key={index}
          id={`otp-${index}`}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target.value, index)}
          className="h-12 w-12 rounded-md border text-center text-xl font-bold focus:outline-none"
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
