"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cpu, LogIn } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  if (pathname === "/admin/dashboard") {
    return null;
  }

  const colors = {
    accent: "#7C3AED",
    accentLight: "#A78BFA",
    muted: "#9CA3AF",
    text: "#F9FAFB",
    border: "rgba(124, 58, 237, 0.2)",
  };

  const navLinks = ["Apply", "Why Us", "Agents", "FAQs", "Contact"];

  return (
    <nav
      className="fixed top-0 w-full z-50 p-5 backdrop-blur-2xl border-b bg-white/70 dark:bg-black/70 dark:border-gray-800 transition-all"
      style={{
        borderColor: colors.border,
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:rotate-180"
            style={{
              backgroundColor: colors.accent,
              boxShadow: `0 0 20px ${colors.accent}44`,
            }}
          >
            <Cpu size={20} className="text-white" />
          </div>

          <span className="font-black text-xl  uppercase tracking-tighter text-black dark:text-white">
            Dongle<span className="text-purple-500">IQ</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em]">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`/#${link.toLowerCase().replace(" ", "")}`}
              className="text-gray-500 dark:text-gray-300 hover:text-purple-500 transition-all duration-300 relative group"
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-purple-500 transition-all group-hover:w-full" />
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl border text-sm font-bold text-black dark:text-white border-gray-300 dark:border-gray-700"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            onClick={() => router.push("/login")}
            className="hidden sm:flex text-[11px] font-black uppercase tracking-widest gap-2 items-center text-gray-600 dark:text-gray-300 hover:text-purple-500 transition-colors"
          >
            <LogIn size={14} /> Login
          </button>

          <button
            onClick={() => router.push("/signup")}
            className="px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest text-white bg-purple-600 hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all"
          >
            Register
          </button>

        </div>
      </div>
    </nav>
  );
}
