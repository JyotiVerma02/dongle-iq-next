"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !email || !number || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const newUser = { name, email, number, password };

    localStorage.setItem("registeredUser", JSON.stringify(newUser));

    setError("");
    router.push("/login"); // Navigate to login page
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat bg-linear-to-br from-slate-900 via-slate-900 to-blue-950"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* Glass Card */}
    <div className="relative bg-white/10 backdrop-blur-lg p-4 rounded-2xl shadow-2xl w-full max-w-lg border h-3/4 border-white/20 text-white overflow-hidden">
        <h2 className="text-3xl font-bold tracking-wide">
          Create Account
        </h2>

        <p className="text-gray-300 mb-4">Register as a new user</p>

        {error && (
          <div className="mb-4 text-red-400 text-sm font-medium">{error}</div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-1.5 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-1.5 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Mobile Number
            </label>
            <input
              type="tel"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Enter your number"
              className="w-full p-1.5 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-1.5 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full p-1.5 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300 text-white py-1.5 rounded-lg font-semibold"
          >
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
}
