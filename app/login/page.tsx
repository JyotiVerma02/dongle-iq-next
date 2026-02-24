"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { FaWhatsapp } from "react-icons/fa";
import { MdMessage } from "react-icons/md";

function Login() {
  const router = useRouter();

  const [password, setPassword] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId || !password || !role) {
      setError("All fields are required");
      return;
    }

    const userData = { userId, password, role };

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isLoggedIn", "true");

    setError("");

    if (role === "admin") {
      router.push("/dashboard");
    } else {
      router.push("/form");
    }
  };

  return (
    <div
      className={`min-h-screen flex pt-14 relative overflow-hidden bg-cover bg-center bg-no-repeat ${
        role === "admin"
          ? "bg-linear-to-br from-black via-red-900 to-slate-950"
          : role === "user"
            ? "bg-linear-to-br from-slate-900 via-blue-900 to-indigo-950"
            : "bg-linear-to-br from-slate-900 via-slate-900 to-blue-950"
      }`}
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* LEFT SIDE */}
      <div
        className="hidden md:flex w-3/5 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/tech-bg.jpg')" }}
      >
        <div className="absolute inset-0 "></div>

        <div className="relative z-10 text-white p-16 flex flex-col justify-center">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            <span className="text-white">Dongle IQ</span> <br />
            <span className="text-emerald-400">Management Portal</span>
          </h1>

          <p className="text-gray-300 text-lg max-w-md text-bold">
            Smartly manage dongle applications, approvals and tracking in one
            secure system.
          </p>
          <div className="flex gap-4 m-2">
            {/* Contact Us */}
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
              <MdMessage size={14} />
              Contact Us
            </button>

            {/* WhatsApp Us */}
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
              <FaWhatsapp size={14} />
              WhatsApp Us
            </button>
          </div>
        </div>
      </div>

      <div
        className={`absolute w-96 h-96 rounded-full blur-3xl -top-40 -left-40 transition-all duration-700
    ${
      role === "admin"
        ? "bg-red-500/20"
        : role === "user"
          ? "bg-blue-500/20"
          : "bg-emerald-400/20"
    }
  `}
      ></div>

      <div
        className={`absolute w-96 h-96 rounded-full blur-3xl -bottom-40 -right-40 transition-all duration-700
    ${
      role === "admin"
        ? "bg-red-700/20"
        : role === "user"
          ? "bg-indigo-500/20"
          : "bg-blue-400/20"
    }
  `}
      ></div>

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
          {error && (
            <div className="mb-4 text-red-400 text-sm font-medium">{error}</div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            {/* User ID */}
            <div className="mb-2">
              <label className="block text-gray-300 mb-2 font-medium text-sm">
                User Id
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User ID"
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

            <p className="text-blue-400 text-sm mt-4 hover:underline cursor-pointer">
              Forgot Password?
            </p>
          </form>
          
        </div>
      </div>
    </div>
  );
}

export default Login;
