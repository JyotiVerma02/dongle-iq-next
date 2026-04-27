"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
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

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navOffsetClass = "pt-24 md:pt-28";
  const googleEmail = (searchParams.get("email") || "").toLowerCase();
  const googleName = searchParams.get("name") || "";
  const isGooglePrefill = searchParams.get("google") === "1";
  
  const [prefillFirstName, ...prefillLastNameParts] = googleName.split(" ");
  const prefillLastName = prefillLastNameParts.join(" ");

  const [showOtp, setShowOtp] = useState(false);
  const [name, setName] = useState(prefillFirstName || "");
  const [lastName, setLastName] = useState(prefillLastName || "");
  const [email, setEmail] = useState(googleEmail);
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



  const sanitizeNumber = (value: string) =>
    value.replace(/\D/g, "").slice(0, 10);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const effectiveName = name.trim();
    const effectiveLastName = lastName.trim();
    const effectiveEmail = email.toLowerCase().trim();

    if (
      !effectiveName ||
      !effectiveLastName ||
      !effectiveEmail ||
      !number ||
      !password ||
      !confirmPassword
    ) {
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
          name: `${effectiveName} ${effectiveLastName}`,
          email: effectiveEmail,
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
      setEmail(effectiveEmail);
      setLoading(false);
    } catch {
      setError("System handshake error occurred.");
      setLoading(false);
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="theme-transition hero-grid relative min-h-[100dvh] overflow-hidden bg-transparent font-sans antialiased tracking-tight"
      style={{ color: colors.text }}
    >
      <div
        className={`relative z-10 flex min-h-screen items-stretch ${navOffsetClass}`}
      >
        <div
          className="hidden lg:flex lg:min-w-0 lg:flex-[0.95] lg:flex-col lg:justify-center lg:px-10 xl:px-14"
          style={{ borderRight: `1px solid ${colors.borderSoft}` }}
        >
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <h1
              className="mb-5 text-4xl font-black uppercase leading-tight tracking-tight xl:text-5xl"
              style={{ color: colors.text }}
            >
              <span>Agent </span>
              <span style={{ color: colors.accent }}>Network</span>
            </h1>
            <p
              className="mb-7 max-w-lg text-sm font-medium leading-relaxed opacity-80"
              style={{ color: colors.muted }}
            >
              Initialize your professional profile to manage Digital Signature
              Certificates and IRCTC assets through our encrypted cloud
              infrastructure.
            </p>
            <div className="grid max-w-xl grid-cols-2 gap-4">
              {[
                { value: "Verified", label: "Email onboarding" },
                { value: "Secure", label: "Profile creation" },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`rounded-lg border p-4 ${index === 0 ? "float-slow" : "float-delay"}`}
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.card,
                  }}
                >
                  <div
                    className="mb-3 flex h-11 w-11 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <p
                    className="text-xl font-black uppercase"
                    style={{ color: colors.text }}
                  >
                    {item.value}
                  </p>
                  <p
                    className="mt-1 text-[10px] font-black uppercase tracking-[0.22em]"
                    style={{ color: colors.muted }}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="no-scrollbar flex flex-1 items-start justify-center overflow-y-auto px-4 pb-6 pt-2 sm:px-6 lg:flex-[1.05] lg:items-center lg:px-8">
          <div className="group relative w-full max-w-md animate-[fadeIn_1.2s_ease-out]">
            <div
              className="absolute -inset-[1px] rounded-lg opacity-40 blur-sm transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: premiumGradient }}
            />

            <div
              className="shine-border relative w-full overflow-hidden rounded-lg border p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:p-5"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <div
                className="absolute left-0 top-0 h-px w-full opacity-50"
                style={{
                  backgroundImage: `linear-gradient(to right, transparent, ${colors.accentLight}, transparent)`,
                }}
              />

              <div className="mb-2.5 text-center lg:text-left">
                <h2
                  className="text-xl font-black uppercase tracking-tight"
                  style={{ color: colors.text }}
                >
                  Register
                </h2>
                <p
                  className="mt-1.5 text-xs font-medium opacity-80"
                  style={{ color: colors.muted }}
                >
                  Create your agent account and manage applications securely.
                </p>
              </div>

              {isGooglePrefill && (
                <div
                  className="mb-3 rounded-lg border border-slate-500/10 bg-slate-500/10 px-3 py-2 text-center text-sm font-semibold text-slate-700"
                  style={{ color: colors.text }}
                >
                  Google authentication verified. Continue to complete your
                  registration.
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-center text-[10px] font-black uppercase tracking-widest text-red-500">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-2">
                {/* <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/signup" })}
                  className="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
                  style={{
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  }}
                >
                  <FcGoogle size={18} />Sign up with Google
                </button> */}

                {/* <div
                  className="flex items-center gap-3 text-[8px] uppercase tracking-[0.3em]"
                  style={{ color: colors.muted }}
                 >
                  <span
                    className="flex-1 border-t"
                    style={{
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.22)"
                        : "rgba(0,0,0,0.35)",
                    }}
                  />
                  <span>or sign up with email</span>
                  <span
                    className="flex-1 border-t"
                    style={{
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.22)"
                        : "rgba(0,0,0,0.35)",
                    }}
                  />
                </div> */}

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input rounded-md border px-3 py-2.5 text-sm font-semibold outline-none"
                    style={{
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="glass-input rounded-md border px-3 py-2.5 text-sm font-semibold outline-none"
                    style={{
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    }}
                  />
                </div>

                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    className="glass-input w-full rounded-md border py-2.5 pl-9 pr-3 text-sm lowercase font-semibold outline-none"
                    style={{
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    }}
                  />
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: colors.muted }}
                  />
                </div>

                <div
                  className="phone-field flex items-center rounded-md border"
                  style={{
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    boxShadow: "0 0 0 0 transparent",
                  }}
                >
                  <div
                    className="flex items-center gap-2 pl-3"
                    style={{ color: colors.muted }}
                  >
                    <Smartphone size={16} />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: colors.muted }}
                    >
                      +91
                    </span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="9876543210"
                    value={number}
                    onChange={(e) => setNumber(sanitizeNumber(e.target.value))}
                    className="w-full rounded-r-md bg-transparent px-3 py-2.5 text-sm outline-none"
                    style={{ color: colors.text }}
                  />
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input w-full rounded-md border px-3 py-2.5 pr-10 text-sm font-semibold outline-none"
                      style={{
                        backgroundColor: colors.input,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }}
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
                      className="glass-input w-full rounded-md border px-3 py-2.5 pr-10 text-sm font-semibold outline-none"
                      style={{
                        backgroundColor: colors.input,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: colors.muted }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all duration-500 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: colors.accent }}
                >
                  {loading ? "Processing..." : "Create Account"}{" "}
                  <UserPlus size={16} />
                </button>
              </form>

              <div className="pt-2 text-center">
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
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeInLeft {
          from {
            transform: translateX(-50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-transparent" />}>
      <RegisterContent />
    </Suspense>
  );
}
