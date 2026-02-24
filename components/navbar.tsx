"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-1.5 flex justify-between items-center">
        {/* Logo */}
        <h1
          onClick={() => router.push("/")}
          className="text-xl font-bold text-white cursor-pointer"
        >
          Dongle<span className="text-emerald-400">IQ</span>
        </h1>

        {/* Links */}
        <div className="hidden md:flex gap-8 text-gray-300 items-center">
          <Link
            href="/"
            className="hover:text-white transition hover:underline"
          >
            Home
          </Link>

          <Link
            href="/contact"
            className="hover:text-white transition hover:underline"
          >
            Contact
          </Link>

          <Link
            href="/signup"
            className="bg-gradient-to-r from-emerald-400 to-green-600 px-4 py-2 rounded-lg text-white hover:scale-105 transition transform"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
