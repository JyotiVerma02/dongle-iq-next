"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex pt-14 relative overflow-hidden bg-cover bg-center bg-no-repeat bg-linear-to-br from-slate-900 via-slate-900 to-blue-950"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* LEFT SIDE */}
      <div
        className="hidden md:flex w-3/5 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/tech-bg.jpg')" }}
      >
        <div className="relative z-10 text-white p-12 md:p-16 flex flex-col justify-center h-full">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-lg">
            <span className="block text-white">Smart USB Dongle</span>
            <span className="block text-emerald-400 text-2xl md:text-4xl mt-2">
              Management for Agents and Admins
            </span>
          </h1>

          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed font-medium">
            Reset your password securely and continue managing your dongle
            applications through the Dongle IQ portal.
          </p>
        </div>
      </div>

      {/* Glow Circles */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl -top-40 -left-40 bg-blue-500/20"></div>

      <div className="absolute w-96 h-96 rounded-full blur-3xl -bottom-40 -right-40 bg-indigo-500/20"></div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center">
        <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-100 border border-white/20 text-white overflow-hidden">
          {/* Shine Animation */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shine_3s_infinite] pointer-events-none"></div>

          <h2 className="text-4xl font-bold mb-3 text-white">
            Forgot Password
          </h2>

          <p className="text-gray-300 mb-6">
            Enter your registered email to reset password
          </p>

          {message && (
            <div className="mb-4 text-green-400 text-sm font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-4">
              <label className="block text-gray-300 mb-2 font-medium text-sm">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300 text-white p-3 rounded-lg font-semibold"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
