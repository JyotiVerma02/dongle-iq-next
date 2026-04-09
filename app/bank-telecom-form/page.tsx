/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import ParticleBackground from "@/components/ParticleBackground";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function DongleIQForm() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const photoRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const idProofRef = useRef<HTMLInputElement>(null);

  const initialState = {
    name: "",
    gender: "",
    dob: "",
    pan: "",
    email: "",
    mobile: "7295014037",
    ekycId: "",
    ekycPin: "",
    bpCode: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    certificateClass: "Class III",
    tokenType: "Not Required",
    certType: "Signing",
    validity: "2 Years",
    addressProof: "",
    idProof: "",
    bpAvailable: "Yes",
    internalRemarks: "",
    photo: "",
    price: 1245,
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(1200);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Session expired. Please verify your mobile again.");
      router.push("/verify");
      return;
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name || !formData.pan || !formData.email || !formData.address || !formData.ekycPin) {
      alert("Please fill all required fields marked with *");
      return;
    }

    if (!photoFile || !idFile || !addressFile) {
      alert("Please upload all required files");
      return;
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.pan)) {
      alert("Invalid PAN format (Example: ABCDE1234F)");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "photo" && key !== "idProof" && key !== "addressProof") {
          form.append(key, String(value));
        }
      });

      form.append("photo", photoFile);
      form.append("idProofFile", idFile);
      form.append("addressProofFile", addressFile);

      const response = await fetch("/api/save-user", {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (!data.success) {
        alert(`Error: ${data.message}`);
        setLoading(false);
        return;
      }

      alert("Form submitted successfully.");
      setFormData(initialState);
      setPhotoFile(null);
      setIdFile(null);
      setAddressFile(null);
      router.push("/admin/dashboard");
    } catch {
      alert("Critical error: could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-transition min-h-screen pb-10 pt-28" style={{ color: colors.text }}>
      <ParticleBackground />

      <div className="relative z-10 mx-auto max-w-6xl p-4 lg:p-8">
        <form
          onSubmit={handleSubmit}
          className="theme-transition overflow-hidden rounded-[2.5rem] border shadow-[0_30px_80px_rgba(0,0,0,0.16)]"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <div
            className="grid grid-cols-1 items-end gap-4 border-b p-6 md:grid-cols-5"
            style={{ backgroundColor: `${colors.accent}0d`, borderColor: colors.border }}
          >
            <ThemeSelect name="certificateClass" label="Class" options={["Class III"]} value={formData.certificateClass} onChange={handleChange} colors={colors} />
            <ThemeSelect name="tokenType" label="Token" options={["Not Required", "Required"]} value={formData.tokenType} onChange={handleChange} colors={colors} />
            <ThemeSelect name="certType" label="Type" options={["Signing", "Encryption", "Both"]} value={formData.certType} onChange={handleChange} colors={colors} />
            <ThemeSelect name="validity" label="Validity" options={["2 Years", "1 Year"]} value={formData.validity} onChange={handleChange} colors={colors} />
            <div className="pb-1 text-right">
              <span className="text-2xl font-black" style={{ color: colors.accent }}>INR {formData.price}</span>
            </div>
          </div>

          <div className="space-y-8 p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <ThemeInput name="name" label="Name as per PAN" placeholder="ENTER FULL NAME" value={formData.name} onChange={handleChange} required colors={colors} />
              <ThemeSelect name="gender" label="Gender" options={["Select Gender", "Male", "Female"]} value={formData.gender} onChange={handleChange} required colors={colors} />
              <ThemeInput name="dob" label="Date of Birth" placeholder="DD-MM-YYYY" value={formData.dob} onChange={handleChange} required colors={colors} />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <ThemeInput name="pan" label="PAN No" placeholder="ABCDE1234F" value={formData.pan} onChange={handleChange} required colors={colors} />
              <ThemeInput name="email" label="Email Address" type="email" placeholder="EMAIL@EXAMPLE.COM" value={formData.email} onChange={handleChange} required colors={colors} />
              <ThemeInput
                name="mobile"
                label="Mobile No"
                readOnly
                value={formData.mobile}
                required
                className=""
                colors={colors}
                muted
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <ThemeInput name="ekycId" label="eKYC ID" placeholder="mobile@dongle-iq" value={formData.ekycId} onChange={handleChange} required colors={colors} />
              <div>
                <Label text="eKYC PIN" required colors={colors} />
                <div className="flex h-12">
                  <input
                    name="ekycPin"
                    type={showPin ? "text" : "password"}
                    value={formData.ekycPin}
                    onChange={handleChange}
                    placeholder="6 DIGIT PIN"
                    required
                    className="theme-transition w-full rounded-l-xl border-2 px-4 text-[14px] font-bold outline-none"
                    style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((current) => !current)}
                    className="theme-transition rounded-r-xl border-2 border-l-0 px-4"
                    style={{ backgroundColor: `${colors.accent}20`, borderColor: colors.inputBorder, color: colors.accent }}
                  >
                    {showPin ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div>
                <Label text="BP Code" colors={colors} />
                <input
                  name="bpCode"
                  value={formData.bpCode}
                  onChange={handleChange}
                  placeholder="REFERENCE CODE"
                  className="theme-transition h-12 w-full rounded-xl border-2 px-4 text-[14px] font-bold outline-none"
                  style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                />
                <div className="mt-2 flex items-center gap-4 text-[10px] font-black uppercase">
                  <span style={{ color: colors.accent }}>BP Available?</span>
                  {["Yes", "No"].map((option) => (
                    <label key={option} className="flex cursor-pointer items-center gap-1.5" style={{ color: colors.muted }}>
                      <input
                        type="radio"
                        name="bpAvailable"
                        value={option}
                        checked={formData.bpAvailable === option}
                        onChange={handleChange}
                        className="h-3 w-3 accent-purple-600"
                      />
                      {option.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label text="Full Residential Address" required colors={colors} />
              <textarea
                name="address"
                placeholder="Enter complete address as per records"
                value={formData.address}
                onChange={handleChange}
                required
                className="theme-transition min-h-25 w-full rounded-2xl border-2 p-4 text-[14px] font-bold outline-none"
                style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <ThemeInput name="pincode" label="Pincode" placeholder="600001" value={formData.pincode} onChange={handleChange} required colors={colors} />
              <ThemeInput name="city" label="City" placeholder="CITY NAME" value={formData.city} onChange={handleChange} required colors={colors} />
              <ThemeInput name="state" label="State" placeholder="STATE NAME" value={formData.state} onChange={handleChange} required colors={colors} />
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <FileComponent
                label="Address Proof"
                inputRef={addressRef}
                fileName={addressFile?.name || "No file chosen"}
                colors={colors}
                setFile={(file: File) => {
                  setAddressFile(file);
                  setFormData((prev) => ({ ...prev, addressProof: file.name }));
                }}
              />
              <FileComponent
                label="Identity Proof"
                inputRef={idProofRef}
                fileName={idFile?.name || "No file chosen"}
                colors={colors}
                setFile={(file: File) => {
                  setIdFile(file);
                  setFormData((prev) => ({ ...prev, idProof: file.name }));
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <Label text="Applicant Photo" required colors={colors} />
                <input
                  type="file"
                  ref={photoRef}
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setPhotoFile(file);
                    setFormData((prev) => ({ ...prev, photo: file?.name || "" }));
                  }}
                />
                <div
                  onClick={() => photoRef.current?.click()}
                  className="theme-transition flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed shadow-inner"
                  style={{ backgroundColor: `${colors.accent}0d`, borderColor: colors.border }}
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg" style={{ backgroundColor: colors.accent }}>
                    <span className="text-xs font-black">{photoFile ? "Done" : "Add"}</span>
                  </div>
                  {photoFile ? (
                    <img
                      src={URL.createObjectURL(photoFile)}
                      alt="preview"
                      className="h-24 w-24 rounded-full border object-cover"
                      style={{ borderColor: colors.accent }}
                    />
                  ) : (
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.accent }}>
                      Click to Upload Photo
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label text="Internal Remarks" colors={colors} />
                <textarea
                  name="internalRemarks"
                  value={formData.internalRemarks}
                  onChange={handleChange}
                  placeholder="Add any specific notes for processing..."
                  className="theme-transition h-40 w-full resize-none rounded-2xl border-2 p-4 text-[14px] font-bold outline-none"
                  style={{ backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }}
                />
              </div>
            </div>
          </div>

          <div
            className="flex flex-col items-center gap-4 border-t p-8"
            style={{ backgroundColor: `${colors.accent}0d`, borderColor: colors.border }}
          >
            <button
              type="submit"
              disabled={loading}
              className="theme-transition rounded-xl px-24 py-4 text-[12px] font-black uppercase tracking-[0.3em] text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: colors.accent, boxShadow: `0 18px 35px -18px ${colors.glow}` }}
            >
              {loading ? "Processing..." : "Proceed to Summary"}
            </button>
            <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest" style={{ color: colors.muted }}>
              <span className="h-1 w-1 rounded-full" style={{ backgroundColor: colors.accent }} />
              Encrypted & Secure Session
              <span className="h-1 w-1 rounded-full" style={{ backgroundColor: colors.accent }} />
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function Label({
  text,
  required,
  colors,
}: {
  text: string;
  required?: boolean;
  colors: ReturnType<typeof getThemePalette>;
}) {
  return (
    <label className="mb-2 ml-1 block text-[9px] font-black uppercase tracking-widest" style={{ color: colors.muted }}>
      {text}
      {required ? <span style={{ color: colors.accent }}>*</span> : null}
    </label>
  );
}

function ThemeInput({
  label,
  required,
  className = "",
  colors,
  muted,
  ...props
}: any) {
  return (
    <div className="w-full">
      <Label text={label} required={required} colors={colors} />
      <input
        {...props}
        className={`theme-transition h-12 w-full rounded-xl border-2 px-4 text-[14px] font-bold outline-none ${className}`}
        style={{
          backgroundColor: colors.input,
          borderColor: colors.inputBorder,
          color: muted ? colors.muted : colors.text,
        }}
      />
    </div>
  );
}

function ThemeSelect({ label, options, required, colors, ...props }: any) {
  return (
    <div className="w-full">
      <Label text={label} required={required} colors={colors} />
      <select
        {...props}
        className="theme-transition h-12 w-full cursor-pointer appearance-none rounded-xl border-2 px-3 text-[14px] font-bold outline-none"
        style={{
          backgroundColor: colors.input,
          borderColor: colors.inputBorder,
          color: colors.text,
        }}
      >
        {options.map((option: string) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function FileComponent({ label, inputRef, fileName, setFile, colors }: any) {
  return (
    <div className="w-full">
      <Label text={label} required colors={colors} />
      <div
        className="theme-transition flex items-center gap-4 rounded-xl border-2 p-2 shadow-inner"
        style={{ backgroundColor: colors.panel, borderColor: colors.inputBorder }}
      >
        <input type="file" ref={inputRef} className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          className="theme-transition rounded-lg border px-5 py-2 text-[10px] font-black uppercase tracking-widest"
          style={{ backgroundColor: `${colors.accent}20`, borderColor: colors.border, color: colors.accent }}
        >
          Attach
        </button>
        <span className="grow truncate pr-2 text-[10px] font-bold italic" style={{ color: colors.muted }}>
          {fileName}
        </span>
      </div>
    </div>
  );
}
