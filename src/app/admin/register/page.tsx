"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

import OtpModal from "@/components/OtpModal";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

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
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [existingAdminEmail, setExistingAdminEmail] = useState("");

  const premiumGradient =
    "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))";

  const sanitizeNumber = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 10);
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await fetch("/api/admin/register", { cache: "no-store" });
        const data = await res.json();

        if (res.ok && data?.success) {
          setAdminExists(Boolean(data.exists));
          setExistingAdminEmail(data.admin?.email || "");
        }
      } catch {
        // Keep the page usable even if the status check fails.
      } finally {
        setCheckingAdmin(false);
      }
    };

    void checkAdminStatus();
  }, []);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (
      !name ||
      !lastName ||
      !email ||
      !number ||
      !password ||
      !confirmPassword
    ) {
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
        if (res.status === 409) {
          setAdminExists(true);
          setExistingAdminEmail(data.email || email.toLowerCase());
        }

        setError(data.error || "Registration failed");
        return;
      }

      setShowOtp(true);
    } catch (error) {
  console.error(error);
  setError("Something went wrong");
}
  };

  return (
    <div
      className="auth-page-shell theme-transition hero-grid relative overflow-hidden bg-transparent font-sans antialiased tracking-tight text-base"
      style={{ color: colors.text }}
    >
      <div className="relative z-10 flex app-page-min-height items-stretch">
        <div
          className="hidden lg:flex lg:min-w-0 lg:flex-[0.95] lg:flex-col lg:justify-center lg:px-10 xl:px-14"
          style={{ borderRight: `1px solid ${colors.borderSoft}` }}
        >
          <div className="animate-[fadeInLeft_0.8s_ease-out]">
            <div
              className="mb-6 inline-flex rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em]"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: colors.card,
                color: colors.accent,
              }}
            >
              System administrator
            </div>
            <h1
              className="mb-5 text-4xl font-black uppercase leading-tight tracking-tight xl:text-5xl whitespace-nowrap"
              style={{ color: colors.text }}
            >
              <span>Admin </span>
              <span style={{ color: colors.accent }}>Access</span>
            </h1>
            <p 
              className="mb-7 max-w-lg font-medium leading-relaxed opacity-80"
              style={{ color: colors.muted }}
            >
              Create the primary administrator profile and unlock secure
              dashboard access with verified email onboarding.
            </p>
            <div className="grid max-w-xl grid-cols-2 gap-4">
              {[
                { value: "Verify", label: "Email onboarding" },
                { value: "Secure", label: "Admin control" },
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

        <div className="flex flex-1 items-start justify-center overflow-y-auto px-4 pb-6 pt-2 sm:px-6 lg:flex-[1.05] lg:items-center lg:px-8">
          <div className="group relative w-full max-w-md animate-[fadeIn_1.2s_ease-out]">
            <div
              className="absolute -inset-px rounded-lg opacity-20 blur-sm transition-opacity duration-500 group-hover:opacity-35 dark:opacity-40 dark:group-hover:opacity-100"
              style={{ background: premiumGradient }}
            />

            <div
              className="shine-border relative w-full overflow-hidden rounded-lg border p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:p-5"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
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
                  {adminExists ? "Admin Login" : "Register Admin"}
                </h2>
                <p
                  className="mt-1.5 font-medium opacity-80"
                  style={{ color: colors.muted }}
                >
                  {adminExists
                    ? "An administrator account already exists. Continue with login instead."
                    : "Create your admin account and activate it with email OTP verification."}
                </p>
              </div>

              {checkingAdmin ? (
                <div
                  className="mb-3 rounded-lg border px-3 py-2 text-center text-sm font-semibold"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.input,
                    color: colors.muted,
                  }}
                >
                  Checking admin status...
                </div>
              ) : null}

              {adminExists ? (
                <div
                  className="mb-3 rounded-lg border px-3 py-2 text-center text-sm font-semibold"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.input,
                    color: colors.text,
                  }}
                >
                  {existingAdminEmail
                    ? `Admin already registered with ${existingAdminEmail}.`
                    : "Admin account already registered."}
                </div>
              ) : null}

              {error ? (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 py-2 text-center text-[10px] font-black uppercase tracking-widest text-red-500">
                  {error}
                </div>
              ) : null}

              {adminExists ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="theme-primary-btn flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-xl transition-all duration-500 hover:brightness-110 active:scale-[0.98]"
                  >
                    Login as Admin
                  </button>
                  <p
                    className="text-center text-xs font-medium"
                    style={{ color: colors.muted }}
                  >
                    Already have account?{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/login")}
                      className="font-black underline underline-offset-4"
                      style={{ color: colors.accent }}
                    >
                      Login
                    </button>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-2">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="First Name"
                        className="glass-input w-full rounded-md border px-3 py-2.5 text-sm font-semibold outline-none"
                        style={{
                          backgroundColor: colors.input,
                          borderColor: colors.inputBorder,
                          color: colors.text,
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        className="glass-input w-full rounded-md border px-3 py-2.5 text-sm font-semibold outline-none"
                        style={{
                          backgroundColor: colors.input,
                          borderColor: colors.inputBorder,
                          color: colors.text,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="glass-input w-full rounded-md border px-3 py-2.5 text-sm font-semibold outline-none"
                      style={{
                        backgroundColor: colors.input,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }}
                    />
                  </div>

                  <div className="relative flex items-center">
                    <span
                      className="absolute left-4 z-10 border-r pr-3 text-sm font-bold"
                      style={{
                        color: colors.muted,
                        borderColor: colors.inputBorder,
                      }}
                    >
                      +91
                    </span>

                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      value={number}
                      onChange={(e) =>
                        setNumber(sanitizeNumber(e.target.value))
                      }
                      placeholder="7295014037"
                      className="glass-input w-full rounded-md border py-2.5 pl-20 pr-4 text-sm font-semibold outline-none"
                      style={{
                        backgroundColor: colors.input,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="glass-input w-full rounded-md border px-3 py-2.5 pr-10 text-sm font-semibold outline-none"
                          style={{
                            backgroundColor: colors.input,
                            borderColor: colors.inputBorder,
                            color: colors.text,
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1"
                          style={{ color: colors.muted }}
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm Password"
                          className="glass-input w-full rounded-md border px-3 py-2.5 pr-10 text-sm font-semibold outline-none"
                          style={{
                            backgroundColor: colors.input,
                            borderColor: colors.inputBorder,
                            color: colors.text,
                          }}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1"
                          style={{ color: colors.muted }}
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="theme-primary-btn mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[10px] font-black uppercase tracking-[0.25em] text-white shadow-xl transition-all duration-500 hover:brightness-110 active:scale-[0.98]"
                  >
                    Register Admin
                  </button>

                  <p
                    className="text-center text-xs font-medium"
                    style={{ color: colors.muted }}
                  >
                    Already have account?{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/login")}
                      className="font-black underline underline-offset-4"
                      style={{ color: colors.accent }}
                    >
                      Login As Admin
                    </button>
                  </p>
                </form>
              )}
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
