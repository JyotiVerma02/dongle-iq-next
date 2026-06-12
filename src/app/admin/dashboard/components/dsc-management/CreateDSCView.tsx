"use client";

import { ArrowLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

import { useTheme } from "@/components/ThemeContext";
import { clearFormState, clearPreviewDraft } from "@/lib/applicationPreview";
import { getThemePalette } from "@/lib/themePalette";

interface CreateDSCViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CreateDSCView({ onBack }: CreateDSCViewProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const router = useRouter();

  const openFullForm = () => {
    clearPreviewDraft();
    clearFormState();
    sessionStorage.removeItem("dongle-iq-application-config");
    sessionStorage.removeItem("verifiedMobile");
    router.push("/bank-telecom-form");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{ color: colors.muted }}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Create New DSC
          </h1>
          <p className="text-sm" style={{ color: colors.muted }}>
            Use the same full DSC form used across the website.
          </p>
        </div>
      </div>

      <section
        className="rounded-xl border p-6 shadow-sm sm:p-8"
        style={{ backgroundColor: colors.card, borderColor: colors.borderSoft }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.24em]"
          style={{ color: colors.accent }}
        >
          Unified application
        </p>
        <h2 className="mt-2 text-xl font-black" style={{ color: colors.text }}>
          Open the complete DSC form
        </h2>
        <p
          className="mt-2 max-w-2xl text-sm font-semibold leading-6"
          style={{ color: colors.muted }}
        >
          Applicant details, DSC selection, address, eKYC, and document uploads
          are now collected in one place.
        </p>

        <button
          type="button"
          onClick={openFullForm}
          className="theme-primary-btn mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white"
        >
          <FileText size={15} />
          Open Full Form
        </button>
      </section>
    </div>
  );
}
