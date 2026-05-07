"use client";

import { useEffect, useState } from "react";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";
import type { DashboardUser } from "@/components/UserLedger";
import BackToPreviewButton from "@/components/BackToPreviewButton";

type AdminApplicationEditorProps = {
  user: DashboardUser;
  saving: boolean;
  onSubmit: (payload: Record<string, string>) => Promise<void>;
};

export default function AdminApplicationEditor({
  user,
  saving,
  onSubmit,
}: AdminApplicationEditorProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      name: user.name || "",
      email: user.email || "",
      number: user.number || "",
      gender: user.gender || "",
      dob: user.dob || "",
      pan: user.pan || "",
      ekycId: user.ekycId || "",
      ekycPin: user.ekycPin || "",
      bpCode: user.bpCode || "",
      address: user.address || "",
      pincode: user.pincode || "",
      city: user.city || "",
      state: user.state || "",
      certificateClass: user.certificateClass || "Class III",
      certType: user.certType || "",
      validity: user.validity || "",
      tokenType: user.tokenType || "Not Required",
      internalRemarks: user.internalRemarks || "",
    });
  }, [user]);

  const handleChange = (key: string, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(formData);
  };

  const inputStyle = {
    borderColor: colors.inputBorder,
    backgroundColor: colors.input,
    color: colors.text,
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" flex h-full flex-col space-y-6 px-5 pb-6 sm:px-6"
    >
      <section
        className="rounded-3xl border p-5"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: colors.panel,
        }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.22em]"
          style={{ color: colors.accent }}
        >
          Editable Application Form
        </p>
        <h4 className="mt-2 text-2xl font-black">Update applicant details</h4>
        <p className="mt-2 text-sm" style={{ color: colors.muted }}>
          Edit the saved backend data for this applicant.
        </p>
      </section>

      <div className="flex-1 overflow-y-auto space-y-6 px-5 pb-24 sm:px-6">
        <section
          className="rounded-3xl border p-5"
          style={{
            borderColor: colors.borderSoft,
            backgroundColor: colors.panel,
          }}
        >

            <div className="absolute right-4 top-4">
    <BackToPreviewButton />
  </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full Name">
              <input
                value={formData.name || ""}
                onChange={(event) => handleChange("name", event.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="Email">
              <input
                value={formData.email || ""}
                onChange={(event) => handleChange("email", event.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="Mobile">
              <input
                value={formData.number || ""}
                onChange={(event) => handleChange("number", event.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="PAN">
              <input
                value={formData.pan || ""}
                onChange={(event) => handleChange("pan", event.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="Gender">
              <input
                value={formData.gender || ""}
                onChange={(event) => handleChange("gender", event.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="Date of Birth">
              <input
                value={formData.dob || ""}
                onChange={(event) => handleChange("dob", event.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="eKYC ID">
              <input
                value={formData.ekycId || ""}
                onChange={(event) => handleChange("ekycId", event.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="eKYC PIN">
              <input
                value={formData.ekycPin || ""}
                onChange={(event) =>
                  handleChange("ekycPin", event.target.value)
                }
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="BP Code">
              <input
                value={formData.bpCode || ""}
                onChange={(event) => handleChange("bpCode", event.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="Pincode">
              <input
                value={formData.pincode || ""}
                onChange={(event) =>
                  handleChange("pincode", event.target.value)
                }
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="City">
              <input
                value={formData.city || ""}
                onChange={(event) => handleChange("city", event.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="State">
              <input
                value={formData.state || ""}
                onChange={(event) => handleChange("state", event.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
            <Field label="Certificate Class">
              <select
                value={formData.certificateClass || ""}
                onChange={(event) =>
                  handleChange("certificateClass", event.target.value)
                }
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              >
                <option value="Class III">Class III</option>
              </select>
            </Field>
            <Field label="Certificate Type">
              <select
                value={formData.certType || ""}
                onChange={(event) =>
                  handleChange("certType", event.target.value)
                }
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              >
                <option value="">Select</option>
                <option value="Encryption">Encryption</option>
                <option value="Signature">Signature</option>
                <option value="Signing & Encryption">
                  Signing & Encryption
                </option>
              </select>
            </Field>
            <Field label="Validity">
              <select
                value={formData.validity || ""}
                onChange={(event) =>
                  handleChange("validity", event.target.value)
                }
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              >
                <option value="">Select</option>
                <option value="1 Year">1 Year</option>
                <option value="2 Years">2 Years</option>
                <option value="3 Years">3 Years</option>
              </select>
            </Field>
            <Field label="USB Token">
              <select
                value={formData.tokenType || ""}
                onChange={(event) =>
                  handleChange("tokenType", event.target.value)
                }
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              >
                <option value="Not Required">Not Required</option>
                <option value="USB Token">USB Token</option>
              </select>
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Address">
              <textarea
                value={formData.address || ""}
                onChange={(event) =>
                  handleChange("address", event.target.value)
                }
                className="min-h-28 w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Internal Remarks">
              <textarea
                value={formData.internalRemarks || ""}
                onChange={(event) =>
                  handleChange("internalRemarks", event.target.value)
                }
                className="min-h-28 w-full rounded-xl border px-4 py-3 text-sm outline-none"
                style={inputStyle}
              />
            </Field>
          </div>
        </section>
      </div>

      <div
        className="sticky bottom-0 z-10 flex justify-end px-5 py-4 sm:px-6"
        style={{
          backgroundColor: "transparent",
        }}
      >
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[linear-gradient(135deg,var(--accent),var(--accent-light))] px-6 py-3 text-sm font-black text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Application"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  return (
    <label className="block">
      <span
        className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em]"
        style={{ color: colors.muted }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
