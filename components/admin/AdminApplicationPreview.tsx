"use client";

import { useMemo } from "react";

import { calculatePricing } from "@/app/lib/pricing";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";
import type { DashboardUser } from "@/components/UserLedger";

type AdminApplicationPreviewProps = {
  user: DashboardUser;
};

export default function AdminApplicationPreview({
  user,
}: AdminApplicationPreviewProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const pricing = useMemo(
    () =>
      calculatePricing({
        certType: user.certType || "",
        validity: user.validity || "",
        tokenType: user.tokenType || "",
        assistedService: "Not Required",
      }),
    [user.certType, user.tokenType, user.validity],
  );

  const details = [
    { label: "Full Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Mobile", value: user.number },
    { label: "PAN", value: user.pan },
    { label: "Gender", value: user.gender },
    { label: "Date of Birth", value: user.dob },
    { label: "eKYC ID", value: user.ekycId },
    { label: "eKYC PIN", value: user.ekycPin },
    { label: "BP Code", value: user.bpCode },
    { label: "Certificate Class", value: user.certificateClass },
    { label: "Certificate Type", value: user.certType },
    { label: "Validity", value: user.validity },
    { label: "USB Token", value: user.tokenType },
    { label: "Status", value: user.status },
    {
      label: "Aadhaar Verified",
      value: user.isAadhaarVerified ? "Yes" : "No",
    },
    { label: "Portal Verified", value: user.isVerified ? "Yes" : "No" },
  ];

  const address = [user.address, user.city, user.state, user.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6 px-5 pb-6 sm:px-6">
      <section
        className="rounded-3xl border p-5"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: colors.panel,
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.22em]"
              style={{ color: colors.accent }}
            >
              Applicant Preview
            </p>
            <h4 className="mt-2 text-2xl font-black">{user.name}</h4>
            <p className="mt-2 text-sm" style={{ color: colors.muted }}>
              Review the exact details saved from the user flow and bank telecom form.
            </p>
          </div>

          <div
            className="rounded-2xl border px-4 py-3"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.panelStrong,
            }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-[0.18em]"
              style={{ color: colors.muted }}
            >
              Calculated Total
            </p>
            <p className="mt-2 text-2xl font-black" style={{ color: colors.accent }}>
              INR {user.price ?? pricing.total}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section
          className="rounded-3xl border p-5"
          style={{
            borderColor: colors.borderSoft,
            backgroundColor: colors.panel,
          }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-[0.22em]"
            style={{ color: colors.muted }}
          >
            User Details
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {details.map((item) => (
              <PreviewItem
                key={item.label}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>

          <div className="mt-4">
            <PreviewItem label="Address" value={address} fullWidth />
          </div>

          <div className="mt-4">
            <PreviewItem
              label="Internal Remarks"
              value={user.internalRemarks}
              fullWidth
            />
          </div>
        </section>

        <section className="space-y-6">
          <div
            className="rounded-3xl border p-5"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.panel,
            }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-[0.22em]"
              style={{ color: colors.muted }}
            >
              Uploaded Documents
            </p>

            <div className="mt-5 space-y-4">
              <DocumentCard label="Applicant Photo" url={user.photo} />
              <DocumentCard label="Identity Proof" url={user.idProof} />
              <DocumentCard label="Address Proof" url={user.addressProof} />
            </div>
          </div>

          <div
            className="rounded-3xl border p-5"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.panel,
            }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-[0.22em]"
              style={{ color: colors.muted }}
            >
              Pricing Summary
            </p>

            <div className="mt-5 space-y-3 text-sm">
              <SummaryRow label="Certificate" value={pricing.certificate} />
              <SummaryRow label="USB Token" value={pricing.token} />
              <SummaryRow label="Assisted Service" value={pricing.assisted} />
              <SummaryRow
                label="Total"
                value={user.price ?? pricing.total}
                strong
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PreviewItem({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value?: string | number | null;
  fullWidth?: boolean;
}) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  return (
    <div
      className={fullWidth ? "rounded-2xl border px-4 py-3" : "rounded-2xl border px-4 py-3"}
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
      <p className="mt-2 break-all text-sm font-semibold" style={{ color: colors.text }}>
        {value ? String(value) : "Not entered"}
      </p>
    </div>
  );
}

function DocumentCard({
  label,
  url,
}: {
  label: string;
  url?: string;
}) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const isPdf = url?.toLowerCase().includes(".pdf");

  return (
    <div
      className="rounded-2xl border p-4"
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

      {url ? (
        <>
          {isPdf ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-xl border px-4 py-2 text-sm font-semibold"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: colors.panel,
                color: colors.text,
              }}
            >
              Open PDF
            </a>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={label}
              className="mt-3 h-48 w-full rounded-xl object-cover"
            />
          )}
        </>
      ) : (
        <p className="mt-2 text-sm" style={{ color: colors.muted }}>
          Not uploaded
        </p>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  return (
    <div
      className="flex items-center justify-between"
      style={{ color: strong ? colors.text : colors.muted }}
    >
      <span className={strong ? "font-black" : ""}>{label}</span>
      <span className={strong ? "font-black" : "font-semibold"}>
        INR {value}
      </span>
    </div>
  );
}
