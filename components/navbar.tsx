// components/Navbar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Cpu, LogIn } from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  // Keep your brand colors centralized
  const colors = {
    bg: "#050505",
    accent: "#7C3AED",
    accentLight: "#A78BFA",
    muted: "#9CA3AF",
    text: "#F9FAFB",
    border: "rgba(124, 58, 237, 0.2)"
  };

  const navLinks = ["Apply", "Why Us", "Agents", "FAQs", "Contact"];

  return (
    <nav 
      className="fixed top-0 w-full z-50 p-5 backdrop-blur-2xl border-b animate-[slideDown_0.6s_ease-out]"
      style={{ 
        backgroundColor: `rgba(5, 5, 5, 0.7)`, 
        borderColor: colors.border 
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:rotate-[360deg] group-hover:shadow-purple-500/50"
            style={{ backgroundColor: colors.accent, boxShadow: `0 0 20px ${colors.accent}44` }}
          >
            <Cpu size={20} className="text-white" />
          </div>
          <span className="font-black text-xl italic uppercase tracking-tighter" style={{ color: colors.text }}>
            Dongle<span style={{ color: colors.accentLight }}>IQ</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em]">
          {navLinks.map((link) => (
            <a 
              key={link} 
              href={`/#${link.toLowerCase().replace(" ", "")}`} 
              className="hover:text-purple-400 transition-all duration-300 relative group"
              style={{ color: colors.muted }}
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-purple-500 transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/login")}
            className="hidden sm:flex text-[11px] font-black uppercase tracking-widest gap-2 items-center hover:text-purple-400 transition-colors"
            // style={{ color: colors.text }}
          >
            <LogIn size={14} /> Login
          </button>
          <button 
            onClick={() => router.push("/signup")}
            className="px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest text-white shadow-lg hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all"
            style={{ backgroundColor: colors.accent }}
          >
             Register
          </button>
        </div>
      </div>
    </nav>
  );
}