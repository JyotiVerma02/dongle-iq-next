"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, SunMedium } from "lucide-react";

import {
  clearPreviewDraft,
  readPreviewDraft,
  storedFileToFile,
  type PreviewDraft,
} from "@/lib/applicationPreview";
import { calculatePricing } from "@/lib/pricing";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

export default function PreviewPage() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [draft, setDraft] = useState<PreviewDraft | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedDraft = readPreviewDraft();
    if (!savedDraft) {
      router.replace("/bank-telecom-form");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(savedDraft);
  }, [router]);

const handleConfirm = async () => {
  if (!draft) return;

  const photoIsRequiredAndMissing = !draft.files.photo.file && !draft.files.photo.isExisting;
  const idIsRequiredAndMissing = !draft.files.idProof.file && !draft.files.idProof.isExisting;
  const addressIsRequiredAndMissing = !draft.files.addressProof.file && !draft.files.addressProof.isExisting;

  if (photoIsRequiredAndMissing || idIsRequiredAndMissing || addressIsRequiredAndMissing) {
    alert("Please re-upload missing files.");
    router.push("/bank-telecom-form");
    return;
  }

  setLoading(true);

  try {
    const form = new FormData();

    Object.entries(draft.formData).forEach(([key, value]) => {
      if (
        key !== "photo" &&
        key !== "idProof" &&
        key !== "addressProof"
      ) {
        form.append(key, value);
      }
    });

    if (draft.files.photo.file) {
      const photoFile = await storedFileToFile(draft.files.photo);
      form.append("photo", photoFile);
    }
    if (draft.files.idProof.file) {
      const idProofFile = await storedFileToFile(draft.files.idProof);
      form.append("idProofFile", idProofFile);
    }
    if (draft.files.addressProof.file) {
      const addressProofFile = await storedFileToFile(draft.files.addressProof);
      form.append("addressProofFile", addressProofFile);
    }

    const response = await fetch("/api/save-user", {
      method: "POST",
      body: form,
    });

    const data = await response.json();

    if (!data.success) {
      alert(`Error: ${data.message}`);
      return;
    }

    clearPreviewDraft();

    alert("Form submitted successfully.");

    const isGuest = new URLSearchParams(window.location.search).get("guest") === "true";
    if (isGuest) {
      router.push("/apply-dsc?guest_success=true");
    } else {
      router.push("/user/dashboard?stage=payment");
    }
  } catch {
    alert("Could not submit the form. Please try again.");
  } finally {
    setLoading(false);
  }
};

  if (!draft) {
    return null;
  }

  const pricing = calculatePricing({
    certType: draft.formData.certType,
    validity: draft.formData.validity,
    tokenType: draft.formData.tokenType,
    assistedService: draft.formData.assistedService,
  });

  return (
    <div className="theme-transition hero-grid relative min-h-screen px-4 pb-10" style={{ color: colors.text }}>
      <div className="page-max-shell relative z-10 space-y-6 px-4 sm:px-6">
        <div
          className="theme-transition rounded-lg border p-6 shadow-[0_30px_80px_rgba(0,0,0,0.16)]"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em]" style={{ color: colors.accent }}>
                Final Review
              </p>
              <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">Preview Before Submit</h1>
              <p className="mt-2 text-sm" style={{ color: colors.muted }}>
                Check all details and documents one final time before saving them to the backend.
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 md:justify-end">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: colors.muted }}>
                  Final Amount
                </p>
                <p className="text-3xl font-black" style={{ color: colors.accent }}>
                  INR {pricing.total}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="theme-transition inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition hover:-translate-y-0.5"
                style={{
                  backgroundColor: colors.panelStrong,
                  borderColor: colors.borderSoft,
                  color: colors.text,
                }}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <SunMedium size={16} /> : <Moon size={16} />}
                {isDarkMode ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section
            className="theme-transition rounded-lg border p-6"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <h2 className="mb-5 text-xs font-black uppercase tracking-[0.22em]" style={{ color: colors.muted }}>
              Applicant Details
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <PreviewItem label="Name" value={draft.formData.name} colors={colors} />
              <PreviewItem label="Email" value={draft.formData.email} colors={colors} />
              <PreviewItem label="Mobile" value={draft.formData.mobile} colors={colors} />
              <PreviewItem label="PAN" value={draft.formData.pan} colors={colors} />
              <PreviewItem label="Gender" value={draft.formData.gender} colors={colors} />
              <PreviewItem label="DOB" value={draft.formData.dob} colors={colors} />
              <PreviewItem label="eKYC ID" value={draft.formData.ekycId} colors={colors} />
              <PreviewItem label="eKYC PIN" value={draft.formData.ekycPin} colors={colors} />
              <PreviewItem label="BP Code" value={draft.formData.bpCode || "Not entered"} colors={colors} />
              <PreviewItem label="Certificate" value={draft.formData.certType} colors={colors} />
              <PreviewItem label="Validity" value={draft.formData.validity} colors={colors} />
              <PreviewItem label="Token" value={draft.formData.tokenType} colors={colors} />
            </div>

            <div className="mt-4">
              <PreviewItem
                label="Address"
                value={[draft.formData.address, draft.formData.city, draft.formData.state, draft.formData.pincode].filter(Boolean).join(", ")}
                colors={colors}
              />
            </div>
          </section>

          <section
            className="theme-transition rounded-lg border p-6"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <h2 className="mb-5 text-xs font-black uppercase tracking-[0.22em]" style={{ color: colors.muted }}>
              Uploaded Documents
            </h2>

            <div className="space-y-4">
              <DocumentCard label="Applicant Photo" file={draft.files.photo} colors={colors} />
              <DocumentCard label="Identity Proof" file={draft.files.idProof} colors={colors} />
              <DocumentCard label="Address Proof" file={draft.files.addressProof} colors={colors} />
            </div>

            <div
              className="mt-6 rounded-lg border p-4"
              style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel }}
            >
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: colors.muted }}>Certificate</span>
                <span>INR {pricing.certificate}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span style={{ color: colors.muted }}>USB Token</span>
                <span>INR {pricing.token}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span style={{ color: colors.muted }}>Assisted Service</span>
                <span>INR {pricing.assisted}</span>
              </div>
              <div className="mt-3 border-t pt-3 text-base font-black" style={{ borderColor: colors.borderSoft }}>
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span style={{ color: colors.accent }}>INR {pricing.total}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:justify-end">
          <button
            onClick={() => router.push("/bank-telecom-form")}
            className="theme-transition rounded-lg border px-6 py-3 text-sm font-black uppercase tracking-[0.18em]"
            style={{ backgroundColor: colors.panelStrong, borderColor: colors.border, color: colors.text }}
          >
            Back To Edit
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="theme-primary-btn theme-transition rounded-lg px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Final Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewItem({
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
      className="theme-transition rounded-lg border px-4 py-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ backgroundColor: colors.panelStrong, borderColor: colors.borderSoft }}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: colors.muted }}>
        {label}
      </p>
      <p className="mt-2 break-all text-sm font-semibold" style={{ color: colors.text }}>
        {value || "Not entered"}
      </p>
    </div>
  );
}

function DocumentCard({
  label,
  file,
  colors,
}: {
  label: string;
  file: PreviewDraft["files"]["photo"];
  colors: ReturnType<typeof getThemePalette>;
}) {
  return (
    <div
      className="theme-transition rounded-lg border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{ backgroundColor: colors.panelStrong, borderColor: colors.borderSoft }}
    >
      <div className="mb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: colors.muted }}>
            {label}
          </p>
          <p className="mt-1 break-all text-sm font-semibold">{file.name}</p>
        </div>
      </div>
      <div className="mt-2 text-xs font-bold text-orange-500">
        File Uploaded Successfully
      </div>
    </div>
  );
}
