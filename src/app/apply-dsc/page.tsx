"use client";

import React, { Suspense, useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RefreshCw,
  Search,
  ShieldCheck,
  Lock,
  Phone,
  Compass
} from "lucide-react";
import toast from "react-hot-toast";

import DSCStepHeader from "@/components/DSCStepHeader";
import BankTelecomForm from "@/components/BankTelecomForm";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

type TrackResult = {
  status: string;
  _id: string;
  name: string;
};

function createCaptcha() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function normalizeMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function ApplyDSCContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const flowSource = searchParams.get("from") === "dashboard" ? "dashboard" : "landing";

  const premiumGradient =
    "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))";

  const [activeTab, setActiveTab] = useState<"apply" | "track">("apply");
  const [applyStep, setApplyStep] = useState<1 | 2>(1);
  const [hasJustSubmitted, setHasJustSubmitted] = useState(false);
  const [applicantType, setApplicantType] = useState<"Indian" | "Foreign">("Indian");
  const [mobile, setMobile] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [gateError, setGateError] = useState("");

  const [trackInput, setTrackInput] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<TrackResult | null>(null);
  const [trackError, setTrackError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const canAccessTrack = flowSource === "dashboard" || hasJustSubmitted;

  useEffect(() => {
    fetch("/api/me")
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Card Interactive Dynamic Glow Properties
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const normalizedMobile = useMemo(() => normalizeMobile(mobile), [mobile]);
  const canSendOtp =
    applicantType === "Indian" &&
    /^[6-9]\d{9}$/.test(normalizedMobile) &&
    captchaInput.trim() === captcha;

  useEffect(() => {
    if (searchParams.get("guest_success") === "true") {
      setHasJustSubmitted(true);
      setActiveTab("track");
      const savedMobile = sessionStorage.getItem("guestMobile");
      if (savedMobile) setTrackInput(savedMobile);
      sessionStorage.removeItem("verifiedMobile");
      sessionStorage.removeItem("guestMobile");
      setMobile("");
      setOtp("");
      setOtpSent(false);
      toast.success("Application successfully submitted!", { duration: 5000 });
      router.replace(`/apply-dsc?from=${flowSource}`);
    }
  }, [flowSource, searchParams, router]);

  useEffect(() => {
    const savedMobile = sessionStorage.getItem("verifiedMobile");
    if (savedMobile && /^[6-9]\d{9}$/.test(savedMobile)) {
      setMobile(savedMobile);
    }
  }, []);

  useEffect(() => {
    setCaptcha(createCaptcha());
  }, []);

  const refreshCaptcha = () => {
    setCaptcha(createCaptcha());
    setCaptchaInput("");
    setGateError("");
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (applicantType === "Foreign") {
      setGateError("Foreign applicant flow needs assisted support. Please request a custom quote.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
      setGateError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (captchaInput.trim() !== captcha) {
      setGateError("Captcha does not match. Please try again.");
      refreshCaptcha();
      return;
    }
    setGateError("");
    setSendingOtp(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: normalizedMobile }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Could not send OTP.");
      setOtpSent(true);
      sessionStorage.setItem("guestMobile", normalizedMobile);
      toast.success("OTP sent successfully.");
    } catch (error) {
      setGateError(error instanceof Error ? error.message : "Could not send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setGateError("Enter the 6-digit OTP.");
      return;
    }
    setGateError("");
    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: normalizedMobile, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "OTP verification failed.");
      sessionStorage.setItem("verifiedMobile", normalizedMobile);
      sessionStorage.setItem("guestMobile", normalizedMobile);
      toast.success("Mobile verified. Continue your DSC application.");
      setApplyStep(2);
    } catch (error) {
      setGateError(error instanceof Error ? error.message : "OTP verification failed.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleTrackSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!trackInput.trim()) return;
    setTrackLoading(true);
    setTrackError("");
    setTrackResult(null);
    try {
      const res = await fetch(`/api/track-application?query=${encodeURIComponent(trackInput.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Application not found");
      setTrackResult(data.application);
    } catch (error) {
      setTrackError(error instanceof Error ? error.message : "Application not found");
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <main
      suppressHydrationWarning
      className="auth-page-shell theme-transition relative h-screen w-screen font-sans overflow-hidden flex flex-col select-none"
      style={{ color: colors.text, background: "transparent" }}
    >
      {/* Background Neon Spotlights – theme-aware */}
      <div
        className="absolute top-[20%] left-[-5%] w-[380px] h-[380px] rounded-full blur-[110px] pointer-events-none"
        style={{ background: isDarkMode ? "rgba(139,92,246,0.10)" : "rgba(139,92,246,0.06)" }}
      />
      <div
        className="absolute top-[35%] right-[-5%] w-[350px] h-[350px] rounded-full blur-[110px] pointer-events-none"
        style={{ background: isDarkMode ? "rgba(56,189,248,0.05)" : "rgba(56,189,248,0.04)" }}
      />

      <div className="w-full flex flex-col h-full relative z-10">

        <DSCStepHeader
          activeStep={applyStep === 2 ? 2 : (activeTab === "track" && hasJustSubmitted) ? 4 : 1}
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === "apply" && applyStep === 2) {
              setApplyStep(1);
            }
            setActiveTab(tab);
          }}
          showTrackTab={canAccessTrack}
          onStepChange={(step) => {
            if (step === 1) setApplyStep(1);
            if (step === 2) setApplyStep(2);
          }}
        />

        {/* Content area below topbar */}
        <div className="flex-1 flex flex-col justify-between px-4 py-4 min-h-0">

        {/* Viewport Card Container */}
        <div className={activeTab === "apply" && applyStep === 2 ? "flex-1 min-h-0 overflow-y-auto py-2" : "flex-1 flex items-center justify-center py-2 min-h-0"}>
          {activeTab === "apply" ? (
            applyStep === 1 ? (
            /* Apply Card with Dynamic Radial Neon Follow Blur */
            <section
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative w-full max-w-[440px] rounded-[20px] p-6 md:p-7 flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-2xl"
              style={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                boxShadow: isHovered
                  ? `0 20px 50px -12px ${colors.accentShadow}, 0 0 20px 1px ${colors.accentFaint}`
                  : `var(--shadow-deep)`,
              }}
            >
              {/* Dynamic Interactive Tracking Radial Glow Layer */}
              <div
                className="pointer-events-none absolute -inset-px rounded-[20px] transition-opacity duration-300"
                style={{
                  opacity: isHovered ? 1 : 0,
                  background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, ${colors.accentSoft}, transparent 80%)`,
                }}
              />
              {/* Subtle Border Glow Mapping */}
              <div
                className="pointer-events-none absolute -inset-px rounded-[20px] transition-opacity duration-300"
                style={{
                  opacity: isHovered ? 0.7 : 0,
                  background: `radial-gradient(110px circle at ${mousePos.x}px ${mousePos.y}px, var(--accent-soft), transparent 60%)`,
                  maskImage: "linear-gradient(white, white)",
                  WebkitMaskImage: "linear-gradient(white, white)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px",
                }}
              />

              <div className="relative z-10">
                {/* Header Profile Title Row */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: colors.accentSoft,
                      border: `1px solid ${colors.accentSubtle}`,
                      color: "var(--accent)",
                    }}
                  >
                    <Compass size={16} className="stroke-[1.8]" />
                  </div>
                  <div>
                    <span
                      className="text-[9px] font-bold uppercase tracking-[0.2em] block"
                      style={{ color: "var(--accent)" }}
                    >
                      Step 1 of 4
                    </span>
                    <h2 className="text-base font-bold tracking-tight mt-0.5" style={{ color: colors.text }}>
                      Apply for Digital Signature
                    </h2>
                    <p className="text-[11px]" style={{ color: colors.muted }}>
                      Verify mobile number to establish identity
                    </p>
                  </div>
                </div>

                <hr className="mb-4" style={{ borderColor: colors.borderSoft }} />

                <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-3.5">

                  {/* Applicant Type Selection Section */}
                  <div className="space-y-1">
                    <label
                      className="text-[9px] font-bold uppercase tracking-widest block"
                      style={{ color: colors.subtleText }}
                    >
                      Applicant Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["Indian", "Foreign"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setApplicantType(type)}
                          className="flex h-10 items-center gap-2 rounded-xl px-3 text-[12px] font-medium transition-all"
                          style={
                            applicantType === type
                              ? {
                                  background: colors.accentSoft,
                                  border: `1px solid var(--accent)`,
                                  color: colors.text,
                                  boxShadow: `0 0 12px ${colors.accentFaint}`,
                                }
                              : {
                                  background: colors.input,
                                  border: `1px solid ${colors.inputBorder}`,
                                  color: colors.muted,
                                }
                          }
                        >
                          <div
                            className="w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all"
                            style={{
                              borderColor: applicantType === type ? "var(--accent)" : colors.muted,
                            }}
                          >
                            {applicantType === type && (
                              <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: "var(--accent)" }}
                              />
                            )}
                          </div>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Input Field */}
                  <div className="space-y-1">
                    <label
                      className="text-[9px] font-bold uppercase tracking-widest block"
                      style={{ color: colors.subtleText }}
                    >
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone
                        size={13}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color: colors.muted }}
                      />
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={mobile}
                        disabled={otpSent}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter mobile number"
                        className="glass-input h-10 w-full rounded-xl pl-9 pr-3 text-[12px] font-medium outline-none transition-all"
                        style={{
                          background: colors.input,
                          border: `1px solid ${colors.inputBorder}`,
                          color: colors.text,
                        }}
                      />
                    </div>
                  </div>

                  {/* Code Security Block Group Row Frame */}
                  {!otpSent ? (
                    <div className="space-y-1">
                      <label
                        className="text-[9px] font-bold uppercase tracking-widest block"
                        style={{ color: colors.subtleText }}
                      >
                        Captcha Verification
                      </label>
                      <div className="grid grid-cols-[1fr_85px_38px] gap-2">
                        <div className="relative">
                          <Lock
                            size={13}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2"
                            style={{ color: colors.muted }}
                          />
                          <input
                            type="text"
                            inputMode="numeric"
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="Code"
                            className="glass-input h-10 w-full rounded-xl pl-9 pr-3 text-[12px] font-medium outline-none transition-all"
                            style={{
                              background: colors.input,
                              border: `1px solid ${colors.inputBorder}`,
                              color: colors.text,
                            }}
                          />
                        </div>
                        <div
                          className="flex h-10 items-center justify-center rounded-xl text-sm font-black tracking-[0.15em] font-mono select-none"
                          style={{
                            background: colors.accentSoft,
                            border: `1px solid ${colors.accentSubtle}`,
                            color: "var(--accent)",
                          }}
                        >
                          {captcha}
                        </div>
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          className="flex h-10 items-center justify-center rounded-xl transition-all hover:opacity-70"
                          style={{
                            background: colors.input,
                            border: `1px solid ${colors.inputBorder}`,
                            color: colors.muted,
                          }}
                        >
                          <RefreshCw size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Dynamic Entry Screen Row Display */
                    <div className="space-y-1">
                      <label
                        className="text-[9px] font-bold uppercase tracking-widest block"
                        style={{ color: colors.subtleText }}
                      >
                        Enter OTP Code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="6-digit OTP"
                        className="glass-input h-10 w-full rounded-xl text-center text-sm font-bold tracking-[0.2em] outline-none transition-all"
                        style={{
                          background: colors.input,
                          border: `1px solid var(--accent)`,
                          color: colors.text,
                        }}
                      />
                    </div>
                  )}

                  {gateError && (
                    <p
                      className="text-[11px] font-semibold p-2 rounded-xl"
                      style={{
                        color: isDarkMode ? "#fda4af" : "#9f1239",
                        background: isDarkMode ? "rgba(244,63,94,0.10)" : "rgba(244,63,94,0.07)",
                        border: `1px solid ${isDarkMode ? "rgba(244,63,94,0.22)" : "rgba(244,63,94,0.18)"}`,
                      }}
                    >
                      {gateError}
                    </p>
                  )}

                  {/* Trigger Call Action Execution Controller */}
                  <button
                    type="submit"
                    disabled={otpSent ? verifyingOtp : sendingOtp || !canSendOtp}
                    className="w-full h-10 rounded-xl text-white text-[10px] font-extrabold uppercase tracking-[0.12em] transition-all flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] hover:brightness-110"
                    style={{
                      background: premiumGradient,
                      boxShadow: `0 8px 24px -8px ${colors.accentShadow}`,
                    }}
                  >
                    <ShieldCheck size={13} className="stroke-[2.5]" />
                    {otpSent
                      ? verifyingOtp
                        ? "Verifying..."
                        : "Verify & Continue"
                      : sendingOtp
                      ? "Sending..."
                      : "Get OTP"}
                  </button>
                </form>
              </div>

              {/* Secure Architecture Cryptographic Compliance Labels Row */}
              <div
                className="relative z-10 flex items-center justify-center gap-5 mt-5 pt-3.5 text-[9px] font-bold uppercase tracking-wider shrink-0"
                style={{
                  borderTop: `1px solid ${colors.borderSoft}`,
                  color: colors.muted,
                }}
              >
                <div className="flex items-center gap-1">
                  <ShieldCheck size={11} className="stroke-[2.5]" style={{ color: colors.muted }} />
                  256-bit Secure
                </div>
                <div className="w-[1px] h-2.5" style={{ background: colors.borderSoft }} />
                <div className="flex items-center gap-1">
                  <ShieldCheck size={11} className="stroke-[2.5]" style={{ color: colors.muted }} />
                  CCA Certified
                </div>
              </div>
            </section>
            ) : (
              <div className="w-full max-w-none"><BankTelecomForm embedded onBack={() => setApplyStep(1)} /></div>
            )
          ) : (
            activeTab === "track" && (
            isLoggedIn === false ? (
              <div className="w-full max-w-[440px]">
                <div
                  className="group relative rounded-[20px] p-6 md:p-8 overflow-hidden transition-all duration-300 shadow-2xl"
                  style={{
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="relative z-10 text-center space-y-5">
                    <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-rose-500/10 mb-2">
                      <Lock size={24} className="text-rose-500" />
                    </div>
                    
                    <h2 className="text-lg font-black tracking-tight" style={{ color: colors.text }}>
                      Account Required
                    </h2>
                    
                    <div className="text-left space-y-3 pt-2 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                        <span className="text-[11px] font-semibold" style={{ color: colors.muted }}>Track your DSC application</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                        <span className="text-[11px] font-semibold" style={{ color: colors.muted }}>Receive status updates</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                        <span className="text-[11px] font-semibold" style={{ color: colors.muted }}>Download issued certificates</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                        <span className="text-[11px] font-semibold" style={{ color: colors.muted }}>Manage renewals</span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push("/register")}
                      className="w-full h-11 rounded-xl text-white text-[11px] font-extrabold uppercase tracking-wider transition-all hover:brightness-110 shadow-lg"
                      style={{
                        background: premiumGradient,
                        boxShadow: `0 8px 24px -8px ${colors.accentShadow}`,
                      }}
                    >
                      Create  Account
                    </button>
                  </div>
                </div>
              </div>
            ) : (
            /* Search Tracking Board Module */
            <div className="w-full max-w-[440px]">
              <div
                className="group relative rounded-[20px] p-6 md:p-7 overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-[0_20px_50px_-12px_var(--accent-shadow),0_0_20px_1px_var(--accent-faint)]"
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="relative z-10">
                  <h2
                    className="mb-4 text-center text-sm font-bold tracking-tight"
                    style={{ color: colors.text }}
                  >
                    Track Application Status
                  </h2>

                  <form onSubmit={handleTrackSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label
                        className="text-[9px] font-bold uppercase tracking-widest block"
                        style={{ color: colors.subtleText }}
                      >
                        Application Query Reference
                      </label>
                      <div className="relative">
                        <Search
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          size={13}
                          style={{ color: colors.muted }}
                        />
                        <input
                          type="text"
                          value={trackInput}
                          onChange={(e) => setTrackInput(e.target.value)}
                          placeholder="Enter mobile or Application ID"
                          className="glass-input w-full h-10 rounded-xl pl-9 pr-3 text-[12px] font-medium outline-none transition-all"
                          style={{
                            background: colors.input,
                            border: `1px solid ${colors.inputBorder}`,
                            color: colors.text,
                          }}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={trackLoading}
                      className="w-full h-10 rounded-xl text-white text-[10px] font-extrabold uppercase tracking-wider transition-all hover:brightness-110 disabled:opacity-50"
                      style={{
                        background: premiumGradient,
                        boxShadow: `0 8px 24px -8px ${colors.accentShadow}`,
                      }}
                    >
                      {trackLoading ? "Searching..." : "Track Status"}
                    </button>
                  </form>

                  {trackError && (
                    <div
                      className="mt-4 rounded-xl p-3 text-center"
                      style={{
                        background: isDarkMode ? "rgba(244,63,94,0.08)" : "rgba(244,63,94,0.06)",
                        border: `1px solid ${isDarkMode ? "rgba(244,63,94,0.22)" : "rgba(244,63,94,0.18)"}`,
                      }}
                    >
                      <p
                        className="text-[11px] font-semibold"
                        style={{ color: isDarkMode ? "#fda4af" : "#9f1239" }}
                      >
                        {trackError}
                      </p>
                    </div>
                  )}

                  {trackResult && (
                    <div
                      className="mt-4 rounded-xl p-3.5 space-y-2.5"
                      style={{
                        background: colors.input,
                        border: `1px solid ${colors.borderSoft}`,
                      }}
                    >
                      <div
                        className="flex items-center justify-between pb-2"
                        style={{ borderBottom: `1px solid ${colors.borderSoft}` }}
                      >
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider"
                          style={{ color: colors.muted }}
                        >
                          Applicant
                        </span>
                        <span className="text-[12px] font-semibold" style={{ color: colors.text }}>
                          {trackResult.name}
                        </span>
                      </div>
                      <div
                        className="flex items-center justify-between pb-2"
                        style={{ borderBottom: `1px solid ${colors.borderSoft}` }}
                      >
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider"
                          style={{ color: colors.muted }}
                        >
                          ID Reference
                        </span>
                        <span
                          className="font-mono text-[11px]"
                          style={{ color: "var(--accent)" }}
                        >
                          {trackResult._id}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-0.5">
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider"
                          style={{ color: colors.muted }}
                        >
                          Status
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            trackResult.status === "approved"
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : trackResult.status === "rejected"
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}
                        >
                          {trackResult.status}
                        </span>
                      </div>

                      {trackResult.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => router.push(`/bank-telecom-form?mobile=${trackInput}&guest=true&from=${flowSource}`)}
                          className="mt-1 w-full h-8 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors hover:opacity-80"
                          style={{
                            border: `1px solid ${colors.accentSubtle}`,
                            color: "var(--accent)",
                            background: colors.accentFaint,
                          }}
                        >
                          Complete Form
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            )
          )
        )}
        </div>

        {/* Minimal Footer Label */}
        <footer
          className="h-4 shrink-0 text-center text-[9px] uppercase tracking-widest"
          style={{ color: colors.muted }}
        >
          © {new Date().getFullYear()} DongleIQ.
        </footer>
        </div>{/* end content area */}
      </div>
    </main>
  );
}

export default function ApplyDSCPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen" style={{ background: "var(--background)" }} />}>
      <ApplyDSCContent />
    </Suspense>
  );
}



