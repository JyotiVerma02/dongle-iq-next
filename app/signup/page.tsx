/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Cpu, UserPlus, ShieldCheck, LogIn, Eye, EyeOff 
} from "lucide-react";
import OtpModal from "@/components/OtpModal";

export default function Register() {
  const router = useRouter();

  // --- LOGIC STATE ---
  const [showOtp, setShowOtp] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- THEME (MATCHING LOGIN) ---
  const theme = {
    bg: "bg-[#080b12]",
    card: "bg-[#121620]",
    border: "border-[#1e2330]",
    accent: "bg-purple-600",
    textMuted: "text-slate-400"
  };

  const navLinks = ["Hero", "About", "Services", "FAQs", "Contact"];

  // --- HANDLERS ---
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name || !lastName || !email || !number || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name + " " + lastName,
          email,
          number,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setShowOtp(true);
      setLoading(false);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} text-white font-sans relative overflow-hidden`}>
      
      {/* --- NAVBAR (MATCHING LOGIN) --- */}
      <nav className={`fixed top-0 w-full z-50 p-6 ${theme.bg}/80 backdrop-blur-md border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className={`w-8 h-8 ${theme.accent} rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20`}>
              <Cpu size={18} className="text-white fill-white" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">
              Dongle<span className="text-purple-500">IQ</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            {navLinks.map((link) => (
              <Link key={link} href={`/#${link.toLowerCase()}`} className="hover:text-purple-500 transition-colors uppercase">
                {link}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/login")}
              className={`${theme.accent} px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2`}
            >
              <LogIn size={14} />
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* --- PAGE CONTENT --- */}
      <div className="flex pt-24 min-h-screen">
        
        {/* LEFT PANEL */}
        <div className="hidden md:flex w-3/5 relative overflow-hidden border-r border-[#1e2330]">
          <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 p-16 flex flex-col justify-center h-full">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[0.85] tracking-tighter uppercase">
              Join the <br /> 
              <span className="text-emerald-400 italic">Agent Network</span> <br />
              <span className="text-white/20">Today.</span>
            </h1>
            <p className={`${theme.textMuted} text-lg max-w-xl leading-relaxed font-medium mb-8`}>
              Smartly manage dongle applications, approvals and tracking in one
              secure system. Register today to begin your agent verification process.
            </p>
            <div className="flex items-center gap-3 opacity-40">
               <ShieldCheck size={20} className="text-purple-500" />
               <span className="text-xs font-black uppercase tracking-[0.3em]">Identity Verification Secured</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - FORM CARD */}
        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />

          <div className={`${theme.card} p-8 rounded-4xl shadow-2xl w-full max-w-105 border ${theme.border} relative overflow-hidden`}>
            {/* Top Gradient Line (Matching Login) */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-purple-500 to-transparent opacity-30" />

            <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter italic">Register</h2>
            <p className={`${theme.textMuted} text-[10px] mb-8 uppercase tracking-widest font-bold`}>Create your professional account</p>

            {error && (
              <div className="mb-6 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest text-center rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text" placeholder="First Name" value={name} onChange={(e) => setName(e.target.value)}
                  className={`w-full p-3.5 rounded-xl bg-black/40 border ${theme.border} text-white focus:outline-none focus:border-purple-500 transition-all text-sm`}
                />
                <input
                  type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className={`w-full p-3.5 rounded-xl bg-black/40 border ${theme.border} text-white focus:outline-none focus:border-purple-500 transition-all text-sm`}
                />
              </div>

              <input
                type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3.5 rounded-xl bg-black/40 border ${theme.border} text-white focus:outline-none focus:border-purple-500 transition-all text-sm`}
              />

              <input
                type="tel" placeholder="Phone Number" value={number} onChange={(e) => setNumber(e.target.value)}
                className={`w-full p-3.5 rounded-xl bg-black/40 border ${theme.border} text-white focus:outline-none focus:border-purple-500 transition-all text-sm`}
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-3.5 rounded-xl bg-black/40 border ${theme.border} text-white focus:outline-none focus:border-purple-500 transition-all text-sm`}
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-3.5 rounded-xl bg-black/40 border ${theme.border} text-white focus:outline-none focus:border-purple-500 transition-all text-sm`}
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                disabled={loading}
                type="submit"
                className={`${theme.accent} w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-purple-600/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2`}
              >
                {loading ? "Registering..." : "Create Account"} <UserPlus size={14} />
              </button>

              <div className="flex flex-col items-center gap-4 pt-4">
                <div className="h-px w-full bg-[#1e2330]" />
               
              </div>
            </form>
          </div>
        </div>
      </div>

      <OtpModal
        isOpen={showOtp}
        onClose={() => setShowOtp(false)}
        onVerify={async (otp) => {
          const res = await fetch("/api/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
          });
          if (res.ok) router.push("/login");
        }}
        onResend={async () => { /* Logic */ }}
      />
    </div>
  );
}