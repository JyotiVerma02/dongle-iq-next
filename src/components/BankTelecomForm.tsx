/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CreditCard, Eye, EyeOff, Fingerprint, Lock, Moon, ShieldCheck, SunMedium, CheckCircle2, ChevronDown } from "lucide-react";
import {
  APPLICATION_CONFIG_KEY,
  fileToStoredFile,
  readFormState,
  saveFormState,
  savePreviewDraft,
  readPreviewDraft,
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
  const premiumGradient = "linear-gradient(135deg, #38BDF8 0%, #8B5CF6 50%, #A855F7 100%)";
  const textPrimary = colors.text;
  const textMuted = colors.muted;
  const verifyCardBg = isDarkMode ? "rgba(8, 10, 30, 0.92)" : colors.card;
  const verifyCardBorder = isDarkMode ? "rgba(139, 92, 246, 0.24)" : colors.borderSoft;
  const verifyTextPrimary = colors.text;
  const verifyTextMuted = colors.muted;
  const verifyTabBg = isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(124,58,237,0.06)";
  const verifyInputBg = isDarkMode ? "rgba(15, 23, 42, 0.92)" : colors.input;
  const verifyInputBorderC = isDarkMode ? "rgba(139, 92, 246, 0.22)" : colors.inputBorder;
  const verifyOtpFilled = isDarkMode ? "rgba(124,58,237,0.24)" : "rgba(124,58,237,0.12)";
  const verifyOtpBorder = isDarkMode ? "rgba(124,58,237,0.5)" : "rgba(124,58,237,0.35)";
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
  const [isVerified, setIsVerified] = useState(false);
  const [verifyMobile, setVerifyMobile] = useState("");
  const [verifyActiveTab, setVerifyActiveTab] = useState<"aadhaar" | "pan">("aadhaar");
  const [verifyIsChecked, setVerifyIsChecked] = useState(false);
  const [verifyOtp, setVerifyOtp] = useState(["", "", "", "", "", ""]);
  const [verifyOtpSent, setVerifyOtpSent] = useState(false);
  const [verifyTimer, setVerifyTimer] = useState(0);
  const [verifyIsSending, setVerifyIsSending] = useState(false);
  const [verifyIsVerifying, setVerifyIsVerifying] = useState(false);
  const verifyInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Accordion Step State
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(showVerify ? 2 : 1);

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
    await Promise.resolve();
    setIsVerified(true);
    setActiveStep(3);
    setVerifyIsVerifying(false);
  };

  const canContinue =
    verifyActiveTab === "aadhaar"
      ? verifyOtpSent && verifyOtp.join("").length === 6
      : verifyIsChecked;

  const pricing = calculatePricing({
    certType: formData.certType,
    validity: formData.validity,
    tokenType: formData.tokenType,
    assistedService: formData.assistedService,
  });

  useEffect(() => {
    if (formData.mobile && !verifyMobile) {
      setVerifyMobile(formData.mobile.replace(/\D/g, "").slice(0, 10));
    }
  }, [formData.mobile, verifyMobile]);

  useEffect(() => {
    fetch("/api/get-user-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          // Set existing URLs for everyone so their documents show up in edit mode
          setExistingUserUrls((prev) => ({
            photo: data.user.photo || prev.photo,
            idProof: data.user.idProof || prev.idProof,
            addressProof: data.user.addressProof || prev.addressProof,
          }));

          if (data.user.status === "rejected") {
            setResubmissionFlags(
              data.user.resubmissionDocs || { photo: true, idProof: true, addressProof: true }
            );
          }

          setFormData((prev) => ({
            ...prev,
            name: data.user.name || prev.name,
            pan: data.user.pan || prev.pan,
            email: data.user.email || prev.email,
            mobile: data.user.mobile || prev.mobile,
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
            ekycId: data.user.ekycId || prev.ekycId,
            ekycPin: data.user.ekycPin || prev.ekycPin,
          }));
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

      // Restore files from preview draft if available
      const draft = readPreviewDraft();
      if (draft && draft.files) {
        setExistingUserUrls((prev) => ({
          photo: draft.files.photo?.preview || prev.photo,
          idProof: draft.files.idProof?.preview || prev.idProof,
          addressProof: draft.files.addressProof?.preview || prev.addressProof,
        }));
      }
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
        <header className="sticky top-0 z-20 flex shrink-0 flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5" style={{ backgroundColor: isDarkMode ? colors.panel : colors.accentSubtle, borderColor: isDarkMode ? colors.inputBorder : colors.border }}>
          <div className="flex items-center gap-3">
            <h1 className="text-[13px] font-black uppercase tracking-wider" style={{ color: textPrimary }}>DSC Application</h1>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={toggleTheme} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[10px] font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800" style={{ backgroundColor: colors.card, borderColor: colors.borderSoft, color: colors.text }}>
              {isDarkMode ? <SunMedium size={14} /> : <Moon size={14} />} {isDarkMode ? "Light" : "Dark"}
            </button>
            <button type="button" onClick={() => {
                const dummy = { name: "", type: "", preview: "" } as any;
                savePreviewDraft({ formData, files: { photo: dummy, idProof: dummy, addressProof: dummy } });
                alert("Draft saved locally!");
              }} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[10px] font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800" style={{ backgroundColor: colors.card, borderColor: colors.borderSoft, color: colors.text }}>
              Save Draft
            </button>
            <div className="flex items-center gap-2 rounded-full border px-2 py-1" style={{ borderColor: colors.borderSoft }}>
              <div className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ background: premiumGradient }}>
                <span className="text-[9px] font-bold">U</span>
              </div>
              <span className="text-[10px] font-bold" style={{ color: colors.text }}>{formData.name || "User"}</span>
            </div>
            {embedded && onBack ? (
              <button type="button" onClick={onBack} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[10px] font-bold" style={{ backgroundColor: colors.card, borderColor: colors.borderSoft, color: colors.text }}>
                Back
              </button>
            ) : null}
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row p-4 gap-6 max-w-7xl w-full mx-auto relative">
          
          {/* LEFT PANE: ACCORDIONS (70%) */}
          <div className="flex flex-col gap-4 w-full lg:w-[70%]">
            
            {/* STEP 1: DSC CONFIG */}
            <section className="overflow-hidden rounded-xl border transition-all duration-300" style={{ borderColor: isDarkMode ? colors.inputBorder : colors.border, backgroundColor: isDarkMode ? colors.panelStrong : colors.card }}>
              <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={() => setActiveStep(activeStep === 1 ? (0 as any) : 1)}>
                <div className="flex items-center gap-3">
                  {activeStep > 1 ? <CheckCircle2 size={18} className="text-green-500" /> : <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md" style={{ background: activeStep === 1 ? premiumGradient : "transparent", backgroundColor: activeStep === 1 ? "transparent" : isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", color: activeStep === 1 ? "#fff" : textMuted }}>1</span>}
                  <h2 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: activeStep === 1 ? textPrimary : textMuted }}>DSC Configuration</h2>
                </div>
                <ChevronDown size={16} style={{ color: textMuted, transform: activeStep === 1 ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} />
              </button>
              {activeStep === 1 ? (
                <div className="border-t p-4" style={{ borderColor: isDarkMode ? colors.inputBorder : colors.border }}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ThemeSelect name="certificateClass" label="Certificate Class" options={["Class III"]} value={formData.certificateClass} onChange={handleChange} colors={colors} />
                    <ThemeSelect name="certType" label="Service Type" options={["Signature", "Encryption", "Signing & Encryption"]} value={formData.certType} onChange={handleChange} colors={colors} required />
                    <ThemeSelect name="validity" label="Validity" options={["1 Year", "2 Years", "3 Years"]} value={formData.validity} onChange={handleChange} colors={colors} required />
                    <ThemeSelect name="tokenType" label="USB Token" options={["Not Required", "USB Token"]} value={formData.tokenType} onChange={handleChange} colors={colors} />
                    <ThemeSelect name="assistedService" label="Assisted Service" options={["Not Required", "Required"]} value={formData.assistedService} onChange={handleChange} colors={colors} />
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button type="button" onClick={() => setActiveStep(2)} className="group flex items-center gap-2 rounded-lg px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg" style={{ background: premiumGradient, boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
                      Continue
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              ) : null}
            </section>

            {/* STEP 2: MOBILE VERIFICATION */}
            <section className="overflow-hidden rounded-xl border transition-all duration-300" style={{ borderColor: isDarkMode ? colors.inputBorder : colors.border, backgroundColor: isDarkMode ? colors.panelStrong : colors.card }}>
              <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={() => setActiveStep(activeStep === 2 ? (0 as any) : 2)}>
                <div className="flex items-center gap-3">
                  {isVerified ? <CheckCircle2 size={18} className="text-green-500" /> : <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm" style={{ background: activeStep === 2 ? premiumGradient : "transparent", backgroundColor: activeStep === 2 ? "transparent" : isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", color: activeStep === 2 ? "#fff" : textMuted }}>2</span>}
                  <h2 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: activeStep === 2 ? textPrimary : textMuted }}>Mobile Verification</h2>
                </div>
                <ChevronDown size={16} style={{ color: textMuted, transform: activeStep === 2 ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} />
              </button>
              {activeStep === 2 ? (
                <div className="border-t p-4 sm:p-6" style={{ borderColor: isDarkMode ? colors.inputBorder : colors.border, background: isDarkMode ? "radial-gradient(circle at top, rgba(124,58,237,0.08), transparent 80%)" : "radial-gradient(circle at top, rgba(124,58,237,0.03), transparent 80%)" }}>
                  <div className="mx-auto w-full max-w-[420px] rounded-[24px] border p-5 shadow-2xl backdrop-blur-2xl" style={{ background: verifyCardBg, borderColor: verifyCardBorder }}>
                    <div className="mb-4 flex flex-col items-center gap-2 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full text-white" style={{ background: premiumGradient }}>
                        <ShieldCheck size={24} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h1 className="text-[22px] font-black uppercase tracking-tight leading-tight">
                          <span style={{ color: verifyTextPrimary }}>MOBILE </span>
                          <span className="bg-clip-text text-transparent" style={{ backgroundImage: premiumGradient }}>VERIFICATION</span>
                        </h1>
                        <p className="mt-0.5 text-[11px] font-medium" style={{ color: verifyTextMuted }}>Secure. Quick. Reliable.</p>
                      </div>
                    </div>

                    <div className="mb-3 flex rounded-xl p-1" style={{ backgroundColor: verifyTabBg, border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(124,58,237,0.1)"}` }}>
                      {(["aadhaar", "pan"] as const).map((tab) => {
                        const active = verifyActiveTab === tab;
                        return (
                          <button key={tab} type="button" onClick={(e) => { e.preventDefault(); setVerifyActiveTab(tab); setVerifyIsChecked(false); }} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-black uppercase tracking-widest" style={{ background: active ? premiumGradient : "transparent", color: active ? "#fff" : verifyTextMuted }}>
                            {tab === "aadhaar" ? <Fingerprint size={13} /> : <CreditCard size={13} />}
                            {tab.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>

                    {verifyActiveTab === "aadhaar" ? (
                      <div className="mb-3 rounded-xl border px-3 py-2" style={{ backgroundColor: isDarkMode ? "rgba(220,38,38,0.1)" : "rgba(220,38,38,0.05)", borderColor: "rgba(220,38,38,0.2)" }}>
                        <div className="flex items-start gap-2">
                          <AlertCircle size={13} className="mt-0.5 shrink-0" style={{ color: "#dc2626" }} />
                          <p className="text-[11px] font-semibold leading-snug" style={{ color: "#dc2626" }}>Please enter and verify Aadhaar Registered Mobile Number</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 rounded-xl border px-3 py-3 text-center" style={{ backgroundColor: isDarkMode ? "rgba(18,12,40,0.7)" : "rgba(245,243,255,0.8)", borderColor: isDarkMode ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.12)" }}>
                        <div className="mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-white" style={{ background: premiumGradient }}>
                          <CreditCard size={13} />
                          VERIFICATION BY TELECOM
                        </div>
                        <p className="mt-2 text-[11px] leading-relaxed" style={{ color: verifyTextMuted }}>Enter the applicant&apos;s 10-digit registered mobile number. Ensure the name matches telecom records.</p>
                      </div>
                    )}

                    <div className="mb-2.5 flex h-11 items-center gap-2 rounded-xl border px-3" style={{ backgroundColor: verifyInputBg, borderColor: verifyInputBorderC }}>
                      <Fingerprint size={15} style={{ color: verifyTextMuted, flexShrink: 0 }} />
                      <input type="tel" maxLength={10} inputMode="numeric" placeholder="Mobile number" value={verifyMobile} disabled={verifyOtpSent} onChange={(e) => setVerifyMobile(e.target.value.replace(/\D/g, ""))} className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none border-none focus:ring-0 disabled:opacity-60" style={{ color: verifyTextPrimary }} />
                      {!verifyOtpSent ? (
                        <button type="button" onClick={handleVerifySendOtp} disabled={verifyIsSending || verifyMobile.length !== 10} className="shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white disabled:opacity-50" style={{ background: premiumGradient }}>
                          {verifyIsSending ? "..." : "SEND OTP"}
                        </button>
                      ) : null}
                    </div>

                    {verifyOtpSent ? (
                      <div className="mb-2.5 space-y-2 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: verifyTextMuted }}>Enter 6-digit OTP</p>
                        <div className="flex justify-center gap-1.5">
                          {verifyOtp.map((digit, index) => (
                            <input key={index} ref={(el) => { verifyInputRefs.current[index] = el; }} value={digit} maxLength={1} inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} onChange={(e) => handleVerifyOtpChange(index, e.target.value)} onKeyDown={(e) => handleVerifyOtpKeyDown(index, e)} onPaste={handleVerifyOtpPaste} className="h-10 w-9 rounded-lg border text-center text-sm font-black outline-none" style={{ backgroundColor: digit ? verifyOtpFilled : verifyInputBg, borderColor: digit ? "rgba(124,58,237,0.7)" : verifyOtpBorder, color: verifyTextPrimary }} />
                          ))}
                        </div>
                        <button type="button" onClick={() => verifyTimer === 0 && handleVerifySendOtp()} disabled={verifyTimer > 0} className="text-[10px] font-semibold disabled:opacity-40" style={{ color: isDarkMode ? "rgba(167,139,250,1)" : "#7c3aed" }}>
                          {verifyTimer > 0 ? `Resend OTP in ${verifyTimer}s` : "Resend OTP"}
                        </button>
                      </div>
                    ) : null}

                    {verifyActiveTab === "pan" ? (
                      <div className="mb-2.5 flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5" style={{ borderColor: verifyIsChecked ? "rgba(124,58,237,0.5)" : verifyInputBorderC, backgroundColor: verifyIsChecked ? (isDarkMode ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.06)") : verifyInputBg }} onClick={() => setVerifyIsChecked((c) => !c)}>
                        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border" style={{ background: verifyIsChecked ? premiumGradient : "transparent", borderColor: verifyIsChecked ? "transparent" : verifyInputBorderC }}>
                          {verifyIsChecked ? <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
                        </div>
                        <span className="text-[11px] leading-[1.55]" style={{ color: verifyTextMuted }}>
                          I authorize verification of the mobile number and name with telecom records.
                          <br />
                          <span className="cursor-pointer font-semibold underline underline-offset-2" style={{ color: isDarkMode ? "rgba(167,139,250,1)" : "#7c3aed" }} onClick={(e) => e.stopPropagation()}>You must accept the terms and conditions</span> to continue.
                        </span>
                      </div>
                    ) : null}

                    <button type="button" onClick={handleVerifySubmit} disabled={!canContinue || verifyIsVerifying} className="group flex w-full items-center justify-between rounded-xl px-5 py-3 text-[12px] font-black uppercase tracking-[0.18em] text-white disabled:opacity-40" style={{ background: canContinue ? premiumGradient : isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.15)" }}>
                      <ShieldCheck size={16} strokeWidth={2.5} />
                      <span>{verifyIsVerifying ? "Verifying..." : "CONTINUE"}</span>
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </button>

                    <div className="mt-3 flex items-center justify-center gap-2">
                      <div className="h-px flex-1" style={{ background: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.1)" }} />
                      <div className="flex items-center gap-1.5" style={{ color: verifyTextMuted }}>
                        <Lock size={9} />
                        <span className="text-[10px] font-medium">Your data is safe and encrypted</span>
                      </div>
                      <div className="h-px flex-1" style={{ background: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.1)" }} />
                    </div>
                  </div>
                </div>
              ) : null}
            </section>

            {/* STEP 3: APPLICANT DETAILS */}
            <section className="overflow-hidden rounded-xl border transition-all duration-300" style={{ borderColor: isDarkMode ? colors.inputBorder : colors.border, backgroundColor: isDarkMode ? colors.panelStrong : colors.card }}>
              <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={() => { if (isVerified || !showVerify) setActiveStep(activeStep === 3 ? (0 as any) : 3); }}>
                <div className="flex items-center gap-3">
                  {activeStep > 3 ? <CheckCircle2 size={18} className="text-green-500" /> : <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm" style={{ background: activeStep === 3 ? premiumGradient : "transparent", backgroundColor: activeStep === 3 ? "transparent" : isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", color: activeStep === 3 ? "#fff" : textMuted }}>3</span>}
                  <h2 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: activeStep === 3 ? textPrimary : textMuted }}>Applicant Details</h2>
                </div>
                <ChevronDown size={16} style={{ color: textMuted, transform: activeStep === 3 ? "rotate(180deg)" : "none", transition: "transform 0.3s" }} />
              </button>

              {activeStep === 3 ? (
                <div className="border-t p-4" style={{ borderColor: isDarkMode ? colors.inputBorder : colors.border }}>
                  <div className="space-y-6">
                    <div>
                      <SectionHeader title="Personal Information" textColor={textPrimary} />
                      <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                        <ThemeInput name="name" label="Full Name" value={formData.name} onChange={handleChange} colors={colors} required />
                        <ThemeInput name="pan" label="PAN No" value={formData.pan} onChange={handleChange} colors={colors} required />
                        <ThemeSelect name="gender" label="Gender" options={["Select", "Male", "Female"]} value={formData.gender} onChange={handleChange} colors={colors} />
                        <ThemeInput name="dob" label="DOB" placeholder="DD-MM-YYYY" value={formData.dob} onChange={handleChange} colors={colors} />
                        <ThemeInput name="email" label="Email" value={formData.email} onChange={handleChange} colors={colors} />
                        <ThemeInput name="mobile" label="Mobile" value={formData.mobile} readOnly muted colors={colors} />
                      </div>
                    </div>

                    <div>
                      <SectionHeader title="Address Details" textColor={textPrimary} />
                      <div className="space-y-2">
                        <div className="w-full">
                          <Label text="Full Address" colors={colors} required />
                          <textarea name="address" value={formData.address} onChange={handleChange} className="w-full rounded-md border px-3 py-2 text-[13px] font-bold outline-none transition focus:ring-2" style={{ backgroundColor: "var(--form-field-bg)", borderColor: "var(--form-field-border)", color: "var(--form-field-text)", minHeight: "80px", boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }} />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <ThemeInput name="pincode" label="Pincode" value={formData.pincode} onChange={handleChange} colors={colors} />
                          <ThemeInput name="city" label="City" value={formData.city} onChange={handleChange} colors={colors} />
                          <ThemeInput name="state" label="State" value={formData.state} onChange={handleChange} colors={colors} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <SectionHeader title="Security" textColor={textPrimary} />
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <ThemeInput name="ekycId" label="eKYC ID" value={formData.ekycId} onChange={handleChange} colors={colors} />
                        <div className="w-full">
                          <Label text="eKYC PIN" colors={colors} required />
                          <div className="flex h-10">
                            <input name="ekycPin" type={showPin ? "text" : "password"} value={formData.ekycPin} onChange={handleChange} className="w-full rounded-l-md border px-3 text-[13px] font-bold outline-none transition focus:ring-2" style={{ backgroundColor: "var(--form-field-bg)", borderColor: "var(--form-field-border)", color: "var(--form-field-text)", boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }} />
                            <button type="button" onClick={() => setShowPin(!showPin)} className="flex h-10 w-11 shrink-0 items-center justify-center rounded-r-md border border-l-0 transition hover:brightness-110" style={{ borderColor: fieldBorder, backgroundColor: isDarkMode ? "#2a1f52" : colors.border, color: isDarkMode ? "#ffffff" : colors.text }} aria-label={showPin ? "Hide eKYC PIN" : "Show eKYC PIN"} title={showPin ? "Hide eKYC PIN" : "Show eKYC PIN"}>
                              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          {/* RIGHT PANE: DOCUMENTS & SUMMARY (30% Sticky) */}
          <aside className="w-full lg:w-[30%] space-y-4 lg:sticky lg:top-4 lg:self-start z-10">
            <div className="rounded-xl border p-4 shadow-sm" style={{ borderColor: colors.inputBorder, backgroundColor: isDarkMode ? colors.panelStrong : colors.card }}>
              <SectionHeader title="Documents" step={4} textColor={textPrimary} />
              <div className="space-y-3 mt-3">
                {/* PHOTO */}
                <PhotoBox
                  file={photoFile}
                  existingUrl={existingUserUrls.photo}
                  isVerified={!!(existingUserUrls.photo && (!resubmissionFlags || !resubmissionFlags.photo))}
                  isResubmission={!!resubmissionFlags?.photo}
                  colors={colors}
                  isDarkMode={isDarkMode}
                  onChoose={() => photoRef.current?.click()}
                  onReplace={() => { setPhotoFile(null); photoRef.current?.click(); }}
                />
                <input type="file" ref={photoRef} className="hidden" accept="image/*,.pdf" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 2 * 1024 * 1024) { alert("File size must be less than 2MB"); return; } setPhotoFile(file); }} />
                {/* ID PROOF */}
                <FileBox
                  label="Identity Proof"
                  emoji="🪪"
                  file={idFile}
                  existingUrl={existingUserUrls.idProof}
                  onClick={() => idProofRef.current?.click()}
                  onReplace={() => { setIdFile(null); idProofRef.current?.click(); }}
                  colors={colors}
                  isVerified={!!(existingUserUrls.idProof && (!resubmissionFlags || !resubmissionFlags.idProof))}
                  isResubmission={!!resubmissionFlags?.idProof}
                />
                <input type="file" ref={idProofRef} className="hidden" accept=".pdf,image/*" onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
                {/* ADDRESS PROOF */}
                <FileBox
                  label="Address Proof"
                  emoji="🏠"
                  file={addressFile}
                  existingUrl={existingUserUrls.addressProof}
                  onClick={() => addressRef.current?.click()}
                  onReplace={() => { setAddressFile(null); addressRef.current?.click(); }}
                  colors={colors}
                  isVerified={!!(existingUserUrls.addressProof && (!resubmissionFlags || !resubmissionFlags.addressProof))}
                  isResubmission={!!resubmissionFlags?.addressProof}
                />
                <input type="file" ref={addressRef} className="hidden" accept=".pdf,image/*" onChange={(e) => setAddressFile(e.target.files?.[0] || null)} />
              </div>
            </div>
<div
  className="rounded-xl border overflow-hidden shadow-sm"
  style={{
    borderColor: colors.inputBorder,
    backgroundColor: isDarkMode ? colors.panelStrong : colors.card,
  }}
>
  {/* Header */}
  <div
    className="border-b px-4 py-3"
    style={{ borderColor: colors.inputBorder }}
  >
    <SectionHeader
      title="Pricing Summary"
      step={5}
      textColor={textPrimary}
    />

    <p
      className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-60"
      style={{ color: colors.text }}
    >
      Including GST
    </p>
  </div>

  {/* Pricing Table */}

  <table className="w-full border-collapse text-center">
    <thead>
      <tr>
        <th
          className="border-r border-b px-2 py-2 text-[10px] font-bold uppercase"
          style={{
            borderColor: colors.inputBorder,
            color: colors.muted,
          }}
        >
          Certificate
        </th>

        <th
          className="border-r border-b px-2 py-2 text-[10px] font-bold uppercase"
          style={{
            borderColor: colors.inputBorder,
            color: colors.muted,
          }}
        >
          Token
        </th>

        <th
          className="border-b px-2 py-2 text-[10px] font-bold uppercase"
          style={{
            borderColor: colors.inputBorder,
            color: colors.muted,
          }}
        >
          Assisted
        </th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td
          className="border-r px-2 py-3 text-[15px] font-black"
          style={{
            borderColor: colors.inputBorder,
            color: colors.text,
          }}
        >
          ₹ {pricing.certificate}
        </td>

        <td
          className="border-r px-2 py-3 text-[15px] font-black"
          style={{
            borderColor: colors.inputBorder,
            color: colors.text,
          }}
        >
          ₹ {pricing.token}
        </td>

        <td
          className="px-2 py-3 text-[15px] font-black"
          style={{
            color: colors.text,
          }}
        >
          ₹ {pricing.assisted}
        </td>
      </tr>
    </tbody>
  </table>

  {/* Total */}

  <div
    className="border-t px-3 py-3"
    style={{
      borderColor: colors.inputBorder,
      background: `${colors.accent}10`,
    }}
  >
    <div className="flex items-center justify-between">
      <span
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: colors.muted }}
      >
        Total Payable
      </span>

      <span
        className="text-lg font-black"
        style={{ color: colors.accent }}
      >
        ₹ {pricing.total}
      </span>
    </div>

    <p
      className="mt-1 text-right text-[9px]"
      style={{ color: colors.muted }}
    >
      GST Included
    </p>
  </div>
</div>

            <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-[12px] font-black uppercase tracking-widest text-white transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg disabled:opacity-50" style={{ background: premiumGradient, boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
              {loading ? "PROCESSING..." : "SUBMIT APPLICATION"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </aside>

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

function SectionHeader({ title, step, textColor }: { title: string; step?: number; textColor?: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      {step !== undefined && (
        <span
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #38BDF8 0%, #8B5CF6 50%, #A855F7 100%)" }}
        >
          {step}
        </span>
      )}
      <h3 className="text-[13px] font-bold uppercase tracking-wider" style={{ color: textColor || "currentColor" }}>
        {title}
      </h3>
    </div>
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

function PhotoBox({
  file,
  existingUrl,
  isVerified,
  isResubmission,
  colors,
  isDarkMode,
  onChoose,
  onReplace,
}: {
  file: File | null;
  existingUrl?: string;
  isVerified?: boolean;
  isResubmission?: boolean;
  colors: ThemeColors;
  isDarkMode: boolean;
  onChoose: () => void;
  onReplace: () => void;
}) {
  const hasFile = !!file;
  const uploaded = hasFile || isVerified;

  if (uploaded) {
    return (
      <div
        className="w-full rounded-xl border p-3 flex items-center gap-3"
        style={{
          borderColor: isResubmission ? "rgba(244,63,94,0.55)" : colors.accent,
          backgroundColor: `${colors.accent}10`,
        }}
      >
        {/* Thumbnail or placeholder */}
        <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden border flex items-center justify-center" style={{ borderColor: colors.inputBorder, backgroundColor: colors.input }}>
          {file && file.type.startsWith("image/") ? (
            <img src={URL.createObjectURL(file)} alt="Photo" className="w-full h-full object-cover" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, color: colors.text }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase" style={{ color: colors.muted }}>Photo</p>
          <p className="text-[11px] font-extrabold" style={{ color: "#10b981" }}>✓ Uploaded</p>
          <p className="text-[9px] truncate opacity-40" style={{ color: colors.text }}>{file ? file.name : "Existing photo"}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          {file && file.type.startsWith("image/") && (
            <a href={URL.createObjectURL(file)} target="_blank" rel="noreferrer"
              className="text-[8px] font-black uppercase px-2 py-1 rounded border text-center"
              style={{ borderColor: colors.accent, color: colors.accent }}
              onClick={(e) => e.stopPropagation()}
            >Preview</a>
          )}
          {!file && existingUrl && (
            <a href={existingUrl} target="_blank" rel="noreferrer"
              className="text-[8px] font-black uppercase px-2 py-1 rounded border text-center"
              style={{ borderColor: colors.accent, color: colors.accent }}
              onClick={(e) => e.stopPropagation()}
            >Preview</a>
          )}
          <button type="button" onClick={onReplace}
            className="text-[8px] font-black uppercase px-2 py-1 rounded text-white"
            style={{ backgroundColor: colors.accent }}
          >Replace</button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onChoose}
      className="relative flex h-20 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed transition hover:-translate-y-0.5"
      style={{ borderColor: isResubmission ? "rgba(244,63,94,0.55)" : colors.accent, backgroundColor: isDarkMode ? `${colors.accent}08` : colors.input }}
    >
      <p className="text-[11px] font-black uppercase opacity-60" style={{ color: colors.text }}>Click to upload Photo</p>
      {isResubmission && <span className="mt-1 rounded bg-rose-500/10 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-rose-500 animate-pulse">Resubmission Required</span>}
    </div>
  );
}

function FileBox({
  label,
  emoji,
  file,
  existingUrl,
  onClick,
  onReplace,
  colors,
  isVerified,
  isResubmission,
}: {
  label: string;
  emoji: string;
  file: File | null;
  existingUrl?: string;
  onClick: () => void;
  onReplace: () => void;
  colors: ThemeColors;
  isVerified?: boolean;
  isResubmission?: boolean;
}) {
  const uploaded = !!file || isVerified;

  if (uploaded) {
    return (
      <div
        className="w-full rounded-xl border p-3 flex items-center gap-3"
        style={{
          borderColor: isResubmission ? "rgba(244,63,94,0.55)" : colors.accent,
          backgroundColor: `${colors.accent}10`,
        }}
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-md border flex items-center justify-center" style={{ borderColor: colors.inputBorder, backgroundColor: colors.input }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, color: colors.text }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase" style={{ color: colors.muted }}>{label}</p>
          <p className="text-[11px] font-extrabold" style={{ color: "#10b981" }}>✓ Uploaded</p>
          <p className="text-[9px] truncate opacity-40" style={{ color: colors.text }}>{file ? file.name : "Existing document"}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          {file && (
            <a href={URL.createObjectURL(file)} target="_blank" rel="noreferrer"
              className="text-[8px] font-black uppercase px-2 py-1 rounded border text-center"
              style={{ borderColor: colors.accent, color: colors.accent }}
              onClick={(e) => e.stopPropagation()}
            >Preview</a>
          )}
          {!file && existingUrl && (
            <a href={existingUrl} target="_blank" rel="noreferrer"
              className="text-[8px] font-black uppercase px-2 py-1 rounded border text-center"
              style={{ borderColor: colors.accent, color: colors.accent }}
              onClick={(e) => e.stopPropagation()}
            >Preview</a>
          )}
          <button type="button" onClick={onReplace}
            className="text-[8px] font-black uppercase px-2 py-1 rounded text-white"
            style={{ backgroundColor: colors.accent }}
          >Replace</button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed px-3 transition hover:-translate-y-0.5"
      style={{
        borderColor: isResubmission ? "rgba(244,63,94,0.55)" : colors.accent,
        backgroundColor: `${colors.accent}08`,
      }}
    >
      <div className="flex-1">
        <p className="text-[10px] font-black uppercase" style={{ color: colors.muted }}>{label}</p>
        <p className="text-[9px] opacity-40" style={{ color: colors.text }}>
          {isResubmission ? "Resubmission required" : "Click to upload"}
        </p>
      </div>
      <span
        className="text-[8px] font-black uppercase px-2 py-1 rounded text-white"
        style={{ backgroundColor: isResubmission ? "#f43f5e" : colors.accent }}
      >
        {isResubmission ? "Fix" : "Upload"}
      </span>
    </div>
  );
}





