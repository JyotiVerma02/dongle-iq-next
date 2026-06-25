/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CreditCard, Eye, EyeOff, Fingerprint, Lock, Moon, ShieldCheck, SunMedium } from "lucide-react";
import {
  APPLICATION_CONFIG_KEY,
  fileToStoredFile,
  readFormState,
  saveFormState,
  savePreviewDraft,
} from "@/lib/applicationPreview";
import { calculatePricing } from "@/lib/pricing";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";
import { telemetry } from "@/lib/telemetry";

// Types and Initial State remain same
type FormState = {
  name: string;
  gender: string;
  dob: string;
  pan: string;
  email: string;
  mobile: string;
  ekycId: string;
  ekycPin: string;
  bpCode: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  certificateClass: string;
  tokenType: string;
  certType: string;
  validity: string;
  addressProof: string;
  idProof: string;
  bpAvailable: string;
  internalRemarks: string;
  photo: string;
  assistedService: string;
  price: string;
};

interface ThemeProps {
  colors: ReturnType<typeof getThemePalette>;
}

type ThemeColors = ThemeProps["colors"];
interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>, ThemeProps {
  label: string;
  muted?: boolean;
}
interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>, ThemeProps {
  label: string;
  options: string[];
}

interface BankTelecomFormProps {
  embedded?: boolean;
  onBack?: () => void;
  /** When true, shows mobile OTP verify screen first before the form */
  showVerify?: boolean;
}

const createInitialState = (mobile: string): FormState => ({
  name: "",
  gender: "",
  dob: "",
  pan: "",
  email: "",
  mobile,
  ekycId: "",
  ekycPin: "",
  bpCode: "",
  address: "",
  pincode: "",
  city: "",
  state: "",
  certificateClass: "Class III",
  tokenType: "Not Required",
  certType: "Signature",
  validity: "2 Years",
  addressProof: "",
  idProof: "",
  bpAvailable: "Yes",
  internalRemarks: "",
  photo: "",
  assistedService: "Not Required",
  price: "800",
});

