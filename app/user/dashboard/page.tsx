/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ParticleBackground from "@/components/ParticleBackground";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

type FormDataType = {
  name: string;
  email: string;
  mobile: string;
  userType: string;
  classType: string;
  certType: string;
  validity: string;
  tokenType: string;
  assistedService: string;
  ekycType: string;
};

export default function DSCRegistrationForm() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    mobile: "",
    userType: "Individual",
    classType: "Class III",
    certType: "",
    validity: "",
    tokenType: "Not Required",
    assistedService: "Not Required",
    ekycType: "PAN",
  });

  const pricing = useMemo(() => {
    let certificate = 0;

    if (formData.certType === "Signing & Encryption") {
      if (formData.validity === "1 Year") certificate = 1200;
      if (formData.validity === "2 Years") certificate = 1779;
      if (formData.validity === "3 Years") certificate = 2400;
    } else if (formData.certType === "Signature") {
      certificate = 800;
    }

    const token = formData.tokenType === "USB Token" ? 500 : 0;
    const assisted = formData.assistedService === "Required" ? 355 : 0;

    return {
      certificate,
      token,
      assisted,
      total: certificate + token + assisted,
    };
  }, [formData]);

  const isProductSelected = Boolean(formData.certType && formData.validity);

  const updateField = (key: keyof FormDataType, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.mobile || !formData.certType || !formData.validity) {
      setError("Please complete all required details.");
      return;
    }

    setError("");

    try {
      const response = await fetch("/api/user-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, totalAmount: pricing.total }),
      });

      const data = await response.json();

      if (!data.success) {
        alert("Could not start verification.");
        return;
      }

      router.push(formData.ekycType === "Aadhaar" ? "/verify-aadhaar" : "/verify");
    } catch {
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="theme-transition relative min-h-screen px-6 pb-10 pt-34" style={{ color: colors.text }}>
      <ParticleBackground />

      <form onSubmit={handleSubmit} className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section
          className="theme-transition grid items-center gap-8 rounded-[2.5rem] border p-10 shadow-[0_24px_80px_rgba(0,0,0,0.16)] md:grid-cols-[0.95fr_1.05fr]"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <div className="flex justify-center">
            <img
              src="/dscform-removebg-preview.png"
              alt="DSC enrollment"
              className="h-auto w-full max-w-sm transition-transform duration-700 hover:scale-105"
              style={{
                filter: isDarkMode
                  ? "drop-shadow(0 0 18px rgba(124,58,237,0.28))"
                  : "drop-shadow(0 16px 26px rgba(109,40,217,0.14)) saturate(0.95) contrast(1.03)",
                opacity: isDarkMode ? 0.84 : 0.96,
              }}
            />
          </div>

          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="h-0.5 w-12" style={{ backgroundColor: colors.accent }} />
              <h1 className="text-4xl font-light uppercase tracking-tight" style={{ color: colors.text }}>
                DSC <span className="font-black" style={{ color: colors.accent }}>Enrollment</span>
              </h1>
            </div>

            <div className="grid gap-6">
              {[
                { label: "Full Name", type: "text", key: "name" },
                { label: "Email Address", type: "email", key: "email" },
                { label: "Mobile Number", type: "tel", key: "mobile" },
              ].map((field) => (
                <FieldLabel key={field.key} label={field.label} required colors={colors}>
                  <input
                    type={field.type}
                    value={formData[field.key as keyof FormDataType]}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    onChange={(event) => updateField(field.key as keyof FormDataType, event.target.value)}
                    className="theme-transition w-full rounded-2xl border px-4 py-4 text-sm font-semibold outline-none"
                    style={{
                      color: colors.text,
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                    }}
                  />
                </FieldLabel>
              ))}
            </div>
          </div>
        </section>

        <section
          className="theme-transition rounded-[2.5rem] border p-10 shadow-[0_24px_80px_rgba(0,0,0,0.16)] md:p-14"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <h2 className="mb-10 text-center text-xs font-black uppercase tracking-[0.4em]" style={{ color: colors.muted }}>
            Service Configuration
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "User Category", key: "userType", options: ["Individual", "Organization", "Foreign Individual"], required: false },
              { label: "Certificate Class", key: "classType", options: ["Class III"], required: false },
              { label: "Service Type", key: "certType", options: ["Encryption", "Signature", "Signing & Encryption"], required: true },
              { label: "Validity", key: "validity", options: ["1 Year", "2 Years", "3 Years"], required: true },
              { label: "USB Token", key: "tokenType", options: ["Not Required", "USB Token"], required: false },
              { label: "Assisted Service", key: "assistedService", options: ["Not Required", "Required"], required: false },
            ].map((item) => (
              <FieldLabel key={item.key} label={item.label} required={item.required} colors={colors}>
                <select
                  value={formData[item.key as keyof FormDataType]}
                  onChange={(event) => updateField(item.key as keyof FormDataType, event.target.value)}
                  className="theme-transition w-full cursor-pointer rounded-xl border px-3 py-3.5 text-sm font-bold outline-none"
                  style={{
                    color: colors.text,
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                  }}
                >
                  {(item.key === "certType" || item.key === "validity") && (
                    <option value="">{`Select ${item.label}`}</option>
                  )}
                  {item.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FieldLabel>
            ))}

            <div className="mt-4 md:col-span-2 lg:col-span-3">
              {!isProductSelected ? (
                <div
                  className="theme-transition flex min-h-[110px] flex-col items-center justify-center rounded-2xl border border-dashed p-6"
                  style={{ backgroundColor: colors.panel, borderColor: colors.borderSoft }}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.muted }}>
                    Select service type and validity to see pricing
                  </p>
                </div>
              ) : (
                <div
                  className="theme-transition flex flex-col items-center justify-between gap-8 rounded-2xl border p-8 md:flex-row"
                  style={{ backgroundColor: `${colors.accent}12`, borderColor: colors.border }}
                >
                  <div className="text-center md:text-left">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: colors.accent }}>
                      Total Investment
                    </span>
                    <div className="text-4xl font-black" style={{ color: colors.text }}>
                      INR {pricing.total}
                    </div>
                  </div>

                  <div className="flex gap-6 text-center" style={{ color: colors.text }}>
                    <PriceUnit label="Cert" value={pricing.certificate} muted={colors.muted} divider={colors.borderSoft} />
                    <PriceUnit label="Token" value={pricing.token} muted={colors.muted} divider={colors.borderSoft} />
                    <PriceUnit label="Assist" value={pricing.assisted} muted={colors.muted} divider="" last />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-8 border-t pt-12 md:flex-row" style={{ borderColor: colors.borderSoft }}>
            <div
              className="theme-transition flex flex-col gap-4 rounded-2xl border px-6 py-4 md:flex-row md:items-center md:gap-6"
              style={{ backgroundColor: colors.panel, borderColor: colors.borderSoft }}
            >
              <span className="text-[11px] font-black uppercase" style={{ color: colors.muted }}>
                eKYC Mode:
              </span>
              <div className="flex gap-6">
                {["PAN", "Aadhaar"].map((type) => (
                  <label key={type} className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="radio"
                      checked={formData.ekycType === type}
                      onChange={() => updateField("ekycType", type)}
                      className="h-5 w-5 accent-purple-600"
                    />
                    <span className="text-sm font-bold" style={{ color: colors.text }}>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 md:items-end">
              {error ? <p className="text-[11px] font-black uppercase text-rose-500">{error}</p> : null}
              <button
                type="submit"
                className="theme-transition rounded-2xl px-14 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl"
                style={{ backgroundColor: colors.accent, boxShadow: `0 18px 35px -18px ${colors.glow}` }}
              >
                Generate Application
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}

function FieldLabel({
  label,
  required,
  colors,
  children,
}: {
  label: string;
  required?: boolean;
  colors: ReturnType<typeof getThemePalette>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="ml-1 text-[10px] font-bold uppercase" style={{ color: colors.muted }}>
        {label} {required ? <span style={{ color: colors.accent }}>*</span> : null}
      </label>
      {children}
    </div>
  );
}

function PriceUnit({
  label,
  value,
  muted,
  divider,
  last,
}: {
  label: string;
  value: number;
  muted: string;
  divider: string;
  last?: boolean;
}) {
  return (
    <div className="flex items-center gap-6">
      <div>
        <div className="text-[9px] font-bold uppercase" style={{ color: muted }}>{label}</div>
        <div className="font-bold">INR {value}</div>
      </div>
      {!last ? <div className="h-8 w-px" style={{ backgroundColor: divider }} /> : null}
    </div>
  );
}
