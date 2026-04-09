"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ParticleBackground from "@/components/ParticleBackground";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function VerifyPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [activeTab, setActiveTab] = useState<"telecom" | "bank">("telecom");
  const [isChecked, setIsChecked] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      alert("Enter 10 digit number");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();
      alert(response.ok ? "OTP sent successfully" : data.message || "Failed to send OTP");
    } catch {
      alert("Error sending OTP");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = () => {
    if (!mobile || mobile.length < 10 || !otp || !isChecked) return;
    router.push(`/bank-telecom-form?type=${activeTab}`);
  };

  return (
    <main className="theme-transition relative flex min-h-screen items-center justify-center px-4 pt-28" style={{ color: colors.text }}>
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-sm">
        <div
          className="pointer-events-none absolute -inset-[1px] rounded-[1.75rem] blur-sm"
          style={{ background: `linear-gradient(90deg, ${colors.accent}, transparent, ${colors.accent})`, opacity: isDarkMode ? 0.34 : 0.18 }}
        />

        <section
          className="theme-transition relative rounded-[1.75rem] border p-5 shadow-[0_20px_55px_rgba(0,0,0,0.14)] backdrop-blur-2xl"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <div className="mb-4 text-center">
            <h1 className="text-xl font-black uppercase tracking-tighter" style={{ color: colors.text }}>
              Identity <span style={{ color: colors.accent }}>Verification</span>
            </h1>
          </div>

          <div className="mb-4 flex rounded-xl p-1" style={{ backgroundColor: colors.panel }}>
            {(["telecom", "bank"] as const).map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="theme-transition flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest"
                  style={{
                    backgroundColor: active ? colors.accent : "transparent",
                    color: active ? "#ffffff" : colors.muted,
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div
            className="mb-4 rounded-xl px-3 py-2 text-center text-[11px]"
            style={{ backgroundColor: `${colors.accent}12`, color: colors.muted }}
          >
            {activeTab === "telecom" ? "Verify via telecom records" : "Verify via bank identity API"}
          </div>

          <div className="mb-4 space-y-3">
            <input
              type="tel"
              maxLength={10}
              placeholder="Mobile Number"
              value={mobile}
              onChange={(event) => setMobile(event.target.value.replace(/\D/g, ""))}
              className="theme-transition w-full rounded-xl border px-3 py-3 text-sm outline-none"
              style={{ backgroundColor: colors.input, color: colors.text, borderColor: colors.inputBorder }}
            />

            <input
              type="text"
              maxLength={6}
              placeholder="OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              className="theme-transition w-full rounded-xl border px-3 py-3 text-sm outline-none"
              style={{ backgroundColor: colors.input, color: colors.text, borderColor: colors.inputBorder }}
            />
          </div>

          <div className="mb-4 flex cursor-pointer items-center gap-2" onClick={() => setIsChecked((current) => !current)}>
            <div
              className="theme-transition h-4 w-4 rounded border"
              style={{
                backgroundColor: isChecked ? colors.accent : "transparent",
                borderColor: isChecked ? colors.accent : colors.inputBorder,
              }}
            />
            <span className="text-[10px]" style={{ color: colors.muted }}>
              I agree to verification
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleSendOtp}
              disabled={isSending}
              className="theme-transition w-full rounded-xl border py-2 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ borderColor: colors.accent, color: colors.accent, backgroundColor: `${colors.accent}08` }}
            >
              {isSending ? "Sending..." : "Send OTP"}
            </button>

            <button
              onClick={handleVerify}
              disabled={!isChecked}
              className="theme-transition w-full rounded-xl py-2 text-[11px] font-black uppercase tracking-[0.22em] text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: isChecked ? colors.accent : colors.subtleText }}
            >
              Verify
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
