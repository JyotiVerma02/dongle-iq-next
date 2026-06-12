/* eslint-disable @next/next/no-img-element */
"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Moon, SunMedium } from "lucide-react";
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

export default function DongleIQFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-black" />}>
      <DongleIQForm />
    </Suspense>
  );
}

function DongleIQForm() {
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

  return (
    <div
      className="flex min-h-screen w-full flex-col overflow-hidden p-2 md:p-4"
      style={formShellStyle}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 w-full flex-col overflow-hidden rounded-xl border shadow-xl"
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
                      accept=".jpg,.jpeg,.png,.pdf"
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
                    accept=".jpg,.jpeg,.png,.pdf"
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
                    accept=".jpg,.jpeg,.png,.pdf"
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

