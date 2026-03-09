"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { MdMessage } from "react-icons/md";

export default function AdminRegister() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // 🔐 Admin Secret Key
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !name ||
      !lastName ||
      !email ||
      !number ||
      !password ||
      !confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name + " " + lastName,
          email,
          number,
          password,
          // 🔐 Send secret key
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      alert("Admin registered successfully 🎉");
      router.push("/login");
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <div
      className="min-h-screen flex pt-14 relative overflow-hidden bg-cover bg-center bg-no-repeat bg-linear-to-br from-slate-900 via-blue-900 to-indigo-950"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* LEFT SIDE */}
      <div
        className="hidden md:flex w-3/5 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/tech-bg.jpg')" }}
      >
        <div className="relative z-10 text-white p-16 flex flex-col justify-center">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            <span className="text-white">Dongle IQ</span> <br />
            <span className="text-red-400">Admin Portal</span>
          </h1>

          <p className="text-gray-300 text-lg max-w-md">
            Secure administrator access for managing approvals and users.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center">
        <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-100 border border-white/20 text-white">
          <h2 className="text-4xl font-bold mb-3 text-red-400">
            Admin Registration
          </h2>

          {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-3">
            {/* First + Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-3 rounded-md bg-white/20 border border-white/30"
              />

              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="p-3 rounded-md bg-white/20 border border-white/30"
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 rounded-md bg-white/20 border border-white/30"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="p-3 rounded-md bg-white/20 border border-white/30"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-md bg-white/20 border border-white/30"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded-md bg-white/20 border border-white/30"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* 🔐 Admin Secret Key */}
            {/* <input
              type="password"
              placeholder="Admin Secret Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full p-3 rounded-md bg-red-500/20 border border-red-400"
            /> */}

            <button className="w-full bg-red-500 hover:bg-red-600 transition text-white p-3 rounded-lg font-semibold">
              REGISTER AS ADMIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
