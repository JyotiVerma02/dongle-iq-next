/* eslint-disable @typescript-eslint/no-explicit-any */
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

  // Configuration based on your specific hex codes
  const colors = {
    bg: "#0F0F0F",
    card: "#1A1A1A",
    accent: "#7C3AED",
    accentLight: "#A78BFA",
    text: "#F9FAFB",
    muted: "#9CA3AF",
    border: "rgba(255,255,255,0.05)"
  };

  const navLinks = ["Apply", "Why Us", "Agents", "FAQs" , "Contact"];

  // --- HANDLERS ---
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name || !lastName || !email || !number || !password || !confirmPassword) {
      setError("Please complete all fields to proceed.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${name} ${lastName}`,
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
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen font-sans antialiased tracking-tight relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      
      {/* --- NAVBAR --- */}
      <nav 
        className="fixed top-0 w-full z-50 p-5 backdrop-blur-xl border-b"
        style={{ backgroundColor: `${colors.bg}CC`, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
              style={{ backgroundColor: colors.accent, boxShadow: `0 10px 15px -3px ${colors.accent}33` }}
            >
              <Cpu size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg uppercase tracking-tighter">
              Dongle<span style={{ color: colors.accentLight }}>IQ</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest">
            {navLinks.map((link) => (
              <Link 
                key={link} 
                href={`/#${link.toLowerCase()}`} 
                className="hover:text-white transition-colors"
                style={{ color: colors.muted }}
              >
                {link}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/login")}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white shadow-lg flex items-center gap-2 transition-all hover:scale-105"
              style={{ backgroundColor: colors.accent, boxShadow: `0 10px 15px -3px ${colors.accent}33` }}
            >
              <LogIn size={14} /> Login
            </button>
          </div>
        </div>
      </nav>

      {/* --- PAGE CONTENT --- */}
      <div className="flex pt-20 min-h-screen">
        
        {/* LEFT PANEL - BRANDING */}
        <div 
          className="hidden lg:flex w-[55%] relative overflow-hidden border-r"
          style={{ borderColor: colors.border }}
        >
          <div 
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-10"
            style={{ backgroundColor: colors.accent }}
          />
          
          <div className="relative z-10 p-20 flex flex-col justify-center h-full">
            <h1 className="text-6xl xl:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase">
              Agent <br /> 
              <span style={{ color: colors.accent }}>Network</span>
            </h1>
            <p className="text-lg max-w-lg leading-relaxed font-medium mb-10" style={{ color: colors.muted }}>
              Join the elite circle of IRCTC agents. Securely manage applications, track approvals, and build your digital identity with Dongle IQ.
            </p>
            <div className="flex items-center gap-4 opacity-60">
               <ShieldCheck size={24} style={{ color: colors.accent }} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Identity Verification Protocol Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - REGISTRATION FORM */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          <div 
            className="p-10 rounded-[20px] shadow-2xl w-full max-w-lg border relative overflow-hidden"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            {/* Top Accent Line */}
            <div 
              className="absolute top-0 left-0 w-full h-1.5 opacity-50" 
              style={{ background: `linear-gradient(to right, transparent, ${colors.accent}, transparent)` }}
            />

            <div className="mb-8">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Register</h2>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black mt-2" style={{ color: colors.muted }}>Create Professional Account</p>
            </div>

            {error && (
              <div className="mb-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-widest text-center rounded-2xl">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-black text-[9px] uppercase tracking-widest ml-1" style={{ color: colors.muted }}>First Name</label>
                  <input
                    type="text" placeholder="John" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border focus:outline-none focus:border-purple-500 transition-all text-sm font-medium"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-black text-[9px] uppercase tracking-widest ml-1" style={{ color: colors.muted }}>Last Name</label>
                  <input
                    type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border focus:outline-none focus:border-purple-500 transition-all text-sm font-medium"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-black text-[9px] uppercase tracking-widest ml-1" style={{ color: colors.muted }}>Email Address</label>
                <input
                  type="email" placeholder="john@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border focus:outline-none focus:border-purple-500 transition-all text-sm font-medium"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                />
              </div>

              <div className="space-y-1">
                <label className="font-black text-[9px] uppercase tracking-widest ml-1" style={{ color: colors.muted }}>Phone Number</label>
                <input
                  type="tel" placeholder="+91 00000 00000" value={number} onChange={(e) => setNumber(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border focus:outline-none focus:border-purple-500 transition-all text-sm font-medium"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                />
              </div>

              <div className="space-y-1">
                <label className="font-black text-[9px] uppercase tracking-widest ml-1" style={{ color: colors.muted }}>Choose Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border focus:outline-none focus:border-purple-500 transition-all text-sm font-medium"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-white" style={{ color: colors.muted }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-black text-[9px] uppercase tracking-widest ml-1" style={{ color: colors.muted }}>Confirm Access Key</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border focus:outline-none focus:border-purple-500 transition-all text-sm font-medium"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-white" style={{ color: colors.muted }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-4 mt-4 rounded-2xl font-black uppercase text-[12px] tracking-widest text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                style={{ backgroundColor: colors.accent, boxShadow: `0 20px 25px -5px ${colors.accent}33` }}
              >
                {loading ? "Processing..." : "Create Account"} <UserPlus size={18} />
              </button>

              <div className="flex flex-col items-center gap-6 pt-6 text-center">
                <div className="h-px w-full opacity-50" style={{ backgroundColor: colors.border }} />
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
          if (res.ok) router.push("/login?registered=true");
        }}
        onResend={async () => { /* Logic */ }}
      />
    </div>
  );
}