"use client";

import { useEffect, useMemo, useState } from "react";

import { APPLICATION_CONFIG_KEY } from "@/lib/applicationPreview";
import { calculatePricing } from "@/lib/pricing";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

export type ApplicationFormData = {
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

type ApplicationFormProps = {
  initialValues: ApplicationFormData;
  submitLabel: string;
  mode: "client" | "admin";
  readOnly?: boolean;
  lockedFields?: Array<keyof ApplicationFormData>;
  /** Use inside user dashboard / nested shells — avoids double horizontal padding + extra decorative layers */
  embedded?: boolean;
  onSubmit: (
    payload: ApplicationFormData & { totalAmount: number },
  ) => Promise<void>;
};

const createInitialFormData = (
  values?: Partial<ApplicationFormData>,
): ApplicationFormData => ({
  name: values?.name || "",
  email: values?.email || "",
  mobile: values?.mobile || "",
  userType: values?.userType || "Individual",
  classType: values?.classType || "Class III",
  certType: values?.certType || "",
  validity: values?.validity || "",
  tokenType: values?.tokenType || "Not Required",
  assistedService: values?.assistedService || "Not Required",
  ekycType: values?.ekycType || "PAN",
});

export default function ApplicationForm({
  initialValues,
  submitLabel,
  mode,
  readOnly = false,
  lockedFields = [],
  embedded = false,
  onSubmit,
}: ApplicationFormProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const premiumGradient =
    "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))";
  const shellBackground = isDarkMode ? colors.panelStrong : colors.card;
  const cardBackground = isDarkMode ? colors.card : colors.panelStrong;
  const strongBorderColor = isDarkMode ? colors.inputBorder : colors.border;
  const cardBorderColor = isDarkMode ? colors.border : colors.borderSoft;

  // Track the upper toggle button state
  const [activeTab, setActiveTab] = useState<"apply" | "track">("apply");

  const [formData, setFormData] = useState<ApplicationFormData>(
    createInitialFormData(initialValues),
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setFormData(createInitialFormData(initialValues));
    setError("");
  }, [initialValues]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const pricing = useMemo(
    () =>
      calculatePricing({
        certType: formData.certType,
        validity: formData.validity,
        tokenType: formData.tokenType,
        assistedService: formData.assistedService,
      }),
    [formData],
  );

  const isProductSelected = Boolean(formData.certType && formData.validity);

  const updateField = (key: keyof ApplicationFormData, value: string) => {
    if (lockedFields.includes(key)) return;

    setFormData((current) => {
      const next = { ...current, [key]: value };
      const nextPricing = calculatePricing({
        certType: next.certType,
        validity: next.validity,
        tokenType: next.tokenType,
        assistedService: next.assistedService,
      });

      sessionStorage.setItem(
        APPLICATION_CONFIG_KEY,
        JSON.stringify({
          certificateClass: next.classType,
          certType: next.certType,
          validity: next.validity,
          tokenType: next.tokenType,
          assistedService: next.assistedService,
          price: String(nextPricing.total),
          name: next.name,
          email: next.email,
          mobile: next.mobile,
        }),
      );

      if (next.mobile) {
        sessionStorage.setItem("verifiedMobile", next.mobile);
      }

      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !readOnly &&
      (!formData.name ||
        !formData.email ||
        !formData.mobile ||
        !formData.certType ||
        !formData.validity)
    ) {
      setError("Please complete all required details.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await onSubmit({ ...formData, totalAmount: pricing.total });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const heroSectionSurface = embedded
    ? "rounded-xl border shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
    : "shine-border theme-transition rounded-lg border shadow-[0_16px_48px_rgba(0,0,0,0.14)]";

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-4">
      
     

      

      {/* Main Core Multi-Section Wrapper Layout Form */}
      <form
        onSubmit={handleSubmit}
        className={`flex w-full flex-col gap-4 lg:flex-row lg:items-start ${
          embedded ? "" : "px-2 sm:px-4"
        }`}
      >
        <section
          className={`${heroSectionSurface} flex-1 p-4 sm:p-5`}
          style={{
            backgroundColor: shellBackground,
            borderColor: strongBorderColor,
            ...(embedded ? { isolation: "isolate" } : {}),
          }}
        >
          {/* Form Content Block Header title */}
          <div className="mb-4 flex items-center gap-3">
            <div className="h-0.5 w-6" style={{ backgroundColor: colors.accent }} />
            <h2 className="text-sm font-black uppercase tracking-wider" style={{ color: colors.text }}>
              DSC <span style={{ color: colors.accent }}>Enrollment</span>
            </h2>
          </div>

          {/* Core Configuration & Personal Data Field Inputs Combined Area */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            {[
              { label: "Full Name", type: "text", key: "name", required: true },
              { label: "Email Address", type: "email", key: "email", required: true },
              { label: "Mobile Number", type: "tel", key: "mobile", required: true },
            ].map((field) => (
              <FieldLabel key={field.key} label={field.label} required={field.required} colors={colors}>
                {(() => {
                  const fieldKey = field.key as keyof ApplicationFormData;
                  const isLocked = lockedFields.includes(fieldKey);

                  return (
                <input
                  type={field.type}
                  value={formData[fieldKey]}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  disabled={readOnly || isLocked}
                  onChange={(event) => updateField(fieldKey, event.target.value)}
                  className="glass-input theme-transition w-full rounded-md border px-2.5 py-1.5 text-xs font-semibold outline-none"
                  style={{
                    color: colors.text,
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    opacity: readOnly || isLocked ? 0.76 : 1,
                  }}
                  readOnly={readOnly || isLocked}
                />
                  );
                })()}
              </FieldLabel>
            ))}

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
                  value={formData[item.key as keyof ApplicationFormData]}
                  disabled={readOnly}
                  onChange={(event) => updateField(item.key as keyof ApplicationFormData, event.target.value)}
                  className="glass-input theme-transition w-full cursor-pointer rounded-md border px-2 py-1.5 text-xs font-bold outline-none"
                  style={{
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                    colorScheme: isDarkMode ? "dark" : "light",
                    opacity: readOnly ? 0.76 : 1,
                  }}
                >
                  {(item.key === "certType" || item.key === "validity") && (
                    <option value="" style={{ backgroundColor: colors.card, color: colors.text }}>
                      {`Select ${item.label}`}
                    </option>
                  )}
                  {item.options.map((option) => (
                    <option key={option} value={option} style={{ backgroundColor: colors.card, color: colors.text }}>
                      {option}
                    </option>
                  ))}
                </select>
              </FieldLabel>
            ))}
          </div>

          {/* Pricing Message Bar Component Module */}
          <div className="mt-3.5">
            {!isProductSelected ? (
              <div
                className="theme-transition flex min-h-[44px] flex-col items-center justify-center rounded-md border border-dashed p-2"
                style={{ backgroundColor: colors.panelStrong, borderColor: colors.borderSoft }}
              >
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.muted }}>
                  Select service type and validity to see pricing
                </p>
              </div>
            ) : (
              <div
                className="theme-transition flex flex-col items-center justify-between gap-3 rounded-md border px-3 py-2 md:flex-row"
                style={{ backgroundColor: `${colors.accent}12`, borderColor: colors.borderSoft }}
              >
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: colors.accent }}>
                    Total Investment
                  </span>
                  <div className="text-xl font-black" style={{ color: colors.text }}>
                    INR {pricing.total}
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-center sm:gap-5" style={{ color: colors.text }}>
                  <PriceUnit label="Cert" value={pricing.certificate} muted={colors.muted} divider={colors.borderSoft} />
                  <PriceUnit label="Token" value={pricing.token} muted={colors.muted} divider={colors.borderSoft} />
                  <PriceUnit label="Assist" value={pricing.assisted} muted={colors.muted} divider="" last />
                </div>
              </div>
            )}
          </div>

          {/* Lower Action Layout Bar Container */}
          <div
            className="mt-3.5 flex flex-col items-stretch justify-between gap-3 border-t pt-3.5 md:flex-row md:items-center"
            style={{ borderColor: colors.borderSoft }}
          >
            <div
              className="theme-transition flex items-center gap-3 rounded-md border px-2.5 py-1.5"
              style={{ backgroundColor: colors.panel, borderColor: colors.borderSoft }}
            >
              <span className="text-[9px] font-black uppercase" style={{ color: colors.muted }}>
                eKYC Mode:
              </span>
              <div className="flex gap-3">
                {["PAN", "Aadhaar"].map((type) => (
                  <label key={type} className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="radio"
                      checked={formData.ekycType === type}
                      disabled={readOnly}
                      onChange={() => updateField("ekycType", type)}
                      className="sr-only"
                    />
                    <span
                      className="flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-all"
                      style={{
                        borderColor: formData.ekycType === type ? colors.accent : colors.muted,
                        backgroundColor: formData.ekycType === type ? `${colors.accent}15` : "transparent",
                        opacity: readOnly ? 0.76 : 1,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: formData.ekycType === type ? colors.accent : "transparent" }}
                      />
                    </span>
                    <span className="text-xs font-bold" style={{ color: colors.text }}>
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-1.5 md:items-end">
              {error && <p className="text-[9px] font-black uppercase text-rose-500">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="theme-primary-btn theme-transition w-full rounded-md px-5 py-2 text-xs font-black uppercase tracking-[0.15em] text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting ? "Saving..." : submitLabel}
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
    <div className="flex flex-col gap-1">
      <label className="ml-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ color: colors.muted }}>
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
    <div className="flex items-center gap-3">
      <div>
        <div className="text-[8px] font-bold uppercase" style={{ color: muted }}>
          {label}
        </div>
        <div className="text-xs font-bold">INR {value}</div>
      </div>
      {!last ? <div className="hidden h-5 w-px sm:block" style={{ backgroundColor: divider }} /> : null}
    </div>
  );
}
