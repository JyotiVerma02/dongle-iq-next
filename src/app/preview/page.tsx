"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Moon, SunMedium, X } from "lucide-react";

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
  const [dialog, setDialog] = useState<null | {
    title: string;
    message: string;
    actionLabel: string;
    action: () => void;
  }>(null);

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
      setDialog({
        title: "Missing Files",
        message: "Please re-upload missing files before continuing.",
        actionLabel: "Go Back",
        action: () => {
          setDialog(null);
          router.push("/bank-telecom-form");
        },
      });
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();

      Object.entries(draft.formData).forEach(([key, value]) => {
        if (key !== "photo" && key !== "idProof" && key !== "addressProof") {
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
        setDialog({
          title: "Submission Failed",
          message: data.message || "We could not submit your form. Please try again.",
          actionLabel: "Close",
          action: () => setDialog(null),
        });
        return;
      }

      clearPreviewDraft();

      const isGuest = new URLSearchParams(window.location.search).get("guest") === "true";
      if (isGuest) {
        router.push("/apply-dsc?guest_success=true&from=landing");
      } else {
        router.push("/user/dashboard?stage=payment");
      }
    } catch {
      setDialog({
        title: "Submission Error",
        message: "Could not submit the form. Please try again.",
        actionLabel: "Close",
        action: () => setDialog(null),
      });
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
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <button
            type="button"
            aria-label="Close dialog backdrop"
            className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-md"
            onClick={() => setDialog(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-dialog-title"
            className="relative w-full max-w-[620px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1022] px-6 py-8 shadow-[0_30px_120px_rgba(0,0,0,0.7)] md:px-8 md:py-10"
          >
            <div className="absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/15 blur-3xl" />
            <button
              type="button"
              onClick={() => setDialog(null)}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Close dialog"
            >
              <X size={22} />
            </button>

            <div className="relative flex flex-col items-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-400/15">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-emerald-400 text-emerald-400">
                  <CheckCircle2 size={26} strokeWidth={2.75} />
                </div>
              </div>

              <h2 id="preview-dialog-title" className="text-3xl font-black tracking-tight text-white md:text-[42px]">
                {dialog.title}
              </h2>
              <p className="mt-4 max-w-[540px] text-[15px] leading-7 text-slate-300 md:text-lg">
                {dialog.message}
              </p>

              <button
                type="button"
                onClick={dialog.action}
                className="mt-8 inline-flex h-14 w-full max-w-[280px] items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 px-6 text-[15px] font-black text-white shadow-[0_16px_40px_rgba(99,102,241,0.45)] transition hover:brightness-110"
              >
                {dialog.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

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
                value={[draft.formData.address, draft.formData.city, draft.formData.state, draft.formData.pincode]
                  .filter(Boolean)
                  .join(", ")}
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

            <div className="mt-6 rounded-lg border p-4" style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel }}>
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
      <div className="mt-2 text-xs font-bold text-orange-500">File Uploaded Successfully</div>
    </div>
  );
}


