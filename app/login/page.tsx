/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Cpu, LogIn, ShieldCheck, UserPlus, Eye, EyeOff 
} from "lucide-react";

function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- THEME (MATCHING REGISTER) ---
  const theme = {
    bg: "bg-[#080b12]",
    card: "bg-[#121620]",
    border: "border-[#1e2330]",
    accent: "bg-purple-600",
    textMuted: "text-slate-400"
  };

  const navLinks = ["Hero", "About", "Services", "FAQs", "Contact"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and Password are required");
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
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      data.role === "admin" ? router.push("/admin/dashboard") : router.push("/user/dashboard");
    } catch (error) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} text-white font-sans relative overflow-hidden`}>
      
      {/* --- NAVBAR --- */}
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
              onClick={() => router.push("/signup")}
              className={`${theme.accent} px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2`}
            >
              <UserPlus size={14} />
              Register
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
              Secure <br /> 
              <span className="text-emerald-400 italic">Access</span> <br />
              <span className="text-white/20">Portal.</span>
            </h1>
            <p className={`${theme.textMuted} text-lg max-w-xl leading-relaxed font-medium mb-8`}>
              Dongle IQ helps you manage all USB dongle applications in one secure
              portal. Admins can approve or track agent requests, while agents can
              submit applications and monitor their dongle status easily.
            </p>
            <div className="flex items-center gap-3 opacity-40">
               <ShieldCheck size={20} className="text-purple-500" />
               <span className="text-xs font-black uppercase tracking-[0.3em]">Encrypted Session Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - FORM CARD */}
        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />

          <div className={`${theme.card} p-8 rounded-4xl shadow-2xl w-full max-w-100 border ${theme.border} relative overflow-hidden`}>
            {/* Top Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-purple-500 to-transparent opacity-30" />

            <h2 className="text-3xl font-black mb-1 uppercase tracking-tighter italic">Welcome Back</h2>
            <p className={`${theme.textMuted} text-[10px] mb-8 uppercase tracking-widest font-bold`}>Initialize your session</p>

            {registered && (
              <div className="mb-6 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest text-center rounded-lg">
                Registration successful! Please login.
              </div>
            )}

            {error && (
              <div className="mb-6 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest text-center rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] ml-1">
                  Identity (Email/Phone)
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@dongleiq.com"
                  className={`w-full p-4 rounded-xl bg-black/40 border ${theme.border} text-white focus:outline-none focus:border-purple-500 transition-all text-sm`}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] ml-1">
                  Access Key
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full p-4 rounded-xl bg-black/40 border ${theme.border} text-white focus:outline-none focus:border-purple-500 transition-all text-sm`}
                  />
                  <button 
                    type="button" 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${theme.accent} w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-purple-600/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 disabled:opacity-50`}
              >
                {loading ? "Authenticating..." : "Sign In"} <LogIn size={14} />
              </button>

              <div className="flex flex-col items-center gap-4 pt-4">
                <Link href="/forgot-password">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest hover:text-purple-400 cursor-pointer transition-colors">Recover Key?</span>
                </Link>
                <div className="h-px w-full bg-[#1e2330]" />
              
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;