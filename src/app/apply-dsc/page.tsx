"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

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
  const fieldSurface = isDarkMode ? "#151a2d" : colors.input;
  const fieldBorder = isDarkMode
    ? "rgba(139, 92, 246, 0.45)"
    : colors.inputBorder;
  const fieldText = isDarkMode ? "#ffffff" : colors.text;

  const [activeTab, setActiveTab] = useState<"apply" | "track">("apply");
  const [applicantType, setApplicantType] = useState<"Indian" | "Foreign">(
    "Indian",
  );
  const [mobile, setMobile] = useState("");
const [captcha, setCaptcha] = useState("");  const [captchaInput, setCaptchaInput] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [gateError, setGateError] = useState("");

  const [trackInput, setTrackInput] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<TrackResult | null>(null);
  const [trackError, setTrackError] = useState("");

  const normalizedMobile = useMemo(() => normalizeMobile(mobile), [mobile]);
  const canSendOtp =
    applicantType === "Indian" &&
    /^[6-9]\d{9}$/.test(normalizedMobile) &&
    captchaInput.trim() === captcha;

  useEffect(() => {
  if (searchParams.get("guest_success") === "true") {
    setActiveTab("track");

    const savedMobile = sessionStorage.getItem("guestMobile");
    if (savedMobile) {
      setTrackInput(savedMobile);
    }

    // Clear saved application data
    sessionStorage.removeItem("verifiedMobile");
    sessionStorage.removeItem("guestMobile");

    // Clear local state
    setMobile("");
    setOtp("");
    setOtpSent(false);

    toast.success("Application successfully submitted!", {
      duration: 5000,
    });

    router.replace("/apply-dsc");
  }
}, [searchParams, router]);

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
      setGateError(
        "Foreign applicant flow needs assisted support. Please request a custom quote.",
      );
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

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not send OTP.");
      }

      setOtpSent(true);
      sessionStorage.setItem("guestMobile", normalizedMobile);
      toast.success("OTP sent successfully.");
    } catch (error) {
      setGateError(
        error instanceof Error ? error.message : "Could not send OTP.",
      );
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

      if (!res.ok || !data.success) {
        throw new Error(data.message || "OTP verification failed.");
      }

      sessionStorage.setItem("verifiedMobile", normalizedMobile);
      sessionStorage.setItem("guestMobile", normalizedMobile);
      toast.success("Mobile verified. Continue your DSC application.");
      router.push(`/bank-telecom-form?mobile=${normalizedMobile}&guest=true`);
    } catch (error) {
      setGateError(
        error instanceof Error ? error.message : "OTP verification failed.",
      );
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
      const res = await fetch(
        `/api/track-application?query=${encodeURIComponent(trackInput.trim())}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Application not found");
      }

      setTrackResult(data.application);
    } catch (error) {
      setTrackError(
        error instanceof Error ? error.message : "Application not found",
      );
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <main

  className="theme-transition min-h-screen pb-12 pt-8"
     style={{ backgroundColor: colors.shell, color: colors.text }}
    >
      <div className="w-full ">
        <div
          className="mb-6 overflow-hidden  px-6 py-5 backdrop-blur-sm"
          style={{
            background: isDarkMode
              ? "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(15,23,42,0.74))"
              : colors.card,
            borderColor: colors.borderSoft,
          }}
        >
          <div
            className="mb-5 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: colors.borderSoft }}
          >
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex w-fit items-center gap-2 text-xs font-black uppercase tracking-[0.18em] transition hover:-translate-x-0.5"
              style={{ color: colors.muted }}
            >
              <ArrowLeft size={15} />
              Home
            </button>

            <div
              className="flex w-full rounded-md border p-1 shadow-sm sm:w-auto"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(9,13,29,0.72)"
                  : colors.card,
                borderColor: colors.borderSoft,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab("apply")}
                className={`flex flex-1 items-center justify-center gap-2 rounded px-4 py-2 text-xs font-black uppercase tracking-wider transition-all sm:flex-none ${
                  activeTab === "apply"
                    ? "shadow-md"
                    : "opacity-70 hover:opacity-100"
                }`}
                style={{
                  backgroundColor:
                    activeTab === "apply"
                      ? `${colors.accent}18`
                      : "transparent",
                  color: activeTab === "apply" ? colors.text : colors.muted,
                }}
              >
                <FileText size={15} />
                Apply
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("track")}
                className={`flex flex-1 items-center justify-center gap-2 rounded px-4 py-2 text-xs font-black uppercase tracking-wider transition-all sm:flex-none ${
                  activeTab === "track"
                    ? "shadow-md"
                    : "opacity-70 hover:opacity-100"
                }`}
                style={{
                  backgroundColor:
                    activeTab === "track"
                      ? `${colors.accent}18`
                      : "transparent",
                  color: activeTab === "track" ? colors.text : colors.muted,
                }}
              >
                <Search size={15} />
                Track
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Content */}
            <div className="flex-1">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{
                  background: `${colors.accent}15`,
                  color: colors.accent,
                }}
              >
                <ShieldCheck size={14} />
                Secure DSC Portal
              </div>

              <h1 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
                Apply for Digital Signature Certificate
              </h1>

              <p
                className="mt-2 max-w-2xl text-sm leading-6"
                style={{ color: colors.muted }}
              >
                Complete mobile verification, submit your documents, and track
                your application status online.
              </p>
            </div>

            {/* Right Steps */}
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {["Mobile Verify", "Fill Form", "Upload Docs", "Approval"].map(
                (step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold"
                    style={{
                      background: `${colors.accent}12`,
                      color: colors.accent,
                      border: `1px solid ${colors.accent}25`,
                    }}
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
                      style={{
                        background: colors.accent,
                        color: "#fff",
                      }}
                    >
                      {index + 1}
                    </span>
                    {step}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {activeTab === "apply" ? (
          <div className="space-y-6">
            <section
              className="mx-auto max-w-xl overflow-hidden rounded-lg border shadow-xl"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.borderSoft,
              }}
            >
              <div
                className="border-b px-5 py-5 sm:px-8"
                style={{
                  backgroundColor: colors.accentSubtle,
                  borderColor: colors.borderSoft,
                }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{ color: colors.accent }}
                >
                  Apply new DSC
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  Verify your mobile number
                </h2>
                <p
                  className="mt-2 text-sm font-medium"
                  style={{ color: colors.muted }}
                >
                  We will use this number for your application and status
                  updates.
                </p>
              </div>

              <div className="px-5 py-6 sm:px-8">
                <form
                  className="space-y-4"
                  onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(["Indian", "Foreign"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setApplicantType(type)}
                        className="flex h-12 items-center gap-3 rounded-lg border px-4 text-left text-sm font-bold transition-all"
                        style={{
                          backgroundColor:
                            applicantType === type
                              ? `${colors.accent}14`
                              : fieldSurface,
                          borderColor:
                            applicantType === type
                              ? colors.accent
                              : fieldBorder,
                          color: fieldText,
                        }}
                      >
                        <span
                          className="flex h-4 w-4 items-center justify-center rounded-full border"
                          style={{
                            borderColor:
                              applicantType === type
                                ? colors.accent
                                : colors.muted,
                          }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor:
                                applicantType === type
                                  ? colors.accent
                                  : "transparent",
                            }}
                          />
                        </span>
                        {type}
                      </button>
                    ))}
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={mobile}
                    disabled={otpSent}
                    onChange={(event) => setMobile(event.target.value)}
                    placeholder="Mobile number"
                    className="h-12 w-full rounded-lg border px-4 text-sm font-bold outline-none disabled:opacity-70"
                    style={{
                      backgroundColor: fieldSurface,
                      borderColor: fieldBorder,
                      color: fieldText,
                    }}
                  />

                  {!otpSent ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_176px_96px]">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={captchaInput}
                        onChange={(event) =>
                          setCaptchaInput(
                            event.target.value.replace(/\D/g, "").slice(0, 4),
                          )
                        }
                        placeholder="Captcha"
                        className="h-12 rounded-lg border px-4 text-sm font-bold outline-none"
                        style={{
                          backgroundColor: fieldSurface,
                          borderColor: fieldBorder,
                          color: fieldText,
                        }}
                      />
                      <div
                        className="flex h-12 items-center justify-center rounded-lg border border-dashed text-3xl font-black tracking-[0.2em]"
                        style={{
                          backgroundColor: colors.panel,
                          borderColor: fieldBorder,
                          color: fieldText,
                        }}
                      >
                        {captcha}
                      </div>
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="flex h-12 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold"
                        style={{
                          backgroundColor: fieldSurface,
                          borderColor: fieldBorder,
                          color: fieldText,
                        }}
                      >
                        <RefreshCw size={15} />
                        Refresh
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label
                        className="text-[10px] font-black uppercase tracking-wider"
                        style={{ color: colors.muted }}
                      >
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={(event) =>
                          setOtp(
                            event.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        placeholder="6-digit OTP"
                        className="h-12 w-full rounded-lg border px-4 text-center text-lg font-black tracking-[0.22em] outline-none"
                        style={{
                          backgroundColor: fieldSurface,
                          borderColor: fieldBorder,
                          color: fieldText,
                        }}
                      />
                    </div>
                  )}

                  {gateError ? (
                    <p className="text-sm font-bold text-rose-500">
                      {gateError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={
                      otpSent ? verifyingOtp : sendingOtp || !canSendOtp
                    }
                    className="theme-primary-btn flex h-12 w-full items-center justify-center gap-2 rounded-lg text-xs font-black uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ShieldCheck size={16} />
                    {otpSent
                      ? verifyingOtp
                        ? "Verifying..."
                        : "Verify and Continue"
                      : sendingOtp
                        ? "Sending..."
                        : "Get OTP"}
                  </button>
                </form>
              </div>
            </section>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-xl">
            <div
              className="rounded-lg border p-6 shadow-lg sm:p-8"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.borderSoft,
              }}
            >
              <h2 className="mb-6 text-center text-xl font-bold">
                Track Your Application Status
              </h2>

              <form
                onSubmit={handleTrackSubmit}
                className="flex flex-col gap-4"
              >
                <div>
                  <label
                    className="mb-2 block text-xs font-bold uppercase"
                    style={{ color: colors.muted }}
                  >
                    Application ID or Mobile Number
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2"
                      size={18}
                      style={{ color: colors.muted }}
                    />
                    <input
                      type="text"
                      value={trackInput}
                      onChange={(event) => setTrackInput(event.target.value)}
                      placeholder="Enter 10-digit mobile or App ID"
                      className="w-full rounded-lg border py-3 pl-10 pr-4 font-medium outline-none"
                      style={{
                        backgroundColor: colors.input,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={trackLoading}
                  className="theme-primary-btn mt-2 w-full rounded-lg py-3.5 text-xs font-black uppercase tracking-widest text-white disabled:opacity-70"
                >
                  {trackLoading ? "Searching..." : "Track Status"}
                </button>
              </form>

              {trackError ? (
                <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
                  <p className="text-sm font-bold text-red-500">{trackError}</p>
                </div>
              ) : null}

              {trackResult ? (
                <div
                  className="mt-8 rounded-lg border p-6"
                  style={{
                    backgroundColor: colors.panel,
                    borderColor: colors.borderSoft,
                  }}
                >
                  <div className="flex flex-col gap-4">
                    <ResultRow
                      label="Applicant Name"
                      value={trackResult.name}
                      colors={colors}
                    />
                    <ResultRow
                      label="Application ID"
                      value={trackResult._id}
                      colors={colors}
                      mono
                    />
                    <div className="flex items-center justify-between pt-2">
                      <span
                        className="text-xs font-bold uppercase"
                        style={{ color: colors.muted }}
                      >
                        Current Status
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                          trackResult.status === "approved"
                            ? "bg-green-500/20 text-green-600 dark:text-green-400"
                            : trackResult.status === "rejected"
                              ? "bg-red-500/20 text-red-600 dark:text-red-400"
                              : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {trackResult.status}
                      </span>
                    </div>
                  </div>

                  {trackResult.status === "pending" ? (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/bank-telecom-form?mobile=${trackInput}&guest=true`,
                        )
                      }
                      className="mt-6 w-full rounded-lg border py-2.5 text-sm font-bold transition-colors"
                      style={{
                        borderColor: colors.accent,
                        color: colors.accent,
                      }}
                    >
                      Complete Pending Application
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ResultRow({
  label,
  value,
  colors,
  mono,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof getThemePalette>;
  mono?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between border-b pb-4"
      style={{ borderColor: colors.borderSoft }}
    >
      <span
        className="text-xs font-bold uppercase"
        style={{ color: colors.muted }}
      >
        {label}
      </span>
      <span className={mono ? "font-mono text-sm" : "font-bold"}>{value}</span>
    </div>
  );
}

export default function ApplyDSCPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-black" />}>
      <ApplyDSCContent />
    </Suspense>
  );
}
