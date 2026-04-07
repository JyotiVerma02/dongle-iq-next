"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const colors = {
  bg: "#050505",
  card: "rgba(20, 20, 20, 0.4)",
  accent: "#7C3AED",
  accentLight: "#A78BFA",
  text: "#F9FAFB",
  muted: "#9CA3AF",
  border: "rgba(124, 58, 237, 0.2)",
};

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
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || !lastName || !email || !number || !password || !confirmPassword) {
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
      className="min-h-screen font-sans antialiased tracking-tight relative overflow-hidden bg-transparent mt-10"
      style={{ color: colors.text }}
    >
      <div className="relative z-10 flex  min-h-screen">
        
        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-[55%] flex-col justify-center px-16 border-r border-white/5">
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="text-7xl font-black mb-8 leading-[0.8] tracking-tighter uppercase italic">
              Admin
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-300 to-white animate-gradient"> Access
              </span>
            </h1>

            <p
              className="text-lg max-w-lg leading-relaxed font-medium mb-12 opacity-70"
              style={{ color: colors.muted }}
            >
              Register new admin securely to manage dashboard access and approvals.
            </p>

            <div className="flex items-center gap-2 px-6 py-3  bg-white/5 border border-white/5 w-fit group hover:border-purple-500/30 transition-all">
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">
                Secure Registration Enabled
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative group animate-[fadeIn_1.2s_ease-out]">
            
            {/* Glow Border */}
            <div className="absolute -inset-[1.5px] bg-gradient-to-r from-purple-600 via-transparent to-purple-600 rounded-[32px] opacity-30 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

            {/* CARD */}
            <div
              className="relative  p-6 rounded-xl max-w-sm backdrop-blur-2xl w-full  shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              {/* Top Glow Line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50" />

              {/* Heading */}
            <div className="mb-8 text-center lg:text-left">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                  Admin <span className="text-purple-500">Register</span>
                </h2>
                <p className="text-[9px] uppercase tracking-[0.5em] font-black mt-3 opacity-50">
                  Secure Access Setup
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center rounded-xl">
                  {error}
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleRegister} className="space-y-4">

                {/* Name */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-xs bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                  />

                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-xs bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                  />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-xs bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                  />

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-xs bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-xs bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                  />
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-xs bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                  />
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg font-black uppercase text-[12px] tracking-[0.3em] text-white shadow-2xl hover:brightness-125 active:scale-[0.98] transition-all duration-500"
                  style={{
                    backgroundColor: colors.accent,
                    boxShadow: `0 15px 35px -10px ${colors.accent}aa`,
                  }}
                >
                  Register Admin
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 4s linear infinite;
        }
      `}</style>
    </div>
  );
}