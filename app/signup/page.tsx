"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { MdMessage } from "react-icons/md";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   if (
  //     !name ||
  //     !lastName ||
  //     !email ||
  //     !number ||
  //     !password ||
  //     !confirmPassword
  //   ) {
  //     setError("All fields are required");
  //     return;
  //   }

  //   if (password !== confirmPassword) {
  //     setError("Passwords do not match");
  //     return;
  //   }

  //   const newUser = { name, lastName, email, number, password };
  //   localStorage.setItem("registeredUser", JSON.stringify(newUser));

  //   setError("");
  //   router.push("/login");
  // };

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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name + " " + lastName,
          email,
          number,
          password,
        }),
      });

      const data = await res.json();

    if (!res.ok) {
  setError(data.error);
  return;
}

setError("");
router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      setError("");
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
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
            <span className="text-emerald-400">Management Portal</span>
          </h1>

          <p className="text-gray-300 text-lg max-w-md">
            Smartly manage dongle applications, approvals and tracking in one
            secure system.
          </p>

          <div className="flex gap-4 mt-6">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
              <MdMessage size={14} />
              Contact Us
            </button>

            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
              <FaWhatsapp size={14} />
              WhatsApp Us
            </button>
          </div>
        </div>
      </div>

      {/* Glow Effects */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl -top-40 -left-40 bg-blue-500/20"></div>
      <div className="absolute w-96 h-96 rounded-full blur-3xl -bottom-40 -right-40 bg-indigo-500/20"></div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center">
        <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-100 border border-white/20 text-white overflow-hidden">
          <h2 className="text-4xl font-bold mb-3">Create Account</h2>
          <p className="text-gray-300 mb-6">
            Let’s get you all set up so you can access your personal account.
          </p>

          {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-3 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />

              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="p-3 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="p-3 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

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

            <button className="w-full bg-emerald-500 hover:bg-emerald-600 transition text-white p-3 rounded-lg font-semibold">
              SIGN UP
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