export default function BankTelecomForm({ embedded = false, onBack, showVerify = false }: BankTelecomFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const sectionGreen = "#ff6a00";
  const fieldSurface = isDarkMode ? "#20283d" : colors.input;
  const fieldBorder = isDarkMode ? "rgba(139, 92, 246, 0.55)" : colors.inputBorder;
  const fieldText = isDarkMode ? "#ffffff" : colors.text;
  const mutedFieldText = isDarkMode ? "#aeb8d4" : colors.muted;
  const formShellStyle = {
    backgroundColor: isDarkMode ? "#000000" : colors.panelStrong,
    "--form-field-bg": fieldSurface,
    "--form-field-border": fieldBorder,
    "--form-field-text": fieldText,
    "--form-field-muted": mutedFieldText,
  } as React.CSSProperties;

  const photoRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const idProofRef = useRef<HTMLInputElement>(null);

  // --- Verify section state ---
  const [isVerified, setIsVerified] = useState(!showVerify);
  const [verifyMobile, setVerifyMobile] = useState("");
  const [verifyActiveTab, setVerifyActiveTab] = useState<"aadhaar" | "pan">("aadhaar");
  const [verifyIsChecked, setVerifyIsChecked] = useState(false);
  const [verifyOtp, setVerifyOtp] = useState(["", "", "", "", "", ""]);
  const [verifyOtpSent, setVerifyOtpSent] = useState(false);
  const [verifyTimer, setVerifyTimer] = useState(0);
  const [verifyIsSending, setVerifyIsSending] = useState(false);
  const [verifyIsVerifying, setVerifyIsVerifying] = useState(false);
  const verifyInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState<FormState>(createInitialState(""));
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);

  const [resubmissionFlags, setResubmissionFlags] = useState<{
    photo: boolean;
    idProof: boolean;
    addressProof: boolean;
  } | null>(null);

  const [existingUserUrls, setExistingUserUrls] = useState<{
    photo?: string;
    idProof?: string;
    addressProof?: string;
  }>({});

  // --- Verify timer ---
  useEffect(() => {
    if (verifyTimer <= 0) return;
    const interval = setInterval(() => setVerifyTimer((t) => Math.max(t - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, [verifyTimer]);

  useEffect(() => {
    if (verifyOtpSent) verifyInputRefs.current[0]?.focus();
  }, [verifyOtpSent]);

  const handleVerifySendOtp = async () => {
    if (verifyMobile.length !== 10) { alert("Enter 10 digit number"); return; }
    setVerifyIsSending(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: verifyMobile }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Failed to send OTP"); return; }
      setVerifyOtpSent(true);
      setVerifyTimer(120);
    } catch { alert("Error sending OTP"); }
    finally { setVerifyIsSending(false); }
  };

  const handleVerifyOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...verifyOtp]; next[index] = value; setVerifyOtp(next);
    if (value && index < 5) verifyInputRefs.current[index + 1]?.focus();
  };

  const handleVerifyOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verifyOtp[index] && index > 0) verifyInputRefs.current[index - 1]?.focus();
  };

  const handleVerifyOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...verifyOtp];
    pasted.split("").forEach((d, i) => { next[i] = d; });
    setVerifyOtp(next);
    verifyInputRefs.current[Math.min(pasted.length, 6) - 1]?.focus();
  };

  const handleVerifySubmit = async () => {
    if (!verifyMobile || verifyMobile.length < 10 || verifyOtp.join("").length !== 6) return;
    if (verifyActiveTab === "pan" && !verifyIsChecked) return;
    setVerifyIsVerifying(true);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: verifyMobile, otp: verifyOtp.join("") }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Verification failed");
        setVerifyOtp(["", "", "", "", "", ""]);
        verifyInputRefs.current[0]?.focus();
        return;
      }
      sessionStorage.setItem("verifiedMobile", verifyMobile);
      setIsVerified(true);
    } catch { alert("Server error"); }
    finally { setVerifyIsVerifying(false); }
  };

  useEffect(() => {
    fetch("/api/get-user-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          if (data.user.status === "rejected") {
            setResubmissionFlags(
              data.user.resubmissionDocs || { photo: true, idProof: true, addressProof: true }
            );
            setExistingUserUrls({
              photo: data.user.photo,
              idProof: data.user.idProof,
              addressProof: data.user.addressProof,
            });

            setFormData((prev) => ({
              ...prev,
              name: data.user.name || prev.name,
              email: data.user.email || prev.email,
              gender: data.user.gender || prev.gender,
              dob: data.user.dob || prev.dob,
              address: data.user.address || prev.address,
              pincode: data.user.pincode || prev.pincode,
              city: data.user.city || prev.city,
              state: data.user.state || prev.state,
              certificateClass: data.user.certificateClass || prev.certificateClass,
              certType: data.user.certType || prev.certType,
              validity: data.user.validity || prev.validity,
              tokenType: data.user.tokenType || prev.tokenType,
              assistedService: data.user.assistedService || prev.assistedService,
            }));
          }
        }
      })
      .catch((err) => console.error("Error fetching user data in bank-telecom-form:", err));
  }, []);

  useEffect(() => {
    const mobile =
      searchParams.get("mobile") ||
      sessionStorage.getItem("verifiedMobile") ||
      "";
    const rawConfig = sessionStorage.getItem(APPLICATION_CONFIG_KEY);
    const restoreState = () => {
      let nextState = createInitialState(mobile);
      const saved = readFormState();
      if (saved) nextState = { ...nextState, ...saved };
      if (rawConfig) {
        try {
          Object.assign(nextState, JSON.parse(rawConfig));
        } catch {}
      }
      const pricing = calculatePricing({
        certType: nextState.certType,
        validity: nextState.validity,
        tokenType: nextState.tokenType,
        assistedService: nextState.assistedService,
      });
      setFormData({ ...nextState, price: String(pricing.total) });
    };
    restoreState();
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      const pricing = calculatePricing({
        certType: next.certType,
        validity: next.validity,
        tokenType: next.tokenType,
        assistedService: next.assistedService,
      });
      const updated = { ...next, price: String(pricing.total) };
      saveFormState(updated);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const photoRequired = !existingUserUrls.photo || resubmissionFlags?.photo;
    const idRequired = !existingUserUrls.idProof || resubmissionFlags?.idProof;
    const addressRequired = !existingUserUrls.addressProof || resubmissionFlags?.addressProof;

    if (photoRequired && !photoFile) return alert("Photo file is required.");
    if (idRequired && !idFile) return alert("ID Proof file is required.");
    if (addressRequired && !addressFile) return alert("Address Proof file is required.");

    setLoading(true);
    const startFileProcessing = performance.now();
    try {
      telemetry.trackEvent({
        name: "form_submit_start",
        category: "Application",
        label: formData.certType,
        metadata: { hasExistingFiles: !!existingUserUrls.photo },
      });

      const [photo, idProof, addressProof] = await Promise.all([
        photoFile
          ? fileToStoredFile(photoFile)
          : { name: "Existing Photo", type: "image/jpeg", preview: existingUserUrls.photo || "", isExisting: true },
        idFile
          ? fileToStoredFile(idFile)
          : { name: "Existing ID Proof", type: "image/jpeg", preview: existingUserUrls.idProof || "", isExisting: true },
        addressFile
          ? fileToStoredFile(addressFile)
          : { name: "Existing Address Proof", type: "image/jpeg", preview: existingUserUrls.addressProof || "", isExisting: true },
      ]);

      telemetry.trackPerformance("process_form_files", performance.now() - startFileProcessing, {
        photoSize: photoFile?.size,
        idSize: idFile?.size,
        addressSize: addressFile?.size,
      });

      const isGuest = searchParams.get("guest") === "true";
      savePreviewDraft({ formData, files: { photo, idProof, addressProof } });
      router.push(isGuest ? "/preview?guest=true" : "/preview");
    } catch (error) {
      console.error("FILE PROCESS ERROR:", error);
      telemetry.captureError(error instanceof Error ? error : String(error), {
        action: "file_processing",
      });

      alert(error instanceof Error ? error.message : "Error processing files.");
    } finally {
      setLoading(false);
    }
  };

  // --- If showVerify mode and not yet verified, show verify UI ---
  if (showVerify && !isVerified) {
    const premiumGradient = "linear-gradient(135deg, #7c3aed, #6366f1, #06b6d4)";
    const darkBg = isDarkMode
      ? "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.12) 0%, transparent 55%), #0d0a1f"
      : "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 55%), #f5f3ff";

    const cardBg = isDarkMode ? "rgba(18,12,40,0.85)" : "rgba(255,255,255,0.95)";
    const cardBorder = isDarkMode ? "rgba(124,58,237,0.45)" : "rgba(124,58,237,0.18)";
    const inputBg = isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(124,58,237,0.04)";
    const inputBorderC = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(124,58,237,0.18)";
    const tabBg = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.07)";
    const textPrimary = isDarkMode ? "#ffffff" : "#1e1040";
    const textMuted = isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(30,16,64,0.5)";
    const otpFilled = isDarkMode ? "rgba(124,58,237,0.25)" : "rgba(124,58,237,0.08)";
    const otpBorder = isDarkMode ? "rgba(124,58,237,0.6)" : "rgba(124,58,237,0.35)";

    const isOtpComplete = verifyOtp.join("").length === 6;
    const canContinue = verifyActiveTab === "pan"
      ? (verifyIsChecked && isOtpComplete)
      : isOtpComplete;

    return (
      <main
        className="theme-transition fixed inset-0 flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 py-4"
        style={{ background: darkBg }}
      >
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-32 top-1/4 h-72 w-72 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.6), transparent)" }}
          />
          <div
            className="absolute -right-20 bottom-1/4 h-60 w-60 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.5), transparent)" }}
          />
          <div
            className="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.8), transparent)" }}
          />
        </div>

        {/* Card */}
        <div className="relative z-10 w-full max-w-[400px]">
          {/* Glow border */}
          <div
            className="pointer-events-none absolute -inset-[1px] rounded-[26px] opacity-60 blur-sm"
            style={{ background: premiumGradient }}
          />
          <section
            className="relative rounded-[24px] border p-5 shadow-2xl backdrop-blur-2xl"
            style={{ background: cardBg, borderColor: cardBorder }}
          >
            {/* Shield icon + title */}
            <div className="mb-4 flex flex-col items-center gap-2.5">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full blur-lg opacity-60"
                  style={{ background: premiumGradient }}
                />
                <div
                  className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 text-white shadow-xl"
                  style={{
                    background: premiumGradient,
                    borderColor: isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(124,58,237,0.3)",
                    boxShadow: "0 0 28px rgba(124,58,237,0.5), 0 6px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  <ShieldCheck size={24} strokeWidth={2.5} />
                </div>
                <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full" style={{ background: "#06b6d4" }} />
                <div className="absolute -bottom-1 -left-1 h-1.5 w-1.5 rounded-full" style={{ background: "#7c3aed" }} />
              </div>
              <div className="text-center">
                <h1 className="text-[22px] font-black uppercase tracking-tight leading-tight">
                  <span style={{ color: textPrimary }}>MOBILE </span>
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: premiumGradient }}
                  >
                    VERIFICATION
                  </span>
                </h1>
                <p className="mt-0.5 text-[11px] font-medium" style={{ color: textMuted }}>
                  Secure. Quick. Reliable.
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="mb-3 flex rounded-xl p-1"
              style={{ backgroundColor: tabBg, border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.1)"}` }}
            >
              {(["aadhaar", "pan"] as const).map((tab) => {
                const active = verifyActiveTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => { setVerifyActiveTab(tab); setVerifyIsChecked(false); }}
                    className="relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-300"
                    style={{
                      background: active ? premiumGradient : "transparent",
                      color: active ? "#ffffff" : textMuted,
                      boxShadow: active ? "0 4px 15px rgba(124,58,237,0.4)" : "none",
                    }}
                  >
                    {tab === "aadhaar" ? <Fingerprint size={13} /> : <CreditCard size={13} />}
                    {tab.toUpperCase()}
                  </button>
                );
              })}
            </div>

            {/* Alert / Info banner — glass border on both */}
            {verifyActiveTab === "aadhaar" ? (
              <div className="relative mb-3">
                {/* Glass glow border */}
                <div
                  className="pointer-events-none absolute -inset-[1px] rounded-xl opacity-50 blur-[2px]"
                  style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.7), rgba(239,68,68,0.3), rgba(220,38,38,0.5))" }}
                />
                <div
                  className="relative flex items-start gap-2 rounded-xl px-3 py-2 backdrop-blur-sm"
                  style={{
                    backgroundColor: isDarkMode ? "rgba(220,38,38,0.1)" : "rgba(220,38,38,0.05)",
                    border: "1px solid rgba(220,38,38,0.2)",
                  }}
                >
                  <AlertCircle size={13} className="mt-0.5 shrink-0" style={{ color: "#dc2626" }} />
                  <p className="text-[11px] font-semibold leading-snug" style={{ color: "#dc2626" }}>
                    Please enter and verify Aadhaar Registered Mobile Number
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative mb-3">
                {/* Glass glow border */}
                <div
                  className="pointer-events-none absolute -inset-[1px] rounded-xl opacity-50 blur-[2px]"
                  style={{ background: premiumGradient }}
                />
                <div
                  className="relative space-y-2 rounded-xl px-3 py-3 text-center backdrop-blur-sm"
                  style={{
                    backgroundColor: isDarkMode ? "rgba(18,12,40,0.7)" : "rgba(245,243,255,0.8)",
                    border: `1px solid ${isDarkMode ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.12)"}`,
                  }}
                >
                  {/* VERIFICATION BY TELECOM pill */}
                  <div className="flex justify-center">
                    <div
                      className="flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-white"
                      style={{
                        background: premiumGradient,
                        boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
                      }}
                    >
                      {/* Radio/signal tower icon */}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4.9 4.9a10 10 0 0 1 14.14 0" /><path d="M7.76 7.76a6 6 0 0 1 8.49 0" /><path d="M10.6 10.6a2 2 0 0 1 2.83 0" />
                        <line x1="12" y1="12" x2="12" y2="21" /><line x1="9" y1="21" x2="15" y2="21" />
                      </svg>
                      VERIFICATION BY TELECOM
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: textMuted }}>
                    Enter the applicant&apos;s 10-digit registered mobile number. Ensure the name matches telecom records.
                  </p>
                </div>
              </div>
            )}


            {/* Mobile input */}
            <div
              className="mb-2.5 flex items-center gap-2 rounded-xl border px-3"
              style={{
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.05)",
                borderColor: inputBorderC,
                height: "44px",
              }}
            >
              {/* Phone icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: textMuted, flexShrink: 0 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.62 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16z" />
              </svg>
              <input
                type="tel"
                maxLength={10}
                inputMode="numeric"
                placeholder="Mobile number"
                value={verifyMobile}
                disabled={verifyOtpSent}
                onChange={(e) => setVerifyMobile(e.target.value.replace(/\D/g, ""))}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none border-none focus:ring-0 focus:outline-none disabled:opacity-60"
                style={{ color: textPrimary, boxShadow: "none" }}
              />
              {!verifyOtpSent && (
                <button
                  onClick={handleVerifySendOtp}
                  disabled={verifyIsSending || verifyMobile.length !== 10}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white transition-all duration-200 disabled:opacity-50 hover:brightness-110 active:scale-95"
                  style={{
                    background: premiumGradient,
                    boxShadow: "0 3px 10px rgba(124,58,237,0.4)",
                  }}
                >
                  {verifyIsSending ? "..." : "SEND OTP"}
                </button>
              )}
            </div>

            {/* OTP inputs */}
            {verifyOtpSent && (
              <div className="mb-2.5 space-y-2 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>
                  Enter 6-digit OTP
                </p>
                <div className="flex justify-center gap-1.5">
                  {verifyOtp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { verifyInputRefs.current[index] = el; }}
                      value={digit}
                      maxLength={1}
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      onChange={(e) => handleVerifyOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleVerifyOtpKeyDown(index, e)}
                      onPaste={handleVerifyOtpPaste}
                      className="h-10 w-9 rounded-lg border text-center text-sm font-black outline-none transition-all duration-200 focus:scale-105"
                      style={{
                        backgroundColor: digit ? otpFilled : inputBg,
                        borderColor: digit ? "rgba(124,58,237,0.7)" : otpBorder,
                        color: textPrimary,
                        boxShadow: digit ? "0 0 10px rgba(124,58,237,0.25)" : "none",
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => verifyTimer === 0 && handleVerifySendOtp()}
                  disabled={verifyTimer > 0}
                  className="text-[10px] font-semibold transition-opacity disabled:opacity-40"
                  style={{ color: isDarkMode ? "rgba(167,139,250,1)" : "#7c3aed" }}
                >
                  {verifyTimer > 0 ? `Resend OTP in ${verifyTimer}s` : "Resend OTP"}
                </button>
              </div>
            )}

            {/* PAN consent checkbox */}
            {verifyActiveTab === "pan" && (
              <div
                className="mb-2.5 flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 transition-colors"
                style={{
                  borderColor: verifyIsChecked ? "rgba(124,58,237,0.5)" : inputBorderC,
                  backgroundColor: verifyIsChecked
                    ? isDarkMode ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.06)"
                    : inputBg,
                }}
                onClick={() => setVerifyIsChecked((c) => !c)}
              >
                <div
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all"
                  style={{
                    background: verifyIsChecked ? premiumGradient : "transparent",
                    borderColor: verifyIsChecked ? "transparent" : inputBorderC,
                  }}
                >
                  {verifyIsChecked && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[11px] leading-[1.55]" style={{ color: textMuted }}>
                  I authorize verification of the mobile number and name with telecom records.
                  <br />
                  <span
                    className="cursor-pointer font-semibold underline underline-offset-2"
                    style={{ color: isDarkMode ? "rgba(167,139,250,1)" : "#7c3aed" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    You must accept the terms and conditions
                  </span>
                  {" "}to continue.
                </span>
              </div>
            )}

            {/* CONTINUE button */}
            <button
              onClick={handleVerifySubmit}
              disabled={!canContinue || verifyIsVerifying}
              className="group relative flex w-full items-center justify-between overflow-hidden rounded-xl px-5 py-3 text-[12px] font-black uppercase tracking-[0.18em] text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 hover:brightness-110 active:scale-[0.98]"
              style={{
                background: canContinue ? premiumGradient : isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.15)",
                boxShadow: canContinue ? "0 6px 24px rgba(124,58,237,0.45), 0 2px 8px rgba(0,0,0,0.2)" : "none",
              }}
            >
              <ShieldCheck size={16} strokeWidth={2.5} />
              <span>{verifyIsVerifying ? "Verifying..." : "CONTINUE"}</span>
              <ArrowRight size={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="h-px flex-1" style={{ background: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.1)" }} />
              <div className="flex items-center gap-1.5" style={{ color: textMuted }}>
                <Lock size={9} />
                <span className="text-[10px] font-medium">Your data is safe and encrypted</span>
              </div>
              <div className="h-px flex-1" style={{ background: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.1)" }} />
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <div
      className={embedded ? "flex w-full flex-col overflow-hidden" : "flex min-h-screen w-full flex-col overflow-hidden p-2 md:p-4"}
      style={formShellStyle}
    >
      <form
        onSubmit={handleSubmit}
        className={embedded ? "flex w-full flex-col overflow-hidden rounded-[24px] border shadow-2xl" : "flex flex-1 w-full flex-col overflow-hidden rounded-xl border shadow-xl"}
        style={{
          backgroundColor: isDarkMode ? colors.panelStrong : colors.card,
          borderColor: isDarkMode ? colors.inputBorder : colors.border,
        }}
      >
        <header
          className="flex shrink-0 flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          style={{
            backgroundColor: isDarkMode ? colors.panel : colors.accentSubtle,
            borderColor: isDarkMode ? colors.inputBorder : colors.border,
          }}
        >
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <HeaderStat
              label="Class"
              value={formData.certificateClass}
              color={colors.accent}
            />
            <HeaderStat
              label="Type"
              value={formData.certType}
              color={colors.accent}
            />
            <HeaderStat
              label="Price"
              value={`INR ${formData.price}`}
              color={colors.accent}
            />
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[10px] font-bold"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.borderSoft,
              color: colors.text,
            }}
          >
            {isDarkMode ? <SunMedium size={14} /> : <Moon size={14} />}{" "}
            {isDarkMode ? "Light" : "Dark"}
          </button>
          {embedded && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[10px] font-bold"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.borderSoft,
                color: colors.text,
              }}
            >
              Back
            </button>
          ) : null}
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="grid w-full grid-cols-1 overflow-hidden md:grid-cols-12 md:items-start">
            {/* LEFT SIDE: Tightened spacing to prevent scrolling */}
            <section
              className="flex flex-col border-b md:col-span-8 md:border-b-0 md:border-r"
              style={{
                borderColor: isDarkMode ? colors.inputBorder : colors.border,
              }}
            >
              <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                <div>
                  <SectionHeader title="DSC Service Details" color={sectionGreen} />
                  <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                    <ThemeSelect
                      name="certificateClass"
                      label="Certificate Class"
                      options={["Class III"]}
                      value={formData.certificateClass}
                      onChange={handleChange}
                      colors={colors}
                    />
                    <ThemeSelect
                      name="certType"
                      label="Service Type"
                      options={["Signature", "Encryption", "Signing & Encryption"]}
                      value={formData.certType}
                      onChange={handleChange}
                      colors={colors}
                      required
                    />
                    <ThemeSelect
                      name="validity"
                      label="Validity"
                      options={["1 Year", "2 Years", "3 Years"]}
                      value={formData.validity}
                      onChange={handleChange}
                      colors={colors}
                      required
                    />
                    <ThemeSelect
                      name="tokenType"
                      label="USB Token"
                      options={["Not Required", "USB Token"]}
                      value={formData.tokenType}
                      onChange={handleChange}
                      colors={colors}
                    />
                    <ThemeSelect
                      name="assistedService"
                      label="Assisted Service"
                      options={["Not Required", "Required"]}
                      value={formData.assistedService}
                      onChange={handleChange}
                      colors={colors}
                    />
                    <div
                      className="flex min-h-9 items-center justify-between rounded-md border px-3 py-2"
                      style={{
                        backgroundColor: `${colors.accent}10`,
                        borderColor: colors.inputBorder,
                      }}
                    >
                      <div>
                        <p className="text-[8px] font-black uppercase opacity-60">Total Price</p>
                        <p className="text-sm font-black" style={{ color: colors.accent }}>
                          INR {formData.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <SectionHeader
                    title="Personal Information"
                    color={sectionGreen}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <ThemeInput
                      name="name"
                      label="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      colors={colors}
                      required
                    />
                    <ThemeInput
                      name="pan"
                      label="PAN No"
                      value={formData.pan}
                      onChange={handleChange}
                      colors={colors}
                      required
                    />
                    <ThemeSelect
                      name="gender"
                      label="Gender"
                      options={["Select", "Male", "Female"]}
                      value={formData.gender}
                      onChange={handleChange}
                      colors={colors}
                    />
                    <ThemeInput
                      name="dob"
                      label="DOB"
                      placeholder="DD-MM-YYYY"
                      value={formData.dob}
                      onChange={handleChange}
                      colors={colors}
                    />
                    <ThemeInput
                      name="email"
                      label="Email"
                      value={formData.email}
                      onChange={handleChange}
                      colors={colors}
                    />
                    <ThemeInput
                      name="mobile"
                      label="Mobile"
                      value={formData.mobile}
                      readOnly
                      muted
                      colors={colors}
                    />
                  </div>
                </div>

                <div>
                  <SectionHeader title="Address Details" color={sectionGreen} />
                  <div className="space-y-2">
                    <div className="w-full">
                      <Label text="Full Address" colors={colors} required />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full rounded-md border px-3 py-2 text-[13px] font-bold outline-none"
                        style={{
                          backgroundColor: fieldSurface,
                          borderColor: fieldBorder,
                          color: fieldText,
                          minHeight: "50px",
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <ThemeInput
                        name="pincode"
                        label="Pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        colors={colors}
                      />
                      <ThemeInput
                        name="city"
                        label="City"
                        value={formData.city}
                        onChange={handleChange}
                        colors={colors}
                      />
                      <ThemeInput
                        name="state"
                        label="State"
                        value={formData.state}
                        onChange={handleChange}
                        colors={colors}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <SectionHeader title="Security" color={sectionGreen} />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ThemeInput
                      name="ekycId"
                      label="eKYC ID"
                      value={formData.ekycId}
                      onChange={handleChange}
                      colors={colors}
                    />
                    <div className="w-full">
                      <Label text="eKYC PIN" colors={colors} required />
                      <div className="flex h-10">
                        <input
                          name="ekycPin"
                          type={showPin ? "text" : "password"}
                          value={formData.ekycPin}
                          onChange={handleChange}
                          className="w-full rounded-l-md border px-3 text-[13px] font-bold outline-none"
                          style={{
                            backgroundColor: fieldSurface,
                            borderColor: fieldBorder,
                            color: fieldText,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="flex h-10 w-11 shrink-0 items-center justify-center rounded-r-md border border-l-0 transition hover:brightness-110"
                          style={{
                            borderColor: fieldBorder,
                            backgroundColor: isDarkMode ? "#2a1f52" : colors.border,
                            color: isDarkMode ? "#ffffff" : colors.text,
                          }}
                          aria-label={showPin ? "Hide eKYC PIN" : "Show eKYC PIN"}
                          title={showPin ? "Hide eKYC PIN" : "Show eKYC PIN"}
                        >
                          {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside
              className="flex flex-col overflow-hidden md:col-span-4"
              style={{
                backgroundColor: isDarkMode
                  ? colors.panel
                  : colors.accentSubtle,
              }}
            >
              <div className="p-5 space-y-5">
                <SectionHeader title="Documents" color={sectionGreen} />
                <div className="flex flex-col gap-3">
                  <div
                    onClick={() => photoRef.current?.click()}
                    className="relative flex h-28 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border-2 border-dashed transition hover:-translate-y-0.5"
                    style={{
                      borderColor: colors.accent,
                      backgroundColor: isDarkMode ? `${colors.accent}12` : colors.input,
                    }}
                  >
                    <input
                      type="file"
                      ref={photoRef}
                      className="hidden"
                    
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (!file) return;

                        if (file.size > 2 * 1024 * 1024) {
                          alert("File size must be less than 2MB");
                          return;
                        }

                        setPhotoFile(file);
                      }}
                    />
                    {photoFile ? (
                      photoFile.type === "application/pdf" ? (
                        <p className="text-[10px] font-black uppercase opacity-60 p-2 text-center truncate w-full">
                          {photoFile.name}
                        </p>
                      ) : (
                        <img
                          src={URL.createObjectURL(photoFile)}
                          alt="User"
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : existingUserUrls.photo && resubmissionFlags && !resubmissionFlags.photo ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-orange-500/10 p-2 text-center">
                        <span className="text-[11px] font-extrabold uppercase text-orange-500">Verified ✅</span>
                        <span className="mt-0.5 text-[9px] font-semibold text-orange-500">Existing photo will be reused</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                        <p className="text-[10px] font-black uppercase opacity-60">
                          Photo
                        </p>
                        {resubmissionFlags?.photo && (
                          <span className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider rounded bg-rose-500/10 text-rose-500 animate-pulse">Resubmission Required</span>
                        )}
                      </div>
                    )}
                  </div>
                  <FileBox
                    label="Identity Proof"
                    file={idFile}
                    onClick={() => idProofRef.current?.click()}
                    colors={colors}
                    isVerified={!!(existingUserUrls.idProof && resubmissionFlags && !resubmissionFlags.idProof)}
                    isResubmission={!!resubmissionFlags?.idProof}
                  />
                  <input
                    type="file"
                    ref={idProofRef}
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                  />
                  <FileBox
                    label="Address Proof"
                    file={addressFile}
                    onClick={() => addressRef.current?.click()}
                    colors={colors}
                    isVerified={!!(existingUserUrls.addressProof && resubmissionFlags && !resubmissionFlags.addressProof)}
                    isResubmission={!!resubmissionFlags?.addressProof}
                  />
                  <input
                    type="file"
                    ref={addressRef}
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) =>
                      setAddressFile(e.target.files?.[0] || null)
                    }
                  />
                </div>
              </div>

              <div
                className="border-t p-5"
                style={{
                  borderColor: isDarkMode ? colors.inputBorder : colors.border,
                  backgroundColor: isDarkMode ? colors.panelStrong : colors.card,
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg py-3.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: colors.accent }}
                >
                  {loading ? "PROCESSING..." : "CONTINUE TO PREVIEW"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </form>
    </div>
  );
}

// Sub-components with tighter padding/spacing
function HeaderStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <p className="text-[7px] font-black uppercase opacity-65 leading-tight">
        {label}
      </p>
      <p className="text-[12px] font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <h3
      className="mb-2 text-[10px] font-black uppercase tracking-widest"
      style={{ color }}
    >
      {title}
    </h3>
  );
}

