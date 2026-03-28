/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Cpu, LogIn, ShieldCheck, UserPlus, Eye, EyeOff, Sun, Moon 
} from "lucide-react";

// 1. Import Global Theme Tools
import { useTheme } from "@/app/context/ThemeContext";
import { getThemeConfig } from "@/app/utils/themeConfig";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2. Pull Global State (No more local useState for theme)
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = getThemeConfig(isDarkMode);

  const navLinks = ["Apply", "Why Us", "Agents", "FAQs"];

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
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans antialiased tracking-tight relative overflow-hidden transition-colors duration-300`}>
      
      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 p-5 ${theme.nav} backdrop-blur-xl border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className={`${theme.accent} w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20`}>
              <Cpu size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg uppercase tracking-tighter">
              Dongle<span className="text-purple-500">IQ</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {navLinks.map((link) => (
              <Link key={link} href={`/#${link.toLowerCase()}`} className="hover:text-purple-500 transition-colors">
                {link}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {/* 3. Global Toggle Button */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full border ${theme.border} hover:bg-purple-500/10 transition-all shadow-sm`}
            >
              {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-purple-600" />}
            </button>
            <button 
              onClick={() => router.push("/signup")}
              className={`${theme.accent} px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-purple-500/20 flex items-center gap-2 hover:scale-105 transition-transform`}
            >
              <UserPlus size={14} /> Register
            </button>
          </div>
        </div>
      </nav>

      {/* --- PAGE CONTENT --- */}
      <div className="flex pt-20 min-h-screen">
        
        {/* LEFT PANEL - MARKETING */}
        <div className={`hidden lg:flex w-[55%] relative overflow-hidden border-r ${theme.border}`}>
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 p-20 flex flex-col justify-center h-full">
            <h1 className="text-6xl xl:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic">
              Secure <br /> 
              <span className="text-purple-500">Access</span> <br />
              <span className={isDarkMode ? "text-white/10" : "text-slate-200"}>Portal.</span>
            </h1>
            <p className={`${theme.textMuted} text-lg max-w-lg leading-relaxed font-medium mb-10`}>
              Enter your credentials to manage your Digital Signature Certificates and IRCTC Agent registrations in our unified dashboard.
            </p>
            <div className="flex items-center gap-4 opacity-60">
               <ShieldCheck size={24} className="text-purple-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Military-Grade Encryption Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - LOGIN FORM */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          {!isDarkMode && <div className="absolute inset-0 bg-gradient-to-tr from-purple-50/50 to-transparent pointer-events-none" />}

          <div className={`${theme.card} p-10 rounded-[40px] shadow-2xl w-full max-w-md border ${theme.border} relative overflow-hidden`}>
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-purple-600 to-transparent opacity-50" />

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">Welcome Back</h2>
              <p className={`${theme.textMuted} text-[10px] uppercase tracking-[0.3em] font-black mt-2`}>Session Initialization</p>
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
                <label className="block text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] ml-1">
                  Email/Mobile
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@dongleiq.com"
                  className={`w-full p-4 rounded-2xl ${theme.inputBg} border ${theme.border} ${theme.text} focus:outline-none focus:border-purple-500 transition-all text-sm font-medium`}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full p-4 rounded-2xl ${theme.inputBg} border ${theme.border} ${theme.text} focus:outline-none focus:border-purple-500 transition-all text-sm font-medium`}
                  />
                  <button 
                    type="button" 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-500 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${theme.accent} w-full py-4 rounded-2xl font-black uppercase text-[12px] tracking-widest text-white shadow-xl shadow-purple-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50`}
              >
                {loading ? "Authenticating..." : "Login "} <LogIn size={18} />
              </button>

              <div className="flex flex-col items-center gap-6 pt-6">
                <Link href="/forgot-password">
                  <span className="text-slate-500 text-[11px] font-black uppercase tracking-widest hover:text-purple-500 cursor-pointer transition-colors underline underline-offset-4 decoration-slate-800">Forgot Password?</span>
                </Link>
                <div className={`h-px w-full ${theme.border} opacity-50`} />
               
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}