"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OTPInput from "@/components/OTPInput";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function VerifyOTP() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState<string>(emailFromUrl);
  const [otp, setOtp] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Email verified successfully!");
      setMessageType("success");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setMessage(data.message);
      setMessageType("error");
    }
  };

  const handleResendOTP = async () => {
    const res = await fetch("/api/resend-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setMessage(data.message);
    setMessageType(res.ok ? "success" : "error");
  };

  return (
    <div
      className="theme-transition flex min-h-screen items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/tech-bg.jpg')" }}
    >
      <div
        className="w-96 rounded-2xl border p-10 shadow-xl backdrop-blur-md"
        style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}
      >
        <h2 className="mb-6 text-center text-3xl font-bold">
          Verify OTP
        </h2>

        <p className="mb-6 text-center" style={{ color: colors.muted }}>
          Enter the OTP sent to your email
        </p>

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <input
            type="email"
            className="mb-6 w-full rounded border p-3"
            style={{ backgroundColor: colors.input, color: colors.text, borderColor: colors.inputBorder }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* PROFESSIONAL OTP INPUT */}
          <div className="mb-6 flex justify-center">
            <OTPInput length={6} onComplete={(value) => setOtp(value)} />
          </div>

          {/* VERIFY BUTTON */}
          <button
            type="submit"
            className="w-full rounded-lg py-3 text-white"
            style={{ backgroundColor: colors.accent }}
          >
            Verify OTP
          </button>

          {/* RESEND OTP */}
          <button
            type="button"
            onClick={handleResendOTP}
            className="mt-4 w-full"
            style={{ color: colors.accent }}
          >
            Resend OTP
          </button>
        </form>

        {message && (
          <p
            className={`text-center mt-4 ${
              messageType === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