function Label({
  text,
  required,
  colors,
  htmlFor,
}: {
  text: string;
  required?: boolean;
  colors: ThemeColors;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[9px] font-black uppercase opacity-80">
      {text} {required && <span style={{ color: colors.accent }}>*</span>}
    </label>
  );
}

function ThemeInput({ label, required, colors, muted, ...props }: InputProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      <Label text={label} required={required} colors={colors} htmlFor={inputId} />
      <input
        {...props}
        id={inputId}
        className="h-10 w-full rounded-md border px-3 text-[13px] font-bold outline-none transition focus:ring-2"
        style={{
          backgroundColor: "var(--form-field-bg)",
          borderColor: "var(--form-field-border)",
          color: muted ? "var(--form-field-muted)" : "var(--form-field-text)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset",
        }}
      />
    </div>
  );
}

function ThemeSelect({
  label,
  options,
  required,
  colors,
  ...props
}: SelectProps) {
  const selectId = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      <Label text={label} required={required} colors={colors} htmlFor={selectId} />
      <select
        {...props}
        id={selectId}
        className="h-10 w-full rounded-md border px-3 text-[13px] font-bold outline-none transition focus:ring-2"
        style={{
          backgroundColor: "var(--form-field-bg)",
          borderColor: "var(--form-field-border)",
          color: "var(--form-field-text)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset",
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function FileBox({
  label,
  file,
  onClick,
  colors,
  isVerified,
  isResubmission,
}: {
  label: string;
  file: File | null;
  onClick: () => void;
  colors: ThemeColors;
  isVerified?: boolean;
  isResubmission?: boolean;
}) {
  return (
    <div className="w-full">
      <Label text={label} colors={colors} />
      <div
        onClick={onClick}
        className="flex h-12 w-full cursor-pointer items-center justify-between rounded-md border px-3 transition hover:-translate-y-0.5"
        style={{
          borderColor: isResubmission && !file ? "rgba(244, 63, 94, 0.55)" : colors.accent,
          backgroundColor: isVerified && !file ? "rgba(16, 185, 129, 0.12)" : `${colors.accent}10`,
          color: "var(--form-field-text)",
        }}
      >
        <span className="truncate text-[10px] font-black opacity-80">
          {file ? file.name : isVerified ? "Existing file verified ✅" : "Choose File..."}
        </span>
        <span
          className="text-[8px] font-black uppercase px-2 py-1 rounded text-white"
          style={{
            backgroundColor: isResubmission && !file ? "#f43f5e" : isVerified && !file ? "#ff6a00" : colors.accent,
          }}
        >
          {isResubmission && !file ? "Fix Needed" : isVerified && !file ? "Verified" : "Upload"}
        </span>
      </div>
    </div>
  );
}





