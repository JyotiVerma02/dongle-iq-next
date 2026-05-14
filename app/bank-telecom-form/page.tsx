/* eslint-disable @next/next/no-img-element */
"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Moon, SunMedium } from "lucide-react";
import {
  APPLICATION_CONFIG_KEY,
  fileToStoredFile,
  readFormState,
  saveFormState,
  savePreviewDraft,
} from "@/app/lib/applicationPreview";
import { calculatePricing } from "@/app/lib/pricing";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

// Types and Initial State remain same
type FormState = {
  name: string; gender: string; dob: string; pan: string; email: string;
  mobile: string; ekycId: string; ekycPin: string; bpCode: string;
  address: string; pincode: string; city: string; state: string;
  certificateClass: string; tokenType: string; certType: string;
  validity: string; addressProof: string; idProof: string;
  bpAvailable: string; internalRemarks: string; photo: string;
  assistedService: string; price: string;
};

interface ThemeProps { colors: ReturnType<typeof getThemePalette>; }
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, ThemeProps { label: string; muted?: boolean; }
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, ThemeProps { label: string; options: string[]; }

const createInitialState = (mobile: string): FormState => ({
  name: "", gender: "", dob: "", pan: "", email: "", mobile,
  ekycId: "", ekycPin: "", bpCode: "", address: "", pincode: "",
  city: "", state: "", certificateClass: "Class III", tokenType: "Not Required",
  certType: "Signature", validity: "2 Years", addressProof: "", idProof: "",
  bpAvailable: "Yes", internalRemarks: "", photo: "", assistedService: "Not Required", price: "800",
});

export default function DongleIQFormPage() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-black" />}>
      <DongleIQForm />
    </Suspense>
  );
}

function DongleIQForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const sectionGreen = "#10b981"; 

  const photoRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const idProofRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormState>(createInitialState(""));
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);

  useEffect(() => {
    const mobile = searchParams.get("mobile") || sessionStorage.getItem("verifiedMobile") || "";
    const rawConfig = sessionStorage.getItem(APPLICATION_CONFIG_KEY);
    const restoreState = () => {
      let nextState = createInitialState(mobile);
      const saved = readFormState();
      if (saved) nextState = { ...nextState, ...saved };
      if (rawConfig) {
        try { Object.assign(nextState, JSON.parse(rawConfig)); } catch (e) {}
      }
      const pricing = calculatePricing({
        certType: nextState.certType, validity: nextState.validity,
        tokenType: nextState.tokenType, assistedService: nextState.assistedService,
      });
      setFormData({ ...nextState, price: String(pricing.total) });
    };
    restoreState();
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      const pricing = calculatePricing({
        certType: next.certType, validity: next.validity,
        tokenType: next.tokenType, assistedService: next.assistedService,
      });
      const updated = { ...next, price: String(pricing.total) };
      saveFormState(updated);
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile || !idFile || !addressFile) return alert("All files required.");
    setLoading(true);
    try {
      const [photo, idProof, addressProof] = await Promise.all([
        fileToStoredFile(photoFile), fileToStoredFile(idFile), fileToStoredFile(addressFile),
      ]);
      savePreviewDraft({ formData, files: { photo, idProof, addressProof } });
      router.push("/preview");
    } catch (error) { alert("Error processing files."); } finally { setLoading(false); }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden p-2 md:p-4" style={{ backgroundColor: isDarkMode ? "#000000" : colors.panelStrong }}>
      <form onSubmit={handleSubmit} className="flex flex-1 w-full flex-col overflow-hidden rounded-xl border shadow-xl"
        style={{ backgroundColor: isDarkMode ? colors.panelStrong : colors.card, borderColor: isDarkMode ? colors.inputBorder : colors.border }}>
        
        <header className="flex shrink-0 items-center justify-between border-b px-5 py-3"
          style={{ backgroundColor: isDarkMode ? colors.panel : colors.accentSubtle, borderColor: isDarkMode ? colors.inputBorder : colors.border }}>
          <div className="flex gap-6">
            <HeaderStat label="Class" value={formData.certificateClass} color={colors.accent} />
            <HeaderStat label="Type" value={formData.certType} color={colors.accent} />
            <HeaderStat label="Price" value={`₹${formData.price}`} color={colors.accent} />
          </div>
          <button type="button" onClick={toggleTheme} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[10px] font-bold"
            style={{ backgroundColor: colors.card, borderColor: colors.borderSoft, color: colors.text }}>
            {isDarkMode ? <SunMedium size={14} /> : <Moon size={14} />} {isDarkMode ? "Light" : "Dark"}
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="grid w-full grid-cols-1 md:grid-cols-12 overflow-hidden">
            
            {/* LEFT SIDE: Tightened spacing to prevent scrolling */}
            <section className="md:col-span-8 flex flex-col border-r" style={{ borderColor: isDarkMode ? colors.inputBorder : colors.border }}>
              <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                <div>
                  <SectionHeader title="Personal Information" color={sectionGreen} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <ThemeInput name="name" label="Full Name" value={formData.name} onChange={handleChange} colors={colors} required />
                    <ThemeInput name="pan" label="PAN No" value={formData.pan} onChange={handleChange} colors={colors} required />
                    <ThemeSelect name="gender" label="Gender" options={["Select", "Male", "Female"]} value={formData.gender} onChange={handleChange} colors={colors} />
                    <ThemeInput name="dob" label="DOB" placeholder="DD-MM-YYYY" value={formData.dob} onChange={handleChange} colors={colors} />
                    <ThemeInput name="email" label="Email" value={formData.email} onChange={handleChange} colors={colors} />
                    <ThemeInput name="mobile" label="Mobile" value={formData.mobile} readOnly muted colors={colors} />
                  </div>
                </div>

                <div>
                  <SectionHeader title="Address Details" color={sectionGreen} />
                  <div className="space-y-2">
                    <div className="w-full">
                      <Label text="Full Address" colors={colors} required />
                      <textarea name="address" value={formData.address} onChange={handleChange}
                        className="w-full rounded-md border px-3 py-2 text-[13px] font-bold outline-none"
                        style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text, minHeight: "50px" }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <ThemeInput name="pincode" label="Pincode" value={formData.pincode} onChange={handleChange} colors={colors} />
                      <ThemeInput name="city" label="City" value={formData.city} onChange={handleChange} colors={colors} />
                      <ThemeInput name="state" label="State" value={formData.state} onChange={handleChange} colors={colors} />
                    </div>
                  </div>
                </div>

                <div>
                  <SectionHeader title="Security" color={sectionGreen} />
                  <div className="grid grid-cols-2 gap-4">
                    <ThemeInput name="ekycId" label="eKYC ID" value={formData.ekycId} onChange={handleChange} colors={colors} />
                    <div className="w-full">
                      <Label text="eKYC PIN" colors={colors} required />
                      <div className="flex h-9">
                        <input name="ekycPin" type={showPin ? "text" : "password"} value={formData.ekycPin} onChange={handleChange}
                          className="w-full rounded-l-md border px-3 text-[13px] font-bold outline-none"
                          style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }} />
                        <button type="button" onClick={() => setShowPin(!showPin)} className="rounded-r-md border border-l-0 px-3 text-[9px] font-black uppercase"
                          style={{ borderColor: colors.inputBorder, backgroundColor: isDarkMode ? colors.panel : colors.border }}>
                          {showPin ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside className="md:col-span-4 flex flex-col overflow-hidden" style={{ backgroundColor: isDarkMode ? colors.panel : colors.accentSubtle }}>
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">
                <SectionHeader title="Documents" color={sectionGreen} />
                <div className="flex flex-col gap-3">
                  <div onClick={() => photoRef.current?.click()} className="relative flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed overflow-hidden"
                    style={{ borderColor: colors.accent, backgroundColor: colors.input }}>
                    <input type="file" ref={photoRef} className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                    {photoFile ? <img src={URL.createObjectURL(photoFile)} alt="User" className="h-full w-full object-cover" /> : <p className="text-[10px] font-black uppercase opacity-60">Photo</p>}
                  </div>
                  <FileBox label="Identity Proof" file={idFile} onClick={() => idProofRef.current?.click()} colors={colors} />
                  <input type="file" ref={idProofRef} className="hidden" onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
                  <FileBox label="Address Proof" file={addressFile} onClick={() => addressRef.current?.click()} colors={colors} />
                  <input type="file" ref={addressRef} className="hidden" onChange={(e) => setAddressFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="border-t p-5" style={{ borderColor: isDarkMode ? colors.inputBorder : colors.border }}>
                <button type="submit" disabled={loading} className="w-full rounded-lg py-3.5 text-[11px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: colors.accent }}>
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
function HeaderStat({ label, value, color }: { label: string; value: string; color: string; }) {
  return (
    <div>
      <p className="text-[7px] font-black uppercase opacity-40 leading-tight">{label}</p>
      <p className="text-[12px] font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function SectionHeader({ title, color }: { title: string; color: string }) {
  return <h3 className="mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color }}>{title}</h3>;
}

function Label({ text, required, colors }: { text: string; required?: boolean; colors: any }) {
  return (
    <label className="mb-1 block text-[9px] font-black uppercase opacity-60">
      {text} {required && <span style={{ color: colors.accent }}>*</span>}
    </label>
  );
}

function ThemeInput({ label, required, colors, muted, ...props }: InputProps) {
  return (
    <div className="w-full">
      <Label text={label} required={required} colors={colors} />
      <input {...props} className="h-9 w-full rounded-md border px-3 text-[13px] font-bold outline-none"
        style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: muted ? colors.muted : colors.text }} />
    </div>
  );
}

function ThemeSelect({ label, options, required, colors, ...props }: SelectProps) {
  return (
    <div className="w-full">
      <Label text={label} required={required} colors={colors} />
      <select {...props} className="h-9 w-full rounded-md border px-3 text-[13px] font-bold outline-none"
        style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function FileBox({ label, file, onClick, colors }: { label: string; file: File | null; onClick: () => void; colors: any }) {
  return (
    <div className="w-full">
      <Label text={label} colors={colors} />
      <div onClick={onClick} className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border px-3"
        style={{ borderColor: colors.inputBorder, backgroundColor: colors.input }}>
        <span className="truncate text-[9px] font-bold opacity-60">{file ? file.name : "Choose File..."}</span>
        <span className="text-[8px] font-black uppercase px-2 py-1 rounded text-white" style={{ backgroundColor: "#10b981" }}>Upload</span>
      </div>
    </div>
  );
}