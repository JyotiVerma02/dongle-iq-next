"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
}

export default function OtpModal({ isOpen, onClose, onVerify }: Props) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("Text").slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;
    const newOtp = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-gray-900 p-6 rounded-2xl w-[320px] text-center shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-white">Enter OTP</h2>
        <p className="text-gray-400 text-sm mb-5">
          We sent a 6-digit OTP to your email/phone
        </p>

        <div className="flex justify-between gap-3 mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="
                w-9 h-9
                text-center text-white 
                bg-gradient-to-b from-gray-700 to-gray-800 
                border border-gray-600 
                rounded-xl 
                text-lg 
                shadow-md 
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:scale-110
                hover:scale-105 hover:border-emerald-400
              "
            />
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            Cancel
          </button>

          <button
            onClick={() => onVerify(otp.join(""))}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}
