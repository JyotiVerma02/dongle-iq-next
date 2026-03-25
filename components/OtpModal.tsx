"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  onResend: () => void;
}

export default function OtpModal({
  isOpen,
  onClose,
  onVerify,
  onResend,
}: Props) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setTimer(30);
    setCanResend(false);
  }, [isOpen]);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

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

  const handleVerify = () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      alert("Enter valid 6 digit OTP");
      return;
    }

    onVerify(finalOtp);
  };

  const handleResend = () => {
    if (!canResend) return;

    onResend();

    setTimer(30);
    setCanResend(false);

    setOtp(Array(6).fill(""));

    inputs.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white p-8 rounded-xl w-[400px] shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Verify OTP</h2>

        <p className="text-gray-400 mb-6">
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
              className="w-12 h-12 text-center text-xl bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              value={digit}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          className="w-full bg-emerald-500 hover:bg-emerald-600 p-3 rounded-lg font-semibold transition"
        >
          Verify OTP
        </button>

        <div className="text-center mt-4">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-emerald-400 hover:text-emerald-300"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-gray-400 text-sm">
              Resend OTP in {timer}s
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}