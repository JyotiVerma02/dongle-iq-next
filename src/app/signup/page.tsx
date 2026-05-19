"use client";

import { Suspense, useState } from "react";
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
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleEmail = (searchParams.get("email") || "").toLowerCase();
  const googleName = searchParams.get("name") || "";

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
  const premiumGradient =
    "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))";

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
    } catch (error) {
      console.error("Registration error:", error);
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="auth-page-shell theme-transition relative overflow-hidden bg-transparent font-sans antialiased tracking-tight"
      style={{ color: colors.text }}
    >
      <div className="relative z-10 flex w-full app-page-min-height items-center justify-center py-6 sm:py-8">
        {/* --- START OF ULTRA-WIDE FIX CONTAINER --- */}
        <div className="content-container flex flex-col items-center justify-center lg:flex-row lg:gap-10 xl:gap-16">
          {/* ASIDE SECTION: Information */}
          <div
            className="hidden lg:flex lg:w-full lg:max-w-[32rem] lg:flex-col lg:justify-center lg:pr-8 xl:max-w-[34rem] xl:pr-12"
            style={{ borderRight: `1px solid ${colors.borderSoft}` }}
          >
            <div className="animate-[fadeInLeft_0.8s_ease-out]">
              <h1
                className="mb-5 text-4xl font-black uppercase leading-tight tracking-tight xl:text-5xl"
                style={{ color: colors.text }}
              >
                <span>Agent </span>
                <span className="text-gradient-brand">Network</span>
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
                    className={`auth-aside-card rounded-xl p-4 ${index === 0 ? "float-slow" : "float-delay"}`}
                    style={{
                      borderColor: colors.borderSoft,
                      backgroundColor: colors.card,
                    }}
                  >
                    <div
                      className="mb-3 flex h-11 w-11 items-center justify-center rounded-md text-white"
                      style={{ background: premiumGradient }}
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

          {/* FORM SECTION: Register Card */}
          <div className="no-scrollbar flex w-full max-w-md items-center justify-center px-4 py-8 lg:px-0">
            <div className="group relative w-full max-w-[32rem] animate-[fadeIn_1.2s_ease-out]">
              <div
                className="absolute -inset-px rounded-xl opacity-35 blur-sm transition-opacity duration-500 group-hover:opacity-90"
                style={{ background: premiumGradient }}
              />

              <div
                className="auth-card shine-border relative w-full overflow-hidden p-4 sm:p-5 md:p-6"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <div className="mb-4 text-center lg:text-left">
                  <h2
                    className="text-xl font-black uppercase tracking-tight"
                    style={{ color: colors.text }}
                  >
                    <span className="text-gradient-cool">Register</span>
                  </h2>
                  <p
                    className="mt-1.5 text-xs font-medium opacity-80"
                    style={{ color: colors.muted }}
                  >
                    Create your agent account and manage applications securely.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-center text-[10px] font-black uppercase tracking-widest text-red-500">
                    {error}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="glass-input rounded-lg border px-3 py-2.5 text-sm font-semibold outline-none"
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
                      className="glass-input rounded-lg border px-3 py-2.5 text-sm font-semibold outline-none"
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
                      className="glass-input w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm lowercase font-semibold outline-none"
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
                    className="phone-field flex h-11 items-center overflow-hidden rounded-lg border sm:h-12"
                    style={{
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                    }}
                  >
                    <div
                      className="phone-prefix flex h-full items-center gap-2 px-3"
                      style={{
                        color: colors.muted,
                        borderRight: `1px solid ${colors.borderSoft}`,
                      }}
                    >
                      <Smartphone size={16} />
                      <span className="text-sm font-semibold">+91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Phone Number"
                      value={number}
                      onChange={(e) =>
                        setNumber(sanitizeNumber(e.target.value))
                      }
                      className="h-full w-full bg-transparent px-3 text-sm font-semibold outline-none"
                      style={{ color: colors.text }}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="glass-input w-full rounded-lg border px-3 py-2.5 pr-10 text-sm font-semibold outline-none"
                        style={{
                          backgroundColor: colors.input,
                          borderColor: colors.inputBorder,
                          color: colors.text,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: colors.muted }}
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="glass-input w-full rounded-lg border px-3 py-2.5 pr-10 text-sm font-semibold outline-none"
                        style={{
                          backgroundColor: colors.input,
                          borderColor: colors.inputBorder,
                          color: colors.text,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
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
                    className="theme-primary-btn mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all duration-500 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Create Account"}{" "}
                    <UserPlus size={16} />
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
        {/* --- END OF ULTRA-WIDE FIX CONTAINER --- */}
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
          if (!res.ok)
            throw new Error(data.message || "OTP verification failed");
          router.push("/login?registered=true");
        }}
        onResend={async () => {
          const res = await fetch("/api/resend-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (!res.ok) throw new Error("Failed to resend OTP");
        }}
      />

      <style jsx global>{`
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
    <Suspense fallback={<div className="min-h-dvh bg-transparent" />}>
      <RegisterContent />
    </Suspense>
  );
}
