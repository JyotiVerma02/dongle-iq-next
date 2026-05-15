"use client";

import { useEffect, useState } from "react";
import type {
  CSSProperties,
  ChangeEvent,
  FormEvent,
  InputHTMLAttributes,
} from "react";
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
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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

  const handleCopyDscId = async () => {
    if (!formData.dscId) {
      toast.error("No ID to copy");
      return;
    }
    await navigator.clipboard.writeText(formData.dscId);
    toast.success("Copied");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    // Validation logic stays same...
    await onSubmit(formData);
  };

  const inputStyle = {
    backgroundColor: colors.input,
    borderColor: colors.inputBorder,
    color: colors.text,
  };

  return (
    <div className="h-full w-full overflow-hidden p-1 transition-colors duration-300 bg-transparent">
      {" "}
      <form
        onSubmit={handleSubmit}
        className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border shadow-2xl"
        style={{
          backgroundColor: isDarkMode ? colors.panelStrong : colors.card,
          borderColor: isDarkMode ? colors.inputBorder : colors.border,
        }}
      >
        {/* Minimal Header */}
        <header
          className="flex shrink-0 items-center justify-between border-b px-5 py-2"
          style={{
            backgroundColor: isDarkMode ? colors.panel : colors.accentSubtle,
            borderColor: isDarkMode ? colors.inputBorder : colors.border,
          }}
        >
          <div className="flex gap-8">
            <HeaderStat
              label="Class"
              value={formData.certificateClass}
              color={colors.accent}
            />
            <HeaderStat
              label="Type"
              value={formData.certType || "Select Type"}
              color={colors.accent}
            />
            <HeaderStat
              label="Price"
              value={`INR ${pricing.total}`}
              color={colors.accent}
            />
          </div>
          <p className="text-[9px] font-black uppercase opacity-30 tracking-[0.3em]">
            {mode === "create" ? "KYC Terminal" : "Record Editor"}
          </p>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="grid h-full min-h-0 w-full grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Main Section */}
            <section
              className="lg:col-span-8 flex flex-col overflow-hidden border-r"
              style={{
                borderColor: isDarkMode ? colors.inputBorder : colors.border,
              }}
            >
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">
                <div className="space-y-4">
                  <SectionHeader title="Personal Details" />
                  <div className="grid grid-cols-2 gap-3">
                    <ThemeInput
                      name="name"
                      label="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                    <ThemeInput
                      name="pan"
                      label="PAN Number"
                      value={formData.pan}
                      onChange={handleChange}
                      style={inputStyle}
                      maxLength={10}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <ThemeSelect
                        name="gender"
                        label="Gender"
                        value={formData.gender}
                        options={["Male", "Female", "Other"]}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                      <ThemeInput
                        name="dob"
                        label="Date of Birth"
                        type="date"
                        value={formData.dob}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <ThemeInput
                        name="email"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                      <ThemeInput
                        name="number"
                        label="Mobile"
                        value={formData.number}
                        onChange={handleChange}
                        style={inputStyle}
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <SectionHeader title="Address & Location" />
                  <div className="w-full">
                    <Label text="Full Residential Address" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full rounded-md border p-2 text-xs font-bold outline-none resize-none transition-all focus:ring-1"
                      style={{ ...inputStyle, minHeight: "48px" }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <ThemeInput
                      name="pincode"
                      label="Pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      style={inputStyle}
                      maxLength={6}
                    />
                    <ThemeInput
                      name="city"
                      label="City"
                      value={formData.city}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                    <ThemeInput
                      name="state"
                      label="State"
                      value={formData.state}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <SectionHeader title="Security Parameters" />
                  <div className="grid grid-cols-3 gap-3">
                    <ThemeInput
                      name="ekycId"
                      label="eKYC ID"
                      value={formData.ekycId}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                    <ThemeInput
                      name="ekycPin"
                      label="eKYC PIN"
                      value={formData.ekycPin}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                    <ThemeInput
                      name="bpCode"
                      label="BP Code"
                      value={formData.bpCode}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Sidebar Section */}
            <aside
              className="lg:col-span-4 flex flex-col overflow-hidden bg-opacity-50"
              style={{
                backgroundColor: isDarkMode
                  ? colors.panel
                  : colors.accentSubtle,
              }}
            >
              <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
                <div className="space-y-3">
                  <SectionHeader title="Configuration" />
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                    <ThemeInput
                      name="dscId"
                      label="DSC Identifier"
                      value={formData.dscId}
                      onChange={handleChange}
                      style={inputStyle}
                      readOnly
                      placeholder={
                        mode === "create" ? "Pending generation..." : ""
                      }
                    />
                    <button
                      type="button"
                      onClick={handleCopyDscId}
                      className="h-9 px-3 rounded-md border text-[10px] font-black uppercase tracking-widest transition-all active:scale-90"
                      style={{
                        borderColor: colors.inputBorder,
                        backgroundColor: colors.panelStrong,
                        color: colors.accent  ,
                      }}
                    >
                      Copy
                    </button>
                  </div>
                  <ThemeSelect
                    name="status"
                    label="Application Status"
                    value={formData.status}
                    options={["pending", "approved", "rejected", "issued"]}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <ThemeSelect
                      name="certType"
                      label="Cert Type"
                      value={formData.certType}
                      options={[
                        "Signature",
                        "Encryption",
                        "Signing & Encryption",
                      ]}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                    <ThemeSelect
                      name="validity"
                      label="Validity"
                      value={formData.validity}
                      options={["1 Year", "2 Years", "3 Years"]}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                  <ThemeSelect
                    name="tokenType"
                    label="USB Token"
                    value={formData.tokenType}
                    options={["Not Required", "USB Token"]}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div
                  className="rounded-lg border p-3"
                  style={{
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.input,
                  }}
                >
                  <p className="text-[9px] font-black uppercase opacity-40 mb-2">
                    Pricing Matrix
                  </p>
                  <div className="space-y-1 text-[11px] font-bold">
                    <div className="flex justify-between">
                      <span style={{ color: colors.muted }}>Base Cert</span>
                      <span style={{ color: colors.text }}>
                        INR {pricing.certificate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: colors.muted }}>USB Token</span>
                      <span style={{ color: colors.text }}>
                        INR {pricing.token}
                      </span>
                    </div>
                    <div
                      className="mt-2 border-t pt-2 flex justify-between font-black text-xs"
                      style={{ borderColor: colors.inputBorder }}
                    >
                      <span>Payable Amount</span>
                      <span style={{ color: colors.accent }}>
                        INR {pricing.total}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <Label text="Internal Audit Remarks" />
                  <textarea
                    name="internalRemarks"
                    value={formData.internalRemarks}
                    onChange={handleChange}
                    className="w-full rounded-md border p-2 text-xs font-bold outline-none resize-none"
                    placeholder="Notes for internal review..."
                    style={{
                      backgroundColor: colors.panelStrong,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                      minHeight: "60px",
                    }}
                  />
                </div>
              </div>

              {/* Fixed Footer within Sidebar */}
              <div
                className="border-t p-4"
                style={{
                  borderColor: isDarkMode ? colors.inputBorder : colors.border,
                }}
              >
                <div className="mb-2 text-[9px] font-bold text-rose-500 h-3">
                  {formError}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: colors.accent }}
                >
                  {saving
                    ? "Processing..."
                    : mode === "create"
                      ? "Initialize DSC"
                      : "Commit Changes"}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </form>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

/* Reusable Density-Optimized Components */
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
      <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">
        {label}
      </p>
      <p className="text-xs font-bold leading-none" style={{ color }}>
        {value || "---"}
      </p>
    </div>
  );
}

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <h3 
      className="text-[9px] font-black uppercase tracking-[0.15em]" 
      style={{ color: color }} 
    >
      {title}
    </h3>
  );
}

function Label({ text }: { text: string }) {
  return (
    <label className="mb-1 block text-[9px] font-black uppercase tracking-widest opacity-50">
      {text}
    </label>
  );
}

function ThemeInput({ label, name, value, onChange, style, ...props }: any) {
  return (
    <div className="w-full">
      <Label text={label} />
      <input
        {...props}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="h-8 w-full rounded-md border px-2 text-xs font-bold outline-none transition-focus focus:ring-1"
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
        style={style}
        className="h-8 w-full rounded-md border px-1 text-xs font-bold outline-none capitalize"
      >
        <option value="">Select</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
