/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Cpu, LogIn, ShieldCheck, UserPlus, Eye, EyeOff 
} from "lucide-react";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Credentials required to initialize session.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Authentication failed");
        setLoading(false);
        return;
      }

      data.role === "admin" ? router.push("/admin/dashboard") : router.push("/user/dashboard");
    } catch (err) {
      setError("System handshake error occurred");
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
              onClick={() => router.push("/signup")}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
              style={{ backgroundColor: colors.accent, boxShadow: `0 10px 15px -3px ${colors.accent}33` }}
            >
              <UserPlus size={14} /> Register
            </button>
          </div>
        </div>
      </nav>

      {/* --- PAGE CONTENT --- */}
      <div className="flex pt-20 min-h-screen">
        
        {/* LEFT PANEL - MARKETING */}
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
              Secure <br /> 
              <span style={{ color: colors.accent }}>Access</span>
            </h1>
            <p className="text-lg max-w-lg leading-relaxed font-medium mb-10" style={{ color: colors.muted }}>
              Enter your credentials to manage your Digital Signature Certificates and IRCTC Agent registrations in our unified dashboard.
            </p>
            <div className="flex items-center gap-4 opacity-60">
               <ShieldCheck size={24} style={{ color: colors.accent }} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Military-Grade Encryption Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - LOGIN FORM */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          <div className={`${colors.card} p-10 rounded-[20px] shadow-2xl w-full max-w-md border relative overflow-hidden`}
               style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1.5 opacity-50" 
                 style={{ background: `linear-gradient(to right, transparent, ${colors.accent}, transparent)` }} />

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Welcome Back</h2>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black mt-2" style={{ color: colors.muted }}>Session Initialization</p>
            </div>

            {registered && (
              <div className="mb-8 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-black uppercase tracking-widest text-center rounded-2xl">
                Registration Successful. Proceed to Login.
              </div>
            )}

            {error && (
              <div className="mb-8 py-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-black uppercase tracking-widest text-center rounded-2xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block font-black text-[10px] uppercase tracking-[0.2em] ml-1" style={{ color: colors.muted }}>
                  Email/Mobile
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@dongleiq.com"
                  className="w-full p-4 rounded-2xl border focus:outline-none transition-all text-sm font-medium"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-black text-[10px] uppercase tracking-[0.2em] ml-1" style={{ color: colors.muted }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-4 rounded-2xl border focus:outline-none transition-all text-sm font-medium"
                    style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                  />
                  <button 
                    type="button" 
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: colors.muted }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black uppercase text-[12px] tracking-widest text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                style={{ backgroundColor: colors.accent, boxShadow: `0 20px 25px -5px ${colors.accent}33` }}
              >
                {loading ? "Authenticating..." : "Login "} <LogIn size={18} />
              </button>

              <div className="flex flex-col items-center gap-6 pt-6">
                <Link href="/forgot-password">
                  <span className="text-[11px] font-black uppercase tracking-widest hover:text-white cursor-pointer transition-colors underline underline-offset-4"
                        style={{ color: colors.muted }}>Forgot Password?</span>
                </Link>
                <div className="h-px w-full opacity-50" style={{ backgroundColor: colors.border }} />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}