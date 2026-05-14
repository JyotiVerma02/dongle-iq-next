"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ChangeEvent, FormEvent, InputHTMLAttributes } from "react";
import toast from "react-hot-toast";

import { calculatePricing } from "@/app/lib/pricing";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";
import type { DashboardUser } from "@/components/UserLedger";

type FormFields = {
  dscId: string;
  status: string;
  name: string;
  email: string;
  number: string;
  gender: string;
  dob: string;
  pan: string;
  ekycId: string;
  ekycPin: string;
  bpCode: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  certificateClass: string;
  certType: string;
  validity: string;
  tokenType: string;
  internalRemarks: string;
};

type AdminApplicationEditorProps = {
  user: Partial<DashboardUser> | null;
  saving: boolean;
  mode?: "create" | "edit";
  onSubmit: (payload: Record<string, string>) => Promise<void>;
};

export default function AdminApplicationEditor({
  user,
  saving,
  mode = "edit",
  onSubmit,
}: AdminApplicationEditorProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [formData, setFormData] = useState<FormFields>({
    dscId: "",
    status: "pending",
    name: "",
    email: "",
    number: "",
    gender: "",
    dob: "",
    pan: "",
    ekycId: "",
    ekycPin: "",
    bpCode: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    certificateClass: "Class III",
    certType: "",
    validity: "",
    tokenType: "Not Required",
    internalRemarks: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!user && mode === "edit") return;

    setFormData({
      dscId: user?.dscId || "",
      status: user?.status || "pending",
      name: user?.name || "",
      email: user?.email || "",
      number: user?.number || "",
      gender: user?.gender || "",
      dob: user?.dob || "",
      pan: user?.pan || "",
      ekycId: user?.ekycId || "",
      ekycPin: user?.ekycPin || "",
      bpCode: user?.bpCode || "",
      address: user?.address || "",
      pincode: user?.pincode || "",
      city: user?.city || "",
      state: user?.state || "",
      certificateClass: user?.certificateClass || "Class III",
      certType: user?.certType || "",
      validity: user?.validity || "",
      tokenType: user?.tokenType || "Not Required",
      internalRemarks: user?.internalRemarks || "",
    });
    setFormError("");
  }, [user, mode]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    const nextValue =
      name === "pan"
        ? value.toUpperCase()
        : name === "number" || name === "pincode"
          ? value.replace(/\D/g, "")
          : value;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const pricing = calculatePricing({
    certType: formData.certType || "",
    validity: formData.validity || "",
    tokenType: formData.tokenType || "Not Required",
    assistedService: "Not Required",
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");

    const requiredFields: Array<[keyof FormFields, string]> = [
      ["name", "Full Name"],
      ["email", "Email"],
      ["number", "Mobile"],
      ["pan", "PAN"],
      ["address", "Address"],
      ["pincode", "Pincode"],
      ["city", "City"],
      ["state", "State"],
      ["certificateClass", "Certificate Class"],
      ["certType", "Certificate Type"],
      ["validity", "Validity"],
      ["tokenType", "USB Token"],
    ];

    const missingField = requiredFields.find(([key]) => !String(formData[key] || "").trim());

    if (missingField) {
      setFormError(`${missingField[1]} is required`);
      return;
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.pan.trim())) {
      setFormError("PAN must be in valid format like ABCDE1234F");
      return;
    }

    if (!/^\d{10}$/.test(formData.number.trim())) {
      setFormError("Mobile number must be exactly 10 digits");
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      setFormError("Pincode must be exactly 6 digits");
      return;
    }

    await onSubmit(formData);
  };

  const inputStyle = {
    backgroundColor: colors.input,
    borderColor: colors.inputBorder,
    color: colors.text,
  };

  const handleCopyDscId = async () => {
    if (!formData.dscId) {
      toast.error("DSC ID will be generated after save");
      return;
    }

    try {
      await navigator.clipboard.writeText(formData.dscId);
      toast.success("DSC ID copied");
    } catch {
      toast.error("Unable to copy DSC ID");
    }
  };

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden p-3 sm:p-4 md:p-6 transition-colors duration-300"
      style={{ backgroundColor: isDarkMode ? "#000000" : colors.panelStrong }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-1 w-full flex-col overflow-hidden rounded-xl border shadow-2xl"
        style={{
          backgroundColor: isDarkMode ? colors.panelStrong : colors.card,
          borderColor: isDarkMode ? colors.inputBorder : colors.border,
        }}
      >
        <header
          className="flex shrink-0 items-center justify-between border-b px-6 py-4"
          style={{
            backgroundColor: isDarkMode ? colors.panel : colors.accentSubtle,
            borderColor: isDarkMode ? colors.inputBorder : colors.border,
          }}
        >
          <div className="flex flex-wrap gap-5 sm:gap-8">
            <HeaderStat
              label="Class"
              value={formData.certificateClass || "Class III"}
              color={colors.accent}
            />
            <HeaderStat
              label="Type"
              value={formData.certType || "Select"}
              color={colors.accent}
            />
            <HeaderStat
              label="Price"
              value={`INR ${pricing.total}`}
              color={colors.accent}
            />
          </div>
          <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">
            {mode === "create" ? "KYC Portal" : "Application Editor"}
          </p>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="grid w-full grid-cols-1 lg:grid-cols-12 overflow-hidden">
            <section
              className="lg:col-span-8 flex flex-col overflow-hidden border-b lg:border-b-0 lg:border-r"
              style={{ borderColor: isDarkMode ? colors.inputBorder : colors.border }}
            >
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                <div>
                  <SectionHeader title="Personal Information" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ThemeInput name="name" label="Full Name" value={formData.name || ""} onChange={handleChange} style={inputStyle} autoComplete="name" />
                    <ThemeInput name="pan" label="PAN No" value={formData.pan || ""} onChange={handleChange} style={inputStyle} maxLength={10} autoCapitalize="characters" />
                    <ThemeSelect name="gender" label="Gender" value={formData.gender || ""} options={["", "Male", "Female", "Other"]} onChange={handleChange} style={inputStyle} />
                    <ThemeInput name="dob" label="DOB" type="date" value={formData.dob || ""} onChange={handleChange} style={inputStyle} />
                    <ThemeInput name="email" label="Email" type="email" value={formData.email || ""} onChange={handleChange} style={inputStyle} autoComplete="email" />
                    <ThemeInput name="number" label="Mobile" type="tel" value={formData.number || ""} onChange={handleChange} style={inputStyle} maxLength={10} inputMode="numeric" autoComplete="tel" />
                  </div>
                </div>

                <div>
                  <SectionHeader title="Address Details" />
                  <div className="space-y-4">
                    <div className="w-full">
                      <Label text="Full Address" />
                      <textarea
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        className="w-full rounded-md border p-3 text-sm font-bold outline-none"
                        style={{
                          backgroundColor: colors.input,
                          borderColor: colors.inputBorder,
                          color: colors.text,
                          minHeight: "80px",
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <ThemeInput name="pincode" label="Pincode" value={formData.pincode || ""} onChange={handleChange} style={inputStyle} maxLength={6} inputMode="numeric" autoComplete="postal-code" />
                      <ThemeInput name="city" label="City" value={formData.city || ""} onChange={handleChange} style={inputStyle} autoComplete="address-level2" />
                      <ThemeInput name="state" label="State" value={formData.state || ""} onChange={handleChange} style={inputStyle} autoComplete="address-level1" />
                    </div>
                  </div>
                </div>

                <div>
                  <SectionHeader title="Security" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ThemeInput name="ekycId" label="eKYC ID" value={formData.ekycId || ""} onChange={handleChange} style={inputStyle} />
                    <ThemeInput name="ekycPin" label="eKYC PIN" value={formData.ekycPin || ""} onChange={handleChange} style={inputStyle} />
                    <ThemeInput name="bpCode" label="BP Code" value={formData.bpCode || ""} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
              </div>
            </section>

            <aside
              className="lg:col-span-4 flex flex-col overflow-hidden"
              style={{
                backgroundColor: isDarkMode ? colors.panel : colors.accentSubtle,
              }}
            >
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                <div>
                  <SectionHeader title="Application Setup" />
                  <div className="space-y-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <ThemeInput
                        name="dscId"
                        label="DSC ID"
                        value={formData.dscId || ""}
                        onChange={handleChange}
                        style={inputStyle}
                        readOnly
                        placeholder={mode === "create" ? "Auto-generated after save" : ""}
                      />
                      <button
                        type="button"
                        onClick={handleCopyDscId}
                        className="mt-[26px] h-11 rounded-lg border px-3 text-xs font-black uppercase tracking-[0.14em]"
                        style={{
                          borderColor: colors.inputBorder,
                          backgroundColor: colors.panelStrong,
                          color: colors.text,
                        }}
                      >
                        Copy
                      </button>
                    </div>
                    <ThemeSelect name="status" label="Status" value={formData.status || ""} options={["pending", "approved", "rejected", "issued"]} onChange={handleChange} style={inputStyle} />
                    <ThemeSelect name="certificateClass" label="Class" value={formData.certificateClass || "Class III"} options={["Class III"]} onChange={handleChange} style={inputStyle} />
                    <ThemeSelect name="certType" label="Type" value={formData.certType || ""} options={["", "Signature", "Encryption", "Signing & Encryption"]} onChange={handleChange} style={inputStyle} />
                    <ThemeSelect name="validity" label="Validity" value={formData.validity || ""} options={["", "1 Year", "2 Years", "3 Years"]} onChange={handleChange} style={inputStyle} />
                    <ThemeSelect name="tokenType" label="USB Token" value={formData.tokenType || "Not Required"} options={["Not Required", "USB Token"]} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div
                  className="rounded-md border p-4"
                  style={{ borderColor: colors.inputBorder, backgroundColor: colors.input }}
                >
                  <p className="text-[10px] font-black uppercase opacity-50">Summary</p>
                  <div className="mt-3 space-y-2 text-sm font-semibold">
                    <div className="flex items-center justify-between">
                      <span style={{ color: colors.muted }}>Certificate</span>
                      <span style={{ color: colors.text }}>INR {pricing.certificate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: colors.muted }}>USB Token</span>
                      <span style={{ color: colors.text }}>INR {pricing.token}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3 font-black" style={{ borderColor: colors.inputBorder }}>
                      <span>Total</span>
                      <span style={{ color: colors.accent }}>INR {pricing.total}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label text="Internal Remarks" />
                    <textarea
                      name="internalRemarks"
                      value={formData.internalRemarks || ""}
                      onChange={handleChange}
                      className="min-h-28 w-full rounded-md border p-3 text-sm font-bold outline-none"
                      style={{
                        backgroundColor: colors.panelStrong,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }}
                      placeholder="Add internal notes for this applicant"
                    />
                  </div>
                </div>
              </div>

              <div
                className="admin-sticky-footer border-t p-4 sm:p-6"
                style={{
                  borderColor: isDarkMode ? colors.inputBorder : colors.border,
                  backgroundColor: isDarkMode ? colors.panel : colors.accentSubtle,
                }}
              >
                <div className="mb-3 text-[10px] font-bold text-rose-500">{formError}</div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg py-4 text-[11px] font-black uppercase tracking-widest text-white shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: colors.accent }}
                >
                  {saving
                    ? mode === "create"
                      ? "CREATING ID..."
                      : "SAVING CHANGES..."
                    : mode === "create"
                      ? "CREATE DSC ID"
                      : "SAVE CHANGES"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </form>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function HeaderStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-[8px] font-black uppercase opacity-40 leading-tight">{label}</p>
      <p className="text-[12px] font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest opacity-50">{title}</h3>;
}

function Label({ text }: { text: string }) {
  return (
    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] opacity-60">
      {text}
    </label>
  );
}

type InputProps = {
  label: string;
  name: keyof FormFields;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  style: CSSProperties;
  placeholder?: string;
  readOnly?: boolean;
  type?: string;
  autoComplete?: string;
  autoCapitalize?: string;
  maxLength?: number;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
};

function ThemeInput({
  label,
  name,
  value,
  onChange,
  style,
  placeholder,
  readOnly,
  type = "text",
  autoComplete,
  autoCapitalize,
  maxLength,
  inputMode,
}: InputProps) {
  return (
    <div className="w-full">
      <Label text={label} />
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        inputMode={inputMode}
        className="h-11 w-full rounded-md border px-3 text-sm font-bold outline-none"
        style={style}
      />
    </div>
  );
}

type SelectProps = {
  label: string;
  name: keyof FormFields;
  value: string;
  options: string[];
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  style: CSSProperties;
};

function ThemeSelect({ label, name, value, options, onChange, style }: SelectProps) {
  return (
    <div className="w-full">
      <Label text={label} />
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="h-11 w-full rounded-md border px-3 text-sm font-bold capitalize outline-none"
        style={style}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt || "Select"}
          </option>
        ))}
      </select>
    </div>
  );
}
