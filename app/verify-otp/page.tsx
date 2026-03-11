"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyOTP() {

  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState<string>(emailFromUrl);
  const [otp, setOtp] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        otp
      })
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Email verified successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } else {
      setMessage(data.message);
    }
  };
  const handleResendOTP = async () => {

  const res = await fetch("/api/resend-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });

  const data = await res.json();

  setMessage(data.message);
};

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/tech-bg.jpg')" }}
    >
      <div className="bg-black/80 backdrop-blur-md p-10 rounded-xl shadow-xl w-[380px]">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Verify OTP
        </h2>

        <p className="text-gray-400 text-center mb-6">
          Enter the OTP sent to your email
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            className="w-full p-3 mb-4 rounded bg-gray-800 text-white border border-gray-600"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full p-3 mb-6 rounded bg-gray-800 text-white border border-gray-600"
            value={otp}
            onChange={(e)=>setOtp(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
          >
            Verify OTP
          </button>
          <button
  type="button"
  onClick={handleResendOTP}
  className="text-blue-400 mt-3 hover:text-blue-300"
>
  Resend OTP
</button>

        </form>

        {message && (
          <p className="text-center text-red-400 mt-4">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}