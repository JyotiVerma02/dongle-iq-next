"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
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
        headers: {
          "Content-Type": "application/json",
        },
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
      setError("Something went wrong");
    }
  };

  return (
    <div
      className="theme-transition relative mt-10 min-h-screen overflow-hidden bg-transparent font-sans antialiased tracking-tight"
      style={{ color: colors.text }}
    >
      <div className="relative z-10 flex min-h-screen">
        <div className="hidden w-[55%] flex-col justify-center px-16 lg:flex" style={{ borderRight: `1px solid ${colors.borderSoft}` }}>
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1 className="mb-8 text-7xl font-black uppercase italic leading-[0.8] tracking-tighter">
              Admin
              <span className="bg-linear-to-r from-purple-600 via-purple-300 to-white bg-clip-text text-transparent animate-gradient">
                {" "}
                Access
              </span>
            </h1>

            <p
              className="mb-12 max-w-lg text-lg font-medium leading-relaxed opacity-70"
              style={{ color: colors.muted }}
            >
              Register a single admin account, then verify the email OTP before dashboard access is activated.
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="group relative animate-[fadeIn_1.2s_ease-out]">
            <div className="absolute -inset-[1.5px] rounded-4xl bg-linear-to-r from-purple-600 via-transparent to-purple-600 opacity-30 blur-sm transition-opacity duration-500 group-hover:opacity-100" />

            <div
              className="relative w-full max-w-sm overflow-hidden rounded-xl border p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <div className="absolute left-0 top-0 h-px w-full bg-linear-to-r from-transparent via-purple-400 to-transparent opacity-50" />

              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                  Admin <span className="text-purple-500">Register</span>
                </h2>
                <p className="mt-3 text-[9px] font-black uppercase tracking-[0.5em] opacity-50">
                  Verify Before Access
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-center text-[10px] font-black uppercase tracking-widest text-red-500">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border p-2.5 text-xs outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                    style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                  />

                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border p-2.5 text-xs outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                    style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border p-2.5 text-xs outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                    style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                  />

                  <div className="flex items-center rounded-lg border focus-within:ring-4 focus-within:ring-purple-500/10" style={{ backgroundColor: colors.input, borderColor: colors.inputBorder }}>
                    <span className="px-3 text-xs font-bold" style={{ color: colors.muted }}>+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="9876543210"
                      value={number}
                      onChange={(e) => setNumber(sanitizeNumber(e.target.value))}
                      className="w-full bg-transparent p-2.5 text-xs outline-none"
                      style={{ color: colors.text }}
                    />
                  </div>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border p-2.5 text-xs outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                    style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                  />
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 -translate-y-1/2"
                    style={{ color: colors.muted }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border p-2.5 text-xs outline-none transition-all focus:ring-4 focus:ring-purple-500/10"
                    style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                  />
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 -translate-y-1/2"
                    style={{ color: colors.muted }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg py-2.5 text-[12px] font-black uppercase tracking-[0.3em] text-white shadow-2xl transition-all duration-500 hover:brightness-125 active:scale-[0.98]"
                  style={{
                    backgroundColor: colors.accent,
                    boxShadow: `0 15px 35px -10px ${colors.accent}aa`,
                  }}
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

      <style jsx global>{`
        @keyframes fadeInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
