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
  Eye,
  EyeOff,
} from "lucide-react";
import OtpModal from "@/components/OtpModal";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function Register() {
  const router = useRouter();

  const [showOtp, setShowOtp] = useState(false);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  const colors = getThemePalette(isDarkMode);
  const premiumGradient = isDarkMode
    ? "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))"
    : "linear-gradient(135deg, #2563eb, #0ea5e9)";

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
      const normalizedEmail = email.toLowerCase().trim();
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${name} ${lastName}`,
          email: normalizedEmail,
          number,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.message === "Email already registered") {
          setError("Email is already registered. Please login instead.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
          setLoading(false);
          return;
        }
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setShowOtp(true);
      setEmail(normalizedEmail);
      setLoading(false);
    } catch {
      setError("System handshake error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="theme-transition hero-grid relative min-h-screen overflow-hidden bg-transparent font-sans antialiased tracking-tight" style={{ color: colors.text }}>
      <div className="hero-glow left-8 top-24 h-56 w-56" style={{ backgroundColor: colors.accent }} />
      <div className="hero-glow right-12 top-28 h-72 w-72" style={{ backgroundColor: "var(--accent-secondary)" }} />
      <nav
        className="fixed top-0 z-50 w-full border-b p-5 backdrop-blur-xl animate-[slideDown_0.6s_ease-out]"
        style={{ backgroundColor: colors.overlay, borderColor: colors.border }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-md shadow-lg transition-all duration-500 group-hover:rotate-360"
              style={{ backgroundColor: colors.accent, boxShadow: `0 0 20px ${colors.accent}44` }}
            >
              <Cpu size={20} className="text-white" />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>
              Dongle<span style={{ color: colors.accentLight }}>IQ</span>
            </span>
          </Link>
          <Link
            href="/login"
            className="rounded-md border px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all"
            style={{ borderColor: colors.borderSoft, color: colors.text, backgroundColor: colors.panelStrong }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex min-h-screen pt-20">
        <div className="hidden w-[55%] flex-col justify-center px-24 lg:flex" style={{ borderRight: `1px solid ${colors.borderSoft}` }}>
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="mb-8 text-6xl font-black uppercase leading-[0.9] tracking-tight" style={{ color: colors.text }}>
              Agent <br />
              <span style={{ color: colors.accent }}>Network</span>
            </h1>
            <p className="mb-12 max-w-lg text-lg font-medium leading-relaxed opacity-70" style={{ color: colors.muted }}>
              Initialize your professional profile to manage Digital Signature Certificates and IRCTC assets through our encrypted cloud infrastructure.
            </p>
            <div className="grid max-w-xl grid-cols-2 gap-4">
              {[
                { value: "Verified", label: "Email onboarding" },
                { value: "Secure", label: "Profile creation" },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`rounded-lg border p-5 ${index === 0 ? "float-slow" : "float-delay"}`}
                  style={{ borderColor: colors.borderSoft, backgroundColor: colors.card }}
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md text-white" style={{ backgroundColor: colors.accent }}>
                    <ShieldCheck size={18} />
                  </div>
                  <p className="text-xl font-black uppercase" style={{ color: colors.text }}>{item.value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: colors.muted }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="group relative w-full max-w-md animate-[fadeIn_1.2s_ease-out]">
            <div className="absolute -inset-[1.5px] rounded-lg opacity-40 blur-sm transition-opacity duration-500 group-hover:opacity-100" style={{ background: premiumGradient }} />

            <div
              className="shine-border relative w-full overflow-hidden rounded-lg border p-8 shadow-[0_20px_50px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <div className="absolute left-0 top-0 h-px w-full opacity-50" style={{ backgroundImage: `linear-gradient(to right, transparent, ${colors.accentLight}, transparent)` }} />

              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>Register</h2>
                <p className="mt-2 text-[9px] font-black uppercase tracking-[0.5em] opacity-50" style={{ color: colors.muted }}>
                  Create Account
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-center text-[10px] font-black uppercase tracking-widest text-red-500">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input rounded-md border px-4 py-3.5 text-sm font-semibold outline-none"
                  style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                />

                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="glass-input rounded-md border px-4 py-3.5 text-sm font-semibold outline-none"
                  style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                />

                <div className="relative col-span-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    className="glass-input w-full rounded-md border py-3.5 pl-10 pr-4 text-sm lowercase font-semibold outline-none"
                    style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                  />
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.muted }} />
                </div>

                <div className="col-span-2 flex items-center rounded-md border" style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, boxShadow: "0 0 0 0 transparent" }}>
                  <div className="flex items-center gap-2 pl-3" style={{ color: colors.muted }}>
                    <Smartphone size={16} />
                    <span className="text-sm font-semibold" style={{ color: colors.muted }}>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="9876543210"
                    value={number}
                    onChange={(e) => setNumber(sanitizeNumber(e.target.value))}
                    className="w-full bg-transparent p-3 text-sm outline-none"
                    style={{ color: colors.text }}
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full rounded-md border px-4 py-3.5 pr-10 text-sm font-semibold outline-none"
                    style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: colors.muted }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="glass-input w-full rounded-md border px-4 py-3.5 pr-10 text-sm font-semibold outline-none"
                    style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: colors.muted }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="col-span-2 mt-2 flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-2xl transition-all duration-500 hover:brightness-125 active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: colors.accent }}
                >
                  {loading ? "Processing..." : "Create Account"} <UserPlus size={16} />
                </button>
              </form>

              <div className="pt-4 text-center">
                <Link
                  href="/login"
                  className="text-[9px] uppercase tracking-widest underline underline-offset-4"
                  style={{ color: colors.muted }}
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

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "OTP verification failed");
          }

          router.push("/login?registered=true");
        }}
        onResend={async () => {
          const res = await fetch("/api/resend-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.message || "Failed to resend OTP");
          }
        }}
      />

      <style jsx global>{`
        @keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeInLeft { from { transform: translateX(-50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
