"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { FaWhatsapp } from "react-icons/fa";
import { MdMessage } from "react-icons/md";
import { useSearchParams } from "next/navigation";

function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and Password are required");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      // ✅ Token is already stored in cookie by backend

      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    } catch (error) {
      setError("Login failed");
    }
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
        <div className="absolute inset-0 "></div>

        <div className="relative z-10 text-white p-12 md:p-16 flex flex-col justify-center h-full">
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 md:mb-6 leading-tight tracking-tight drop-shadow-lg">
            <span className="block text-white">Smart USB Dongle</span>
            <span className="block text-emerald-400 text-2xl md:text-4xl mt-2">
              Management for Agents and Admins
            </span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed font-medium mb-6 drop-shadow-sm">
            Dongle IQ helps you manage all USB dongle applications in one secure
            portal. Admins can approve or track agent requests, while agents can
            submit applications and monitor their dongle status easily. Stay
            organized, stay updated, and manage everything efficiently.
          </p>
        </div>
      </div>

      <div className="absolute w-96 h-96 rounded-full blur-3xl -top-40 -left-40 bg-blue-500/20"></div>

      <div className="absolute w-96 h-96 rounded-full blur-3xl -bottom-40 -right-40 bg-indigo-500/20"></div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center">
        {/* Heading */}
        <div className="py-6 text-center">
          {/* <h1 className="text-5xl font-extrabold tracking-wide bg-linear-to-r from-gray-500 to-blue-500 bg-clip-text text-transparent drop-shadow-md">
            DCM Portal
          </h1> */}
        </div>

        {/* Card */}
        <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-100 border border-white/20 text-white overflow-hidden">
          {/* Shine Animation */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shine_3s_infinite] pointer-events-none"></div>

          <h2 className="text-4xl font-bold mb-3 text-white">Welcome Back!</h2>
          <p className="text-gray-300 mb-6">Log in to access your account</p>

          {registered && (
            <div className="mb-4 text-green-400 text-sm font-medium">
              Registration successful! Please login.
            </div>
          )}

          {error && (
            <div className="mb-4 text-red-400 text-sm font-medium">{error}</div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            {/* User ID */}
            <div className="mb-2">
              <label className="block text-gray-300 mb-2 font-medium text-sm">
                Email or phone number
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email or phone number"
                className="w-full p-2 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-gray-300 mb-2 font-medium text-sm">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full p-3 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300 text-white p-3 rounded-lg font-semibold"
            >
              Login
            </button>

            <Link href="/forgot-password">
              <p className="text-blue-400 text-sm mt-4 hover:underline cursor-pointer">
                Forgot Password?
              </p>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
