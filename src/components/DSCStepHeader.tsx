"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Search } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

const STEPS = [
  { id: 1, label: "Verify", path: "/apply-dsc" },
  { id: 2, label: "Fill", path: "/bank-telecom-form" },
  { id: 3, label: "Review", path: "/preview" },
  { id: 4, label: "Approval", path: null },
];

interface DSCStepHeaderProps {
  activeStep: number;
  activeTab?: "apply" | "track";
  onTabChange?: (tab: "apply" | "track") => void;
  showTrackTab?: boolean;
  onStepChange?: (step: number) => void;
}

export default function DSCStepHeader({
  activeStep,
  activeTab,
  onTabChange,
  showTrackTab = true,
  onStepChange,
}: DSCStepHeaderProps) {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  return (
    <header
      className="w-full shrink-0 flex items-center justify-between px-6 md:px-10 h-[60px]"
      style={{
        background: isDarkMode ? "rgba(5,5,18,0.80)" : "rgba(255,255,255,0.80)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${colors.borderSoft}`,
      }}
    >
      <button
        type="button"
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] transition-opacity hover:opacity-70 shrink-0"
        style={{ color: colors.muted }}
      >
        <ArrowLeft size={13} className="stroke-[2.5]" />
        Home
      </button>

      <div className="flex items-center">
        {STEPS.map((step, idx, arr) => {
          const isActive = step.id === activeStep;
          const isDone = step.id < activeStep;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => {
                  if (!isDone || !step.path) return;
                  if (onStepChange) {
                    onStepChange(step.id);
                    return;
                  }
                  router.push(step.path);
                }}
                className={`flex flex-col items-center ${
                  isDone && step.path ? "cursor-pointer hover:opacity-80 transition-opacity" : "cursor-default"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all"
                  style={
                    isActive
                      ? {
                          background: "var(--accent)",
                          color: "#fff",
                          boxShadow: "0 0 14px var(--accent-shadow)",
                        }
                      : isDone
                      ? {
                          background: "var(--accent)",
                          color: "#fff",
                          opacity: 0.55,
                        }
                      : {
                          background: "transparent",
                          color: colors.muted,
                          border: `1.5px solid ${colors.borderSoft}`,
                        }
                  }
                >
                  {step.id}
                </div>
                <span
                  className="text-[9px] font-bold tracking-wider mt-1"
                  style={{
                    color: isActive ? colors.text : colors.muted,
                    opacity: isActive ? 1 : isDone ? 0.7 : 0.45,
                  }}
                >
                  {step.label}
                </span>
              </button>

              {idx < arr.length - 1 && (
                <div className="flex items-center gap-0.5 mb-4 mx-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: isDone || isActive ? "var(--accent)" : colors.borderSoft,
                      opacity: isDone || isActive ? 0.7 : 0.35,
                    }}
                  />
                  <div
                    className="h-[1.5px] w-8 md:w-12 rounded-full"
                    style={{
                      background: isDone
                        ? "var(--accent)"
                        : isActive
                        ? `linear-gradient(90deg, var(--accent-soft), ${colors.borderSoft})`
                        : colors.borderSoft,
                      opacity: isDone ? 0.55 : isActive ? 1 : 0.35,
                    }}
                  />
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: isDone ? "var(--accent)" : colors.borderSoft,
                      opacity: isDone ? 0.55 : 0.35,
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {activeStep === 1 && onTabChange ? (
          <>
            <button
              type="button"
              onClick={() => onTabChange("apply")}
              className="flex items-center gap-1.5 px-4 h-8 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all"
              style={
                activeTab === "apply"
                  ? {
                      background: "var(--accent)",
                      color: "#fff",
                      boxShadow: "0 4px 16px var(--accent-shadow)",
                    }
                  : {
                      background: "transparent",
                      color: colors.muted,
                      border: `1px solid ${colors.borderSoft}`,
                    }
              }
            >
              <User size={11} />
              Apply
            </button>
            {showTrackTab ? (
              <button
                type="button"
                onClick={() => onTabChange("track")}
                className="flex items-center gap-1.5 px-4 h-8 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all"
                style={
                  activeTab === "track"
                    ? {
                        background: "var(--accent)",
                        color: "#fff",
                        boxShadow: "0 4px 16px var(--accent-shadow)",
                      }
                    : {
                        background: "transparent",
                        color: colors.muted,
                        border: `1px solid ${colors.borderSoft}`,
                      }
                }
              >
                <Search size={11} />
                Track
              </button>
            ) : (
              <div
                className="flex items-center gap-1.5 px-4 h-8 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-not-allowed opacity-50"
                style={{
                  background: "transparent",
                  color: colors.muted,
                  border: `1px solid ${colors.borderSoft}`,
                }}
              >
                <Search size={11} />
                Track later
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-4 h-8 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all hover:opacity-70"
            style={{
              background: "transparent",
              color: colors.muted,
              border: `1px solid ${colors.borderSoft}`,
            }}
          >
            <ArrowLeft size={11} className="stroke-[2.5]" />
            Back
          </button>
        )}
      </div>
    </header>
  );
}
