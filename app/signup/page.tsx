/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Cpu, UserPlus, ShieldCheck, LogIn, Eye, EyeOff, Smartphone, Mail, User
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

  const colors = {
    bg: "transparent", // For Particle Background compatibility
    card: "rgba(20, 20, 20, 0.4)", 
    accent: "#7C3AED",
    accentLight: "#A78BFA",
    text: "#F9FAFB",
    muted: "#9CA3AF",
    border: "rgba(124, 58, 237, 0.2)"
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name || !lastName || !email || !number || !password || !confirmPassword) {
      setError("Incomplete handshake. All fields required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Credential mismatch. Passwords must be identical.");
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
      setError("System handshake error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans antialiased tracking-tight relative overflow-hidden bg-transparent">
      
      {/* --- NAVBAR --- */}
      <nav 
        className="fixed top-0 w-full z-50 p-5 backdrop-blur-xl border-b animate-[slideDown_0.6s_ease-out]"
        style={{ backgroundColor: `rgba(5, 5, 5, 0.7)`, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:rotate-[360deg]"
              style={{ backgroundColor: colors.accent, boxShadow: `0 0 20px ${colors.accent}44` }}
            >
              <Cpu size={20} className="text-white" />
            </div>
            <span className="font-black text-xl italic uppercase tracking-tighter text-white">
              Dongle<span style={{ color: colors.accentLight }}>IQ</span>
            </span>
          </Link>
          <Link href="/login" className="px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest text-white border border-white/10 hover:bg-white/5 transition-all">
             Sign In
          </Link>
        </div>
      </nav>

      {/* --- PAGE CONTENT --- */}
      <div className="relative z-10 flex pt-20 min-h-screen">
        
        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-[55%] flex-col justify-center px-24 border-r border-white/5">
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="text-7xl xl:text-7xl font-black mb-8 leading-[0.8] tracking-tighter uppercase italic text-white">
              Agent <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-300 to-white animate-gradient">Network</span>
            </h1>
            <p className="text-lg max-w-lg leading-relaxed font-medium mb-12 opacity-70" style={{ color: colors.muted }}>
              Initialize your professional profile to manage Digital Signature Certificates and IRCTC assets through our encrypted cloud infrastructure.
            </p>
            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 w-fit group hover:border-purple-500/30 transition-all">
               <ShieldCheck size={24} className="text-purple-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Identity Verification Protocol Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - REGISTRATION FORM */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="relative group animate-[fadeIn_1.2s_ease-out] w-full max-w-xl">
            {/* Animated Glow Border */}
            <div className="absolute -inset-[1.5px] bg-gradient-to-r from-purple-600 via-transparent to-purple-600 rounded-[32px] opacity-30 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
            
            <div 
              className="relative p-10 rounded-[30px] backdrop-blur-2xl w-full border shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50" />

              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Register</h2>
                <p className="text-[10px] uppercase tracking-[0.5em] font-black mt-3 opacity-50 text-white">Create Professional Node</p>
              </div>

              {error && (
                <div className="mb-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center rounded-xl animate-bounce">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 group/input">
                  <label className="block font-black text-[9px] uppercase tracking-widest ml-1 opacity-50 group-focus-within/input:text-purple-400 text-white">First Name</label>
                  <input
                    type="text" placeholder="John" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all text-sm font-medium text-white"
                  />
                </div>
                <div className="space-y-2 group/input">
                  <label className="block font-black text-[9px] uppercase tracking-widest ml-1 opacity-50 group-focus-within/input:text-purple-400 text-white">Last Name</label>
                  <input
                    type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all text-sm font-medium text-white"
                  />
                </div>

                <div className="md:col-span-2 space-y-2 group/input">
                  <label className="block font-black text-[9px] uppercase tracking-widest ml-1 opacity-50 group-focus-within/input:text-purple-400 text-white">Email Address</label>
                  <div className="relative">
                    <input
                      type="email" placeholder="john@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-4 pl-12 rounded-2xl bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all text-sm font-medium text-white"
                    />
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2 group/input">
                  <label className="block font-black text-[9px] uppercase tracking-widest ml-1 opacity-50 group-focus-within/input:text-purple-400 text-white">Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel" placeholder="+91 00000 00000" value={number} onChange={(e) => setNumber(e.target.value)}
                      className="w-full p-4 pl-12 rounded-2xl bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all text-sm font-medium text-white"
                    />
                    <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                <div className="space-y-2 group/input">
                  <label className="block font-black text-[9px] uppercase tracking-widest ml-1 opacity-50 group-focus-within/input:text-purple-400 text-white">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all text-sm font-medium text-white"
                    />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 group/input">
                  <label className="block font-black text-[9px] uppercase tracking-widest ml-1 opacity-50 group-focus-within/input:text-purple-400 text-white">Confirm</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-black/40 border border-white/5 focus:border-purple-500/50 outline-none transition-all text-sm font-medium text-white"
                    />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="md:col-span-2 w-full py-5 mt-4 rounded-2xl font-black uppercase text-[12px] tracking-[0.3em] text-white shadow-2xl hover:brightness-125 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50"
                  style={{ backgroundColor: colors.accent, boxShadow: `0 15px 35px -10px ${colors.accent}aa` }}
                >
                  {loading ? "Initializing..." : "Create Account"} <UserPlus size={18} />
                </button>
              </form>

              <div className="text-center pt-8">
                <Link href="/login" className="text-[10px] font-black  tracking-widest text-gray-500 hover:text-purple-400 transition-all underline underline-offset-8 decoration-purple-500/30">
                 Already account? login...
                </Link>
              </div>
            </div>
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

      <style jsx global>{`
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeInLeft { from { transform: translateX(-50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient { background-size: 200% auto; animation: gradient 4s linear infinite; }
      `}</style>
    </div>
  );
}