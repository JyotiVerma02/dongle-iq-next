"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import OtpModal from "@/components/OtpModal";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function AdminRegister() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const premiumGradient = isDarkMode
    ? "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))"
    : "linear-gradient(135deg, #2563eb, #0ea5e9)";

  const sanitizeNumber = (value: string) => value.replace(/\D/g, "").slice(0, 10);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name || !lastName || !email || !number || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/admin/register", {
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
        setError(data.error || "Registration failed");
        return;
      }
      setShowOtp(true);
    } catch {
      setError("System handshake error occurred");
    }
  };

  return (
    <div
      className="theme-transition hero-grid relative min-h-screen pt-20 overflow-hidden bg-transparent font-sans antialiased tracking-tight"
      style={{ color: colors.text }}
    >
      {/* Background Glows */}
      <div className="hero-glow left-0 top-12 h-56 w-56" style={{ backgroundColor: colors.accent }} />
      <div className="hero-glow right-16 top-12 h-72 w-72" style={{ backgroundColor: "var(--accent-secondary)" }} />

      <div className="relative z-10 flex h-full items-center justify-center">
        {/* Left Section - Hero */}
        <div className="hidden w-[55%] flex-col justify-center px-24 lg:flex" style={{ borderRight: `1px solid ${colors.borderSoft}` }}>
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <div
              className="shine-border mb-4 inline-flex rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.28em]"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: colors.card,
                color: colors.accentLight,
              }}
            >
              System Administrator
            </div>
            <h1 className="mb-4 text-6xl font-black uppercase leading-[0.8] tracking-tighter">
              <span style={{ color: colors.text }}>Admin</span>{" "}
              <span className="gradient-text">Access</span>
            </h1>
            <p className="mb-8 max-w-md text-base font-medium leading-relaxed opacity-70" style={{ color: colors.muted }}>
              Create a primary administrator profile. Secure multi-factor authentication is required before dashboard activation.
            </p>
            
            <div className="grid max-w-sm grid-cols-2 gap-3">
              <div
                className="float-slow rounded-[1.2rem] border p-4"
                style={{ borderColor: colors.borderSoft, backgroundColor: colors.card }}
              >
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: premiumGradient }}>
                  <ShieldCheck size={16} />
                </div>
                <p className="text-lg font-black uppercase" style={{ color: colors.text }}>Verify</p>
                <p className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: colors.muted }}>Email OTP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="group relative w-full max-w-md animate-[fadeIn_1.2s_ease-out]">
            <div className="absolute -inset-[1px] rounded-[15px] opacity-30 blur-sm transition-opacity duration-500 group-hover:opacity-80" style={{ background: premiumGradient }} />

            <div
              className="shine-border relative w-full overflow-hidden rounded-[15px] border p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-2xl"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              }}
            >
              <div className="absolute left-0 top-0 h-px w-full opacity-50" style={{ backgroundImage: `linear-gradient(to right, transparent, ${colors.accentLight}, transparent)` }} />

              <div className="mb-5 text-center lg:text-left">
                <h2 className="text-xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>Register Admin</h2>
                <p className="mt-1 text-[8px] font-black uppercase tracking-[0.5em] opacity-50" style={{ color: colors.muted }}>
                  Secure Onboarding
                </p>
              </div>

              {error && (
                <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 py-1.5 text-center text-[9px] font-black uppercase tracking-widest text-red-500">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-0.5">
                    <label className="text-[8px] uppercase tracking-widest opacity-50" style={{ color: colors.muted }}>First Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="First"
                      className="glass-input w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none"
                      style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] uppercase tracking-widest opacity-50" style={{ color: colors.muted }}>Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last"
                      className="glass-input w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none"
                      style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[8px] uppercase tracking-widest opacity-50" style={{ color: colors.muted }}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@dongleiq.com"
                    className="glass-input w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none"
                    style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="text-[8px] uppercase tracking-widest opacity-50" style={{ color: colors.muted }}>Phone (+91)</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={number}
                    onChange={(e) => setNumber(sanitizeNumber(e.target.value))}
                    placeholder="9876543210"
                    className="glass-input w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none"
                    style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                        <label className="text-[8px] uppercase tracking-widest opacity-50" style={{ color: colors.muted }}>Password</label>
                        <div className="relative">
                            <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••"
                            className="glass-input w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none"
                            style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                            />
                            <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: colors.muted }}
                            onClick={() => setShowPassword(!showPassword)}
                            >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-0.5">
                        <label className="text-[8px] uppercase tracking-widest opacity-50" style={{ color: colors.muted }}>Confirm</label>
                        <div className="relative">
                            <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••"
                            className="glass-input w-full rounded-xl border px-3.5 py-2.5 text-xs font-semibold outline-none"
                            style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                            />
                            <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: colors.muted }}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                            {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                  type="submit"
                  className="theme-primary-btn mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-xl transition-all duration-500 hover:brightness-110 active:scale-[0.98]"
                >
                  Register Admin
                </button>
              </form>
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
            setError(data.message || "OTP verification failed");
            return;
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
            setError(data.message || "Could not resend OTP");
          }
        }}
      />
    </div>
  );
}