/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  PencilLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import ParticleBackground from "@/components/ParticleBackground";
import {
  APPLICATION_CONFIG_KEY,
  clearFormState,
  clearPreviewDraft,
  saveFormState,
} from "@/app/lib/applicationPreview";
import { calculatePricing } from "@/app/lib/pricing";
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

type UserData = {
  name: string;
  _id?: string;
  email: string;
  number?: string;
  status?: string;
  internalRemarks?: string;
  isVerified?: boolean;
  isAadhaarVerified?: boolean;
  pan?: string;
  gender?: string;
  dob?: string;
  ekycId?: string;
  certificateClass?: string;
  certType?: string;
  validity?: string;
  tokenType?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  photo?: string;
  idProof?: string;
  addressProof?: string;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
};

function hasCompletedApplication(user: UserData | null) {
  if (!user) {
    return false;
  }

  return Boolean(
    user.name &&
      user.email &&
      user.number &&
      user.pan &&
      user.address &&
      user.certType &&
      user.validity &&
      user.photo &&
      user.idProof &&
      user.addressProof,
  );
}

export default function DSCRegistrationForm() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const premiumGradient = isDarkMode
    ? "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))"
    : "linear-gradient(135deg, #2563eb, #0ea5e9)";

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/get-user-data", {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.success && data.user) {
          setUserData(data.user);
          setFormData((prev) => ({
            ...prev,
            name: data.user.name || "",
            email: data.user.email || "",
            mobile: data.user.number || "",
          }));
        } else {
          setUserData(null);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
  const hasSubmittedApplication = hasCompletedApplication(userData);
  const applicationStatus = hasSubmittedApplication
    ? userData?.status || "pending"
    : null;
  const statusTone =
    applicationStatus === "approved"
      ? {
          badge: "bg-emerald-100 text-emerald-800",
          accent: "#059669",
          title: "Approved by admin",
          note: "Your application has been reviewed and approved for the next step.",
        }
      : applicationStatus === "rejected"
        ? {
            badge: "bg-rose-100 text-rose-800",
            accent: "#e11d48",
            title: "Changes required",
            note: "Admin reviewed your application and marked changes before approval.",
          }
        : {
            badge: "bg-amber-100 text-amber-800",
            accent: "#d97706",
          title: "Pending admin review",
          note: "Your application is in the admin review queue right now.",
        };

  useEffect(() => {
    if (loading || !userData || hasSubmittedApplication) {
      return;
    }

    clearPreviewDraft();
    clearFormState();
    sessionStorage.removeItem(APPLICATION_CONFIG_KEY);
    sessionStorage.removeItem("verifiedMobile");
  }, [hasSubmittedApplication, loading, userData]);

  const submittedOn = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not submitted yet";
  const reviewedOn = userData?.updatedAt
    ? new Date(userData.updatedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Awaiting update";

  const updateField = (key: keyof FormDataType, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const canEditApplication =
    hasSubmittedApplication &&
    (applicationStatus === "pending" || applicationStatus === "rejected");

  const handleEditApplication = () => {
    if (!userData || !canEditApplication) {
      return;
    }

    sessionStorage.setItem(
      APPLICATION_CONFIG_KEY,
      JSON.stringify({
        certificateClass: userData.certificateClass || formData.classType,
        certType: userData.certType || formData.certType,
        validity: userData.validity || formData.validity,
        tokenType: userData.tokenType || formData.tokenType,
        assistedService: formData.assistedService,
        price:
          typeof userData.price === "number"
            ? String(userData.price)
            : String(pricing.total),
        name: userData.name || formData.name,
        email: userData.email || formData.email,
        mobile: userData.number || formData.mobile,
      }),
    );

    saveFormState({
      name: userData.name || "",
      gender: userData.gender || "",
      dob: userData.dob || "",
      pan: userData.pan || "",
      email: userData.email || "",
      mobile: userData.number || "",
      ekycId: userData.ekycId || "",
      ekycPin: "",
      bpCode: "",
      address: userData.address || "",
      pincode: userData.pincode || "",
      city: userData.city || "",
      state: userData.state || "",
      certificateClass: userData.certificateClass || "Class III",
      tokenType: userData.tokenType || "Not Required",
      certType: userData.certType || "Signature",
      validity: userData.validity || "2 Years",
      addressProof: "",
      idProof: "",
      bpAvailable: "Yes",
      internalRemarks: "",
      photo: "",
      assistedService: formData.assistedService,
      price:
        typeof userData.price === "number"
          ? String(userData.price)
          : String(pricing.total),
    });

    clearPreviewDraft();
    sessionStorage.setItem(
      "verifiedMobile",
      userData.number || formData.mobile,
    );
    router.push(
      `/bank-telecom-form?mobile=${userData.number || formData.mobile}`,
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const clearUserSession = () => {
  sessionStorage.clear();
  localStorage.clear();
};

    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile ||
      !formData.certType ||
      !formData.validity
    ) {
      setError("Please complete all required details.");
      setUserData(null);
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

      sessionStorage.setItem(
        APPLICATION_CONFIG_KEY,
        JSON.stringify({
          certificateClass: formData.classType,
          certType: formData.certType,
          validity: formData.validity,
          tokenType: formData.tokenType,
          assistedService: formData.assistedService,
          price: String(pricing.total),
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
        }),
      );
      sessionStorage.setItem("userEmail", formData.email);
      router.push(
        formData.ekycType === "Aadhaar" ? "/verify-aadhaar" : "/verify",
      );
    } catch {
      alert("Server error. Please try again.");
    }
  };

  return (
    <div
      className="theme-transition hero-grid relative min-h-screen px-6 pb-10 pt-34"
      style={{ color: colors.text }}
    >
      <ParticleBackground />
      <div
        className="hero-glow left-8 top-28 h-56 w-56"
        style={{ backgroundColor: colors.accent }}
      />
      <div
        className="hero-glow right-10 top-24 h-72 w-72"
        style={{ backgroundColor: "var(--accent-secondary)" }}
      />

      {loading ? (
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="flex items-center justify-center min-h-50">
            <p style={{ color: colors.muted }}>Loading your profile...</p>
          </div>
        </div>
      ) : userData ? (
        <div className="relative z-10 mx-auto mb-8 max-w-6xl">
          <div
            className="shine-border theme-transition rounded-4xl border p-8 shadow-[0_24px_80px_rgba(0,0,0,0.16)]"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div
                  className="mb-4 inline-flex rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em]"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.panelStrong,
                    color: colors.accentLight,
                  }}
                >
                  Review Center
                </div>
                <h2
                  className="text-3xl font-black uppercase tracking-tight"
                  style={{ color: colors.text }}
                >
                  Hello, {userData.name || userData.email.split("@")[0]}!
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.muted }}>
                  {userData.email}
                </p>
                <p
                  className="mt-3 max-w-xl text-sm font-semibold leading-relaxed"
                  style={{ color: colors.muted }}
                >
                  {hasSubmittedApplication
                    ? statusTone.note
                    : "Welcome . Start a  DSC application below and complete the verification flow to see your live status here."}
                </p>
              </div>
              {hasSubmittedApplication ? (
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.muted }}
                    >
                      Status:
                    </span>
                    <span
                      className={`rounded-full px-4 py-2 text-xs font-bold uppercase ${statusTone.badge}`}
                    >
                      {applicationStatus}
                    </span>
                  </div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: colors.muted }}
                  >
                    Submitted: {submittedOn}
                  </p>
                  {canEditApplication ? (
                    <button
                      onClick={handleEditApplication}
                      className="theme-transition inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-[0.18em]"
                      style={{
                        borderColor: colors.borderSoft,
                        backgroundColor: colors.panelStrong,
                        color: colors.text,
                      }}
                    >
                      <PencilLine size={14} />
                      {applicationStatus === "rejected"
                        ? "Resubmit Form"
                        : "Edit Application"}
                    </button>
                  ) : null}
                </div>
              ) : (
                <div
                  className="rounded-3xl border px-5 py-4"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.panelStrong,
                  }}
                >
                  <p
                    className="text-[10px] font-black uppercase tracking-[0.24em]"
                    style={{ color: colors.muted }}
                  >
                    Fresh Login
                  </p>
                  <p className="mt-2 text-lg font-black" style={{ color: colors.text }}>
                    No DSC submission yet
                  </p>
                  <p className="mt-2 text-xs font-semibold" style={{ color: colors.muted }}>
                    Complete the form and bank/telecom verification to unlock tracking status.
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: <ShieldCheck size={18} />,
                  value: userData.isVerified ? "Verified" : "Pending",
                  label: "Email Status",
                },
                {
                  icon: <BadgeCheck size={18} />,
                  value: hasSubmittedApplication
                    ? userData.isAadhaarVerified
                      ? "Ready"
                      : "Action"
                    : "Start",
                  label: hasSubmittedApplication ? "Aadhaar Flow" : "DSC Journey",
                },
                {
                  icon: <Sparkles size={18} />,
                  value: hasSubmittedApplication ? applicationStatus || "pending" : "Not Submitted",
                  label: hasSubmittedApplication ? "Admin Review" : "Application State",
                },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`rounded-3xl border p-5 ${index === 1 ? "float-delay" : "float-slow"}`}
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.panelStrong,
                  }}
                >
                  <div
                    className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                    style={{ background: premiumGradient }}
                  >
                    {item.icon}
                  </div>
                  <p className="text-xl font-black uppercase">{item.value}</p>
                  <p
                    className="mt-1 text-[10px] font-black uppercase tracking-[0.22em]"
                    style={{ color: colors.muted }}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            {hasSubmittedApplication ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div
                  className="rounded-3xl border p-5"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.panelStrong,
                  }}
                >
                  <p
                    className="text-[10px] font-black uppercase tracking-[0.24em]"
                    style={{ color: colors.muted }}
                  >
                    Admin Review Details
                  </p>
                  <h3
                    className="mt-3 text-2xl font-black uppercase tracking-tight"
                    style={{ color: statusTone.accent }}
                  >
                    {statusTone.title}
                  </h3>
                  <p
                    className="mt-3 text-sm font-semibold leading-relaxed"
                    style={{ color: colors.muted }}
                  >
                    {userData?.internalRemarks
                      ? userData.internalRemarks
                      : applicationStatus === "approved"
                        ? "Your documents and profile details have been accepted by admin."
                        : applicationStatus === "rejected"
                          ? "Admin has requested corrections before moving forward."
                          : "Admin has not added remarks yet. Your application is waiting for review."}
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <StatusMeta
                      label="Review Status"
                      value={applicationStatus || "pending"}
                      colors={colors}
                    />
                    <StatusMeta
                      label="Last Update"
                      value={reviewedOn}
                      colors={colors}
                    />
                  </div>
                </div>

                <div
                  className="rounded-3xl border p-5"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.panelStrong,
                  }}
                >
                  <p
                    className="text-[10px] font-black uppercase tracking-[0.24em]"
                    style={{ color: colors.muted }}
                  >
                    Submitted Application
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <StatusMeta
                      label="Certificate"
                      value={userData?.certType || "Not selected"}
                      colors={colors}
                    />
                    <StatusMeta
                      label="Class"
                      value={userData?.certificateClass || "Not selected"}
                      colors={colors}
                    />
                    <StatusMeta
                      label="Validity"
                      value={userData?.validity || "Not selected"}
                      colors={colors}
                    />
                    <StatusMeta
                      label="Token"
                      value={userData?.tokenType || "Not selected"}
                      colors={colors}
                    />
                    <StatusMeta
                      label="PAN"
                      value={userData?.pan || "Not added"}
                      colors={colors}
                    />
                    <StatusMeta
                      label="Amount"
                      value={
                        typeof userData?.price === "number"
                          ? `INR ${userData.price}`
                          : "Not available"
                      }
                      colors={colors}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {!hasSubmittedApplication ? (
        <form
          onSubmit={handleSubmit}
          className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8"
        >
          <section
            className="shine-border theme-transition grid items-center gap-8 rounded-[2.5rem] border p-10 shadow-[0_24px_80px_rgba(0,0,0,0.16)] md:grid-cols-[0.95fr_1.05fr]"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <div className="flex justify-center">
              <div
                className="w-full max-w-sm rounded-4xl border p-6"
                style={{
                  backgroundColor: colors.panelStrong,
                  borderColor: colors.borderSoft,
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
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                    style={{ background: premiumGradient }}
                  >
                    <FileText size={20} />
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    "Choose certificate and validity",
                    "Verify via PAN or Aadhaar",
                    "Upload documents and preview",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border px-4 py-4"
                      style={{
                        borderColor: colors.borderSoft,
                        backgroundColor: colors.card,
                      }}
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white"
                        style={{ background: premiumGradient }}
                      >
                        0{index + 1}
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: colors.text }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-8 flex items-center gap-4">
                <div
                  className="h-0.5 w-12"
                  style={{ backgroundColor: colors.accent }}
                />
                <h1
                  className="text-4xl font-light uppercase tracking-tight"
                  style={{ color: colors.text }}
                >
                  DSC{" "}
                  <span className="font-black" style={{ color: colors.accent }}>
                    Enrollment
                  </span>
                </h1>
              </div>

              <div className="grid gap-6">
                {[
                  { label: "Full Name", type: "text", key: "name" },
                  { label: "Email Address", type: "email", key: "email" },
                  { label: "Mobile Number", type: "tel", key: "mobile" },
                ].map((field) => (
                  <FieldLabel
                    key={field.key}
                    label={field.label}
                    required
                    colors={colors}
                  >
                    <input
                      type={field.type}
                      value={formData[field.key as keyof FormDataType]}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      onChange={(event) =>
                        updateField(
                          field.key as keyof FormDataType,
                          event.target.value,
                        )
                      }
                      className="glass-input theme-transition w-full rounded-2xl border px-4 py-4 text-sm font-semibold outline-none"
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
            className="shine-border theme-transition rounded-[2.5rem] border p-10 shadow-[0_24px_80px_rgba(0,0,0,0.16)] md:p-14"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
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
                    value={formData[item.key as keyof FormDataType]}
                    onChange={(event) =>
                      updateField(
                        item.key as keyof FormDataType,
                        event.target.value,
                      )
                    }
                    className="glass-input theme-transition w-full cursor-pointer rounded-xl border px-3 py-3.5 text-sm font-bold outline-none"
                    style={{
                      color: colors.text,
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                      colorScheme: isDarkMode ? "dark" : "light",
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
                    className="theme-transition flex min-h-27.5 flex-col items-center justify-center rounded-2xl border border-dashed p-6"
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
                    className="theme-transition flex flex-col items-center justify-between gap-8 rounded-2xl border p-8 md:flex-row"
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
                      <div
                        className="text-4xl font-black"
                        style={{ color: colors.text }}
                      >
                        INR {pricing.total}
                      </div>
                    </div>

                    <div
                      className="flex gap-6 text-center"
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
              className="mt-10 flex flex-col items-center justify-between gap-8 border-t pt-12 md:flex-row"
              style={{ borderColor: colors.borderSoft }}
            >
              <div
                className="theme-transition flex flex-col gap-4 rounded-2xl border px-6 py-4 md:flex-row md:items-center md:gap-6"
                style={{
                  backgroundColor: colors.panel,
                  borderColor: colors.borderSoft,
                }}
              >
                <span
                  className="text-[11px] font-black uppercase"
                  style={{ color: colors.muted }}
                >
                  eKYC Mode:
                </span>
                <div className="flex gap-6">
                  {["PAN", "Aadhaar"].map((type) => (
                    <label
                      key={type}
                      className="flex cursor-pointer items-center gap-2.5"
                    >
                      <input
                        type="radio"
                        checked={formData.ekycType === type}
                        onChange={() => updateField("ekycType", type)}
                        className="sr-only"
                      />
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full border transition-all"
                        style={{
                          borderColor:
                            formData.ekycType === type
                              ? colors.accent
                              : colors.muted,
                          backgroundColor:
                            formData.ekycType === type
                              ? `${colors.accent}15`
                              : "transparent",
                          boxShadow:
                            formData.ekycType === type
                              ? `0 0 0 3px ${colors.accentSoft}`
                              : "none",
                        }}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              formData.ekycType === type
                                ? colors.accent
                                : "transparent",
                          }}
                        />
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: colors.text }}
                      >
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 md:items-end">
                {error ? (
                  <p className="text-[11px] font-black uppercase text-rose-500">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="theme-primary-btn theme-transition rounded-2xl px-14 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl"
                >
                  Generate Application{" "}
                  <ArrowRight className="ml-2 inline" size={16} />
                </button>
              </div>
            </div>
          </section>
        </form>
      ) : null}

      {userData && hasSubmittedApplication ? (
        <section className="relative z-10 mx-auto mt-8 grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_1fr]">
          <div
            className="rounded-4xl border p-8"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-[0.24em]"
              style={{ color: colors.muted }}
            >
              Your Details
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <StatusMeta
                label="Full Name"
                value={userData.name || "Not added"}
                colors={colors}
              />
              <StatusMeta
                label="Email"
                value={userData.email || "Not added"}
                colors={colors}
              />
              <StatusMeta
                label="Mobile"
                value={userData.number || "Not added"}
                colors={colors}
              />
              <StatusMeta
                label="Gender"
                value={userData.gender || "Not added"}
                colors={colors}
              />
              <StatusMeta
                label="Date of Birth"
                value={userData.dob || "Not added"}
                colors={colors}
              />
              <StatusMeta
                label="eKYC ID"
                value={userData.ekycId || "Not added"}
                colors={colors}
              />
            </div>
            <div className="mt-4">
              <StatusMeta
                label="Address"
                value={
                  [
                    userData.address,
                    userData.city,
                    userData.state,
                    userData.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Not added"
                }
                colors={colors}
              />
            </div>
          </div>

          <div
            className="rounded-4xl border p-8"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-[0.24em]"
              style={{ color: colors.muted }}
            >
              Your Uploaded Documents
            </p>
            <div className="mt-5 grid gap-4">
              <DocumentMeta
                label="Applicant Photo"
                value={userData.photo}
                colors={colors}
              />
              <DocumentMeta
                label="Identity Proof"
                value={userData.idProof}
                colors={colors}
              />
              <DocumentMeta
                label="Address Proof"
                value={userData.addressProof}
                colors={colors}
              />
            </div>
          </div>
        </section>
      ) : null}
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
      <label
        className="ml-1 text-[10px] font-bold uppercase"
        style={{ color: colors.muted }}
      >
        {label}{" "}
        {required ? <span style={{ color: colors.accent }}>*</span> : null}
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
        <div
          className="text-[9px] font-bold uppercase"
          style={{ color: muted }}
        >
          {label}
        </div>
        <div className="font-bold">INR {value}</div>
      </div>
      {!last ? (
        <div className="h-8 w-px" style={{ backgroundColor: divider }} />
      ) : null}
    </div>
  );
}

function StatusMeta({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof getThemePalette>;
}) {
  return (
    <div
      className="rounded-2xl border px-4 py-3"
      style={{ borderColor: colors.borderSoft, backgroundColor: colors.card }}
    >
      <p
        className="text-[10px] font-black uppercase tracking-[0.18em]"
        style={{ color: colors.muted }}
      >
        {label}
      </p>
      <p
        className="mt-2 break-all text-sm font-semibold"
        style={{ color: colors.text }}
      >
        {value}
      </p>
    </div>
  );
}

function DocumentMeta({
  label,
  value,
  colors,
}: {
  label: string;
  value?: string;
  colors: ReturnType<typeof getThemePalette>;
}) {
  return (
    <div
      className="rounded-2xl border px-4 py-4"
      style={{
        borderColor: colors.borderSoft,
        backgroundColor: colors.panelStrong,
      }}
    >
      <p
        className="text-[10px] font-black uppercase tracking-[0.18em]"
        style={{ color: colors.muted }}
      >
        {label}
      </p>
      {value ? (
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold"
            style={{
              color: colors.accent,
              borderColor: colors.borderSoft,
              backgroundColor: colors.card,
            }}
          >
            View Document
          </a>
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-semibold"
            style={{
              color: colors.text,
              borderColor: colors.borderSoft,
              backgroundColor: colors.panel,
            }}
          >
            Open Uploaded File
          </a>
        </div>
      ) : (
        <p
          className="mt-2 text-sm font-semibold"
          style={{ color: colors.text }}
        >
          Not uploaded yet
        </p>
      )}
    </div>
  );
}
