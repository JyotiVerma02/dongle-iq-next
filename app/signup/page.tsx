"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Cpu,
  UserPlus,
  ShieldCheck,
  Smartphone,
  Mail,
} from "lucide-react";
import OtpModal from "@/components/OtpModal";

export default function Register() {
  const router = useRouter();

  const [showOtp, setShowOtp] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const colors = {
    bg: "transparent",
    card: "rgba(20, 20, 20, 0.4)",
    accent: "#7C3AED",
    accentLight: "#A78BFA",
    text: "#F9FAFB",
    muted: "#9CA3AF",
    border: "rgba(124, 58, 237, 0.2)",
  };

  const sanitizeNumber = (value: string) => value.replace(/\D/g, "").slice(0, 10);

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
      const res = await fetch("/api/signup", {
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
    } catch {
      setError("System handshake error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent font-sans antialiased tracking-tight">
      <nav
        className="fixed top-0 z-50 w-full border-b p-5 backdrop-blur-xl animate-[slideDown_0.6s_ease-out]"
        style={{ backgroundColor: "rgba(5, 5, 5, 0.7)", borderColor: colors.border }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-all duration-500 group-hover:rotate-[360deg]"
              style={{ backgroundColor: colors.accent, boxShadow: `0 0 20px ${colors.accent}44` }}
            >
              <Cpu size={20} className="text-white" />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter text-white">
              Dongle<span style={{ color: colors.accentLight }}>IQ</span>
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/10 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/5"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex min-h-screen pt-20">
        <div className="hidden w-[55%] flex-col justify-center border-r border-white/5 px-24 lg:flex">
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="mb-8 text-7xl font-black uppercase leading-[0.8] tracking-tighter text-white">
              Agent <br />
              <span className="animate-gradient bg-gradient-to-r from-purple-600 via-purple-300 to-white bg-clip-text text-transparent">
                Network
              </span>
            </h1>
            <p className="mb-12 max-w-lg text-lg font-medium leading-relaxed opacity-70" style={{ color: colors.muted }}>
              Initialize your professional profile to manage Digital Signature Certificates and IRCTC assets through our encrypted cloud infrastructure.
            </p>
            <div className="group flex w-fit items-center gap-4 rounded-lg border border-white/5 bg-white/5 px-6 py-3 transition-all hover:border-purple-500/30">
              <ShieldCheck size={24} className="animate-pulse text-purple-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                Identity Verification Protocol Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="group relative w-full max-w-md animate-[fadeIn_1.2s_ease-out]">
            <div className="absolute -inset-[1.5px] rounded-[30px] bg-gradient-to-r from-purple-600 via-transparent to-purple-600 opacity-30 blur-sm transition-opacity duration-500 group-hover:opacity-100" />

            <div
              className="relative w-full overflow-hidden rounded-[30px] border p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-50" />

              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Register</h2>
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.5em] text-white opacity-50">
                  Create Account
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 py-2 text-center text-[10px] font-black uppercase tracking-widest text-red-500">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-white/5 bg-black/40 p-3 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10"
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-lg border border-white/5 bg-black/40 p-3 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10"
                />

                <div className="relative col-span-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-white/5 bg-black/40 p-3 pl-10 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10"
                  />
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>

                <div className="col-span-2 flex items-center rounded-lg border border-white/5 bg-black/40 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/10">
                  <div className="flex items-center gap-2 pl-3 text-gray-500">
                    <Smartphone size={16} />
                    <span className="text-sm font-semibold text-slate-400">+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="9876543210"
                    value={number}
                    onChange={(e) => setNumber(sanitizeNumber(e.target.value))}
                    className="w-full bg-transparent p-3 text-sm text-white outline-none"
                  />
                </div>

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-lg border border-white/5 bg-black/40 p-3 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10"
                />

                <input
                  type="password"
                  placeholder="Confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-lg border border-white/5 bg-black/40 p-3 text-sm text-white outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10"
                />

                <button
                  disabled={loading}
                  type="submit"
                  className="col-span-2 mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-2xl transition-all duration-500 hover:brightness-125 active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: colors.accent,
                    boxShadow: `0 15px 35px -10px ${colors.accent}aa`,
                  }}
                >
                  {loading ? "Processing..." : "Create Account"} <UserPlus size={16} />
                </button>
              </form>

              <div className="pt-4 text-center">
                <Link
                  href="/login"
                  className="text-[9px] uppercase tracking-widest text-gray-500 underline underline-offset-4 hover:text-purple-400"
                >
                  Already have account? Login
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
        onResend={async () => {}}
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
