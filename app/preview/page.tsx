/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ParticleBackground from "@/components/ParticleBackground";
import {
  clearPreviewDraft,
  readPreviewDraft,
  storedFileToFile,
  type PreviewDraft,
} from "@/app/lib/applicationPreview";
import { calculatePricing } from "@/app/lib/pricing";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function PreviewPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [draft, setDraft] = useState<PreviewDraft | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedDraft = readPreviewDraft();
    if (!savedDraft) {
      router.replace("/bank-telecom-form");
      return;
    }

    setDraft(savedDraft);
  }, [router]);

  const handleConfirm = async () => {
    if (!draft) return;

    setLoading(true);

    try {
      const form = new FormData();

      Object.entries(draft.formData).forEach(([key, value]) => {
        if (key !== "photo" && key !== "idProof" && key !== "addressProof") {
          form.append(key, value);
        }
      });

      const [photoFile, idProofFile, addressProofFile] = await Promise.all([
        storedFileToFile(draft.files.photo),
        storedFileToFile(draft.files.idProof),
        storedFileToFile(draft.files.addressProof),
      ]);

      form.append("photo", photoFile);
      form.append("idProofFile", idProofFile);
      form.append("addressProofFile", addressProofFile);

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
      router.push("/admin/dashboard");
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
    <div className="theme-transition relative min-h-screen px-4 pb-10 pt-28" style={{ color: colors.text }}>
      <ParticleBackground />

      <div className="relative z-10 mx-auto max-w-6xl space-y-6">
        <div
          className="theme-transition rounded-[2rem] border p-6 shadow-[0_30px_80px_rgba(0,0,0,0.16)]"
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
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: colors.muted }}>
                Final Amount
              </p>
              <p className="text-3xl font-black" style={{ color: colors.accent }}>
                INR {pricing.total}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section
            className="theme-transition rounded-[2rem] border p-6"
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

            <div className="mt-4">
              <PreviewItem label="Internal Remarks" value={draft.formData.internalRemarks || "No remarks added"} colors={colors} />
            </div>
          </section>

          <section
            className="theme-transition rounded-[2rem] border p-6"
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
              className="mt-6 rounded-2xl border p-4"
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
            onClick={() => router.back()}
            className="theme-transition rounded-xl border px-6 py-3 text-sm font-black uppercase tracking-[0.18em]"
            style={{ backgroundColor: colors.panel, borderColor: colors.border, color: colors.text }}
          >
            Back To Edit
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="theme-transition rounded-xl px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white disabled:opacity-60"
            style={{ backgroundColor: colors.accent }}
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
      className="theme-transition rounded-2xl border px-4 py-3"
      style={{ backgroundColor: colors.panel, borderColor: colors.borderSoft }}
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
  const isPdf = file.type === "application/pdf";

  return (
    <div
      className="theme-transition rounded-2xl border p-4"
      style={{ backgroundColor: colors.panel, borderColor: colors.borderSoft }}
    >
      <div className="mb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: colors.muted }}>
            {label}
          </p>
          <p className="mt-1 break-all text-sm font-semibold">{file.name}</p>
        </div>
      </div>

      {isPdf ? (
        <div
          className="flex h-36 items-center justify-center rounded-xl border text-sm font-bold"
          style={{ borderColor: colors.borderSoft, backgroundColor: colors.card }}
        >
          PDF Preview Available
        </div>
      ) : (
        <img src={file.dataUrl} alt={label} className="h-48 w-full rounded-xl object-contain" />
      )}
    </div>
  );
}
