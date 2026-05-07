"use client";

import { useEffect, useMemo, useState } from "react";

import { APPLICATION_CONFIG_KEY } from "@/app/lib/applicationPreview";
import { calculatePricing } from "@/app/lib/pricing";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

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
  onSubmit: (payload: ApplicationFormData & { totalAmount: number }) => Promise<void>;
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

  const flowSteps =
    mode === "admin"
      ? [
          "Choose client and service details",
          "Create application on behalf of client",
          "Save directly to the shared database",
        ]
      : [
          "Choose certificate and validity",
          "Verify via PAN or Aadhaar",
          "Upload documents and preview",
        ];

  return (
    <form
      onSubmit={handleSubmit}
      className="page-max-shell relative z-10 flex w-full flex-col gap-8 px-4 sm:px-6"
    >
      <section
        className="shine-border theme-transition grid items-center gap-8 rounded-lg border p-5 shadow-[0_24px_80px_rgba(0,0,0,0.16)] sm:p-8 md:grid-cols-[0.95fr_1.05fr] lg:p-10"
        style={{ backgroundColor: shellBackground, borderColor: strongBorderColor }}
      >
        <div className="flex justify-center">
          <div
            className="w-full max-w-sm rounded-lg border p-6"
            style={{
              backgroundColor: cardBackground,
              borderColor: cardBorderColor,
            }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-[0.24em]"
                  style={{ color: colors.muted }}
                >
                  Application Flow
                </p>
                <h3 className="mt-2 text-2xl font-black uppercase tracking-tight">
                  One clean journey
                </h3>
              </div>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg text-white"
                style={{ background: premiumGradient }}
              >
                <span className="text-sm font-black">{mode === "admin" ? "AD" : "DS"}</span>
              </div>
            </div>
            <div className="space-y-4">
              {flowSteps.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-lg border px-4 py-4"
                  style={{
                    borderColor: cardBorderColor,
                    backgroundColor: isDarkMode ? colors.panel : colors.card,
                  }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black text-white"
                    style={{ background: premiumGradient }}
                  >
                    0{index + 1}
                  </div>
                  <span className="text-sm font-bold" style={{ color: colors.text }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-8 flex items-center gap-4">
            <div className="h-0.5 w-12" style={{ backgroundColor: colors.accent }} />
            <h1
              className="text-3xl font-light uppercase tracking-tight sm:text-4xl"
              style={{ color: colors.text }}
            >
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
                  value={formData[field.key as keyof ApplicationFormData]}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  disabled={readOnly}
                  onChange={(event) =>
                    updateField(
                      field.key as keyof ApplicationFormData,
                      event.target.value,
                    )
                  }
                  className="glass-input theme-transition w-full rounded-lg border px-4 py-4 text-sm font-semibold outline-none"
                  style={{
                    color: colors.text,
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    opacity: readOnly ? 0.76 : 1,
                  }}
                  readOnly={readOnly}
                />
              </FieldLabel>
            ))}
          </div>
        </div>
      </section>

      <section
        className="shine-border theme-transition rounded-lg border p-5 shadow-[0_24px_80px_rgba(0,0,0,0.16)] sm:p-8 md:p-10 lg:p-14"
        style={{ backgroundColor: shellBackground, borderColor: strongBorderColor }}
      >
        <h2
          className="mb-10 text-center text-xs font-black uppercase tracking-[0.4em]"
          style={{ color: colors.muted }}
        >
          Service Configuration
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "User Category",
              key: "userType",
              options: ["Individual", "Organization", "Foreign Individual"],
              required: false,
            },
            {
              label: "Certificate Class",
              key: "classType",
              options: ["Class III"],
              required: false,
            },
            {
              label: "Service Type",
              key: "certType",
              options: ["Encryption", "Signature", "Signing & Encryption"],
              required: true,
            },
            {
              label: "Validity",
              key: "validity",
              options: ["1 Year", "2 Years", "3 Years"],
              required: true,
            },
            {
              label: "USB Token",
              key: "tokenType",
              options: ["Not Required", "USB Token"],
              required: false,
            },
            {
              label: "Assisted Service",
              key: "assistedService",
              options: ["Not Required", "Required"],
              required: false,
            },
          ].map((item) => (
            <FieldLabel
              key={item.key}
              label={item.label}
              required={item.required}
              colors={colors}
            >
              <select
                value={formData[item.key as keyof ApplicationFormData]}
                disabled={readOnly}
                onChange={(event) =>
                  updateField(
                    item.key as keyof ApplicationFormData,
                    event.target.value,
                  )
                }
                className="glass-input theme-transition w-full cursor-pointer rounded-lg border px-3 py-3.5 text-sm font-bold outline-none"
                style={{
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                  colorScheme: isDarkMode ? "dark" : "light",
                  opacity: readOnly ? 0.76 : 1,
                }}
              >
                {(item.key === "certType" || item.key === "validity") && (
                  <option
                    value=""
                    style={{
                      backgroundColor: colors.card,
                      color: colors.text,
                    }}
                  >{`Select ${item.label}`}</option>
                )}
                {item.options.map((option) => (
                  <option
                    key={option}
                    value={option}
                    style={{
                      backgroundColor: colors.card,
                      color: colors.text,
                    }}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </FieldLabel>
          ))}

          <div className="mt-4 md:col-span-2 lg:col-span-3">
            {!isProductSelected ? (
              <div
                className="theme-transition flex min-h-27.5 flex-col items-center justify-center rounded-lg border border-dashed p-6"
                style={{
                  backgroundColor: colors.panelStrong,
                  borderColor: colors.borderSoft,
                }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: colors.muted }}
                >
                  Select service type and validity to see pricing
                </p>
              </div>
            ) : (
              <div
                className="theme-transition flex flex-col items-center justify-between gap-6 rounded-lg border p-6 sm:p-8 md:flex-row"
                style={{
                  backgroundColor: `${colors.accent}12`,
                  borderColor: colors.borderSoft,
                }}
              >
                <div className="text-center md:text-left">
                  <span
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: colors.accent }}
                  >
                    Total Investment
                  </span>
                  <div className="text-4xl font-black" style={{ color: colors.text }}>
                    INR {pricing.total}
                  </div>
                </div>

                <div
                  className="flex flex-wrap justify-center gap-4 text-center sm:gap-6"
                  style={{ color: colors.text }}
                >
                  <PriceUnit
                    label="Cert"
                    value={pricing.certificate}
                    muted={colors.muted}
                    divider={colors.borderSoft}
                  />
                  <PriceUnit
                    label="Token"
                    value={pricing.token}
                    muted={colors.muted}
                    divider={colors.borderSoft}
                  />
                  <PriceUnit
                    label="Assist"
                    value={pricing.assisted}
                    muted={colors.muted}
                    divider=""
                    last
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="mt-10 flex flex-col items-stretch justify-between gap-8 border-t pt-12 md:flex-row md:items-center"
          style={{ borderColor: colors.borderSoft }}
        >
          <div
            className="theme-transition flex flex-col gap-4 rounded-lg border px-4 py-4 sm:px-6 md:flex-row md:items-center md:gap-6"
            style={{
              backgroundColor: colors.panel,
              borderColor: colors.borderSoft,
            }}
          >
            <span className="text-[11px] font-black uppercase" style={{ color: colors.muted }}>
              eKYC Mode:
            </span>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {["PAN", "Aadhaar"].map((type) => (
                <label key={type} className="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="radio"
                    checked={formData.ekycType === type}
                    disabled={readOnly}
                    onChange={() => updateField("ekycType", type)}
                    className="sr-only"
                  />
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full border transition-all"
                    style={{
                      borderColor:
                        formData.ekycType === type ? colors.accent : colors.muted,
                      backgroundColor:
                        formData.ekycType === type ? `${colors.accent}15` : "transparent",
                      boxShadow:
                        formData.ekycType === type
                          ? `0 0 0 3px ${colors.accentSoft}`
                          : "none",
                      opacity: readOnly ? 0.76 : 1,
                    }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          formData.ekycType === type ? colors.accent : "transparent",
                      }}
                    />
                  </span>
                  <span className="text-sm font-bold" style={{ color: colors.text }}>
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 md:items-end">
            {error ? (
              <p className="text-[11px] font-black uppercase text-rose-500">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="theme-primary-btn theme-transition w-full rounded-lg px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-14 sm:py-5"
            >
              {submitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </div>
      </section>
    </form>
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
    <div className="flex items-center gap-4 sm:gap-6">
      <div>
        <div className="text-[9px] font-bold uppercase" style={{ color: muted }}>
          {label}
        </div>
        <div className="font-bold">INR {value}</div>
      </div>
      {!last ? (
        <div className="hidden h-8 w-px sm:block" style={{ backgroundColor: divider }} />
      ) : null}
    </div>
  );
}
