"use client";

import { useState } from "react";

type Props = {
  length?: number;
  onComplete: (otp: string) => void;
};

export default function OTPInput({ length = 6, onComplete }: Props) {

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
          className="w-12 h-12 text-center text-xl font-bold rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:border-emerald-400"
        />

      ))}

    </div>

  );

}