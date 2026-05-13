"use client";

import { useEffect, useState } from "react";

import { calculatePricing } from "@/app/lib/pricing";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";
import type { DashboardUser } from "@/components/UserLedger";

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
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!user && mode === "edit") return;

    setFormData({
      dscId:
        user?.dscId ||
        `DSC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: user?.status || "Pending",
      name: user?.name || "",
      email: user?.email || "",
      number: user?.number || "",
      gender: user?.gender || "",
      dob: user?.dob || "",
      pan: user?.pan || "",
      ekycId: user?.ekycId || "",
      ekycPin: user?.ekycPin || "",
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
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const pricing = calculatePricing({
    certType: formData.certType || "",
    validity: formData.validity || "",
    tokenType: formData.tokenType || "Not Required",
    assistedService: "Not Required",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");

    const requiredFields: Array<[string, string]> = [
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

    await onSubmit(formData);
  };

  const inputStyle = {
    backgroundColor: colors.input,
    borderColor: colors.inputBorder,
    color: colors.text,
  };

  return (
    <div
      className="flex h-screen w-full flex-col overflow-hidden p-4 md:p-6 transition-colors duration-300"
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
          <div className="flex gap-8">
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
              value={`₹${pricing.total}`}
              color={colors.accent}
            />
          </div>
          <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">
            {mode === "create" ? "KYC Portal" : "Application Editor"}
          </p>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="grid w-full grid-cols-1 md:grid-cols-12 overflow-hidden">
            <section
              className="md:col-span-8 flex flex-col overflow-hidden border-r"
              style={{ borderColor: isDarkMode ? colors.inputBorder : colors.border }}
            >
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                <div>
                  <SectionHeader title="Personal Information" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ThemeInput name="name" label="Full Name" value={formData.name || ""} onChange={handleChange} style={inputStyle} />
                    <ThemeInput name="pan" label="PAN No" value={formData.pan || ""} onChange={handleChange} style={inputStyle} />
                    <ThemeSelect name="gender" label="Gender" value={formData.gender || ""} options={["Select", "Male", "Female", "Other"]} onChange={handleChange} style={inputStyle} />
                    <ThemeInput name="dob" label="DOB" value={formData.dob || ""} onChange={handleChange} style={inputStyle} placeholder="DD-MM-YYYY" />
                    <ThemeInput name="email" label="Email" value={formData.email || ""} onChange={handleChange} style={inputStyle} />
                    <ThemeInput name="number" label="Mobile" value={formData.number || ""} onChange={handleChange} style={inputStyle} />
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
                    <div className="grid grid-cols-3 gap-4">
                      <ThemeInput name="pincode" label="Pincode" value={formData.pincode || ""} onChange={handleChange} style={inputStyle} />
                      <ThemeInput name="city" label="City" value={formData.city || ""} onChange={handleChange} style={inputStyle} />
                      <ThemeInput name="state" label="State" value={formData.state || ""} onChange={handleChange} style={inputStyle} />
                    </div>
                  </div>
                </div>

                <div>
                  <SectionHeader title="Security" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ThemeInput name="ekycId" label="eKYC ID" value={formData.ekycId || ""} onChange={handleChange} style={inputStyle} />
                    <ThemeInput name="ekycPin" label="eKYC PIN" value={formData.ekycPin || ""} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>
              </div>
            </section>

            <aside
              className="md:col-span-4 flex flex-col overflow-hidden"
              style={{
                backgroundColor: isDarkMode ? colors.panel : colors.accentSubtle,
              }}
            >
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                <div>
                  <SectionHeader title="Application Setup" />
                  <div className="space-y-4">
                    <ThemeSelect name="status" label="Status" value={formData.status || ""} options={["Select", "Pending", "Approved", "Rejected", "Issued"]} onChange={handleChange} style={inputStyle} />
                    <ThemeSelect name="certificateClass" label="Class" value={formData.certificateClass || "Class III"} options={["Class III"]} onChange={handleChange} style={inputStyle} />
                    <ThemeSelect name="certType" label="Type" value={formData.certType || ""} options={["Select", "Signature", "Encryption", "Both"]} onChange={handleChange} style={inputStyle} />
                    <ThemeSelect name="validity" label="Validity" value={formData.validity || ""} options={["Select", "1 Year", "2 Years", "3 Years"]} onChange={handleChange} style={inputStyle} />
                    <ThemeSelect name="tokenType" label="USB Token" value={formData.tokenType || "Not Required"} options={["Not Required", "USB Token"]} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div
                  className="rounded-md border p-4"
                  style={{ borderColor: colors.inputBorder, backgroundColor: colors.input }}
                >
                  <p className="text-[10px] font-black uppercase opacity-50">Generated DSC ID</p>
                  <p className="mt-2 text-sm font-black" style={{ color: colors.accent }}>
                    {formData.dscId || "Will be generated"}
                  </p>
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
                </div>
              </div>

              <div
                className="border-t p-6"
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
                      ? "PROCESSING..."
                      : "SAVING..."
                    : mode === "create"
                      ? "CREATE DSC ID"
                      : "SAVE APPLICATION"}
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
    <label className="mb-1.5 block text-[8px] font-black uppercase opacity-60">
      {text}
    </label>
  );
}

function ThemeInput({ label, name, value, onChange, style, placeholder }: any) {
  return (
    <div className="w-full">
      <Label text={label} />
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border px-3 text-xs font-bold outline-none"
        style={style}
      />
    </div>
  );
}

function ThemeSelect({ label, name, value, options, onChange, style }: any) {
  return (
    <div className="w-full">
      <Label text={label} />
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="h-10 w-full rounded-md border px-3 text-xs font-bold outline-none"
        style={style}
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
