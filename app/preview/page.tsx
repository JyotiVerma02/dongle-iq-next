"use client";

import { useSearchParams, useRouter } from "next/navigation";

import ParticleBackground from "@/components/ParticleBackground";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const data = {
    name: searchParams.get("name"),
    email: searchParams.get("email"),
    number: searchParams.get("number"),
  };

  const handleConfirm = () => {
    alert("Confirmed!");
    router.push("/success");
  };

  return (
    <div className="theme-transition relative flex min-h-screen items-center justify-center px-4" style={{ color: colors.text }}>
      <ParticleBackground />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border p-8 shadow-xl"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        <h2 className="mb-6 text-2xl font-bold">Preview Details</h2>

        <div className="space-y-3 text-sm">
          <p><strong>Name:</strong> {data.name}</p>
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Phone:</strong> {data.number}</p>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.back()}
            className="rounded-lg px-5 py-2"
            style={{ backgroundColor: colors.panel, color: colors.text }}
          >
            Back
          </button>

          <button
            onClick={handleConfirm}
            className="rounded-lg px-5 py-2 text-white"
            style={{ backgroundColor: colors.accent }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
