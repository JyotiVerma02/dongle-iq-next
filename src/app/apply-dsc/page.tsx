"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, FileText } from "lucide-react";
import toast from "react-hot-toast";

import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";
import ApplicationForm, { ApplicationFormData } from "@/components/ApplicationForm";

export default function ApplyDSCPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  
  const [activeTab, setActiveTab] = useState<"apply" | "track">("apply");
  const [trackInput, setTrackInput] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<{ status: string; _id: string; name: string } | null>(null);
  const [trackError, setTrackError] = useState("");

  useEffect(() => {
    if (searchParams.get("guest_success") === "true") {
      setActiveTab("track");
      const savedMobile = sessionStorage.getItem("guestMobile");
      if (savedMobile) {
        setTrackInput(savedMobile);
      }
      toast.success("Application successfully submitted!", { duration: 5000 });
      router.replace("/apply-dsc"); // Clear query param
    }
  }, [searchParams, router]);

  const handleApplySubmit = async (payload: ApplicationFormData & { totalAmount: number }) => {
    try {
      const res = await fetch("/api/guest-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to create application");
      }
      
      toast.success("Application started! Please proceed to document upload.");
      
      // Store mobile for verification/tracking purposes in the guest flow
      sessionStorage.setItem("guestMobile", payload.mobile);
      
      // Redirect to the bank telecom form, adding a guest query param
      router.push(`/bank-telecom-form?mobile=${payload.mobile}&guest=true`);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
      throw error; // Rethrow to let ApplicationForm handle error state
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    
    setTrackLoading(true);
    setTrackError("");
    setTrackResult(null);
    
    try {
      const res = await fetch(`/api/track-application?query=${encodeURIComponent(trackInput.trim())}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Application not found");
      }
      
      setTrackResult(data.application);
    } catch (error: any) {
      setTrackError(error.message);
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen theme-transition flex flex-col items-center py-12 px-4 sm:px-6"
      style={{ backgroundColor: colors.shell, color: colors.text }}
    >
      <div className="w-full max-w-5xl">
        <button
          onClick={() => router.push("/")}
          className="mb-8 flex items-center gap-2 text-sm font-semibold opacity-80 hover:opacity-100 transition-opacity"
          style={{ color: colors.muted }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-3">
            Digital Signature <span style={{ color: colors.accent }}>Services</span>
          </h1>
          <p className="text-sm font-medium opacity-80 max-w-2xl mx-auto" style={{ color: colors.muted }}>
            Apply for a new DSC instantly without creating an account, or track your existing application using your Mobile Number or Application ID.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div 
            className="flex p-1 rounded-lg border shadow-sm"
            style={{ backgroundColor: colors.card, borderColor: colors.borderSoft }}
          >
            <button
              onClick={() => setActiveTab("apply")}
              className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === "apply" ? "shadow-md" : "opacity-70 hover:opacity-100"
              }`}
              style={{
                backgroundColor: activeTab === "apply" ? colors.panelStrong : "transparent",
                color: activeTab === "apply" ? colors.text : colors.muted,
              }}
            >
              <FileText size={16} />
              Apply New DSC
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === "track" ? "shadow-md" : "opacity-70 hover:opacity-100"
              }`}
              style={{
                backgroundColor: activeTab === "track" ? colors.panelStrong : "transparent",
                color: activeTab === "track" ? colors.text : colors.muted,
              }}
            >
              <Search size={16} />
              Track Application
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "apply" ? (
          <ApplicationForm
            mode="client"
            submitLabel="Proceed to Next Step"
            initialValues={{
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
            }}
            onSubmit={handleApplySubmit}
          />
        ) : (
          <div className="max-w-xl mx-auto w-full">
            <div 
              className="rounded-xl border p-6 sm:p-8 shadow-lg"
              style={{ backgroundColor: colors.card, borderColor: colors.borderSoft }}
            >
              <h2 className="text-xl font-bold mb-6 text-center">Track Your Application Status</h2>
              
              <form onSubmit={handleTrackSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold uppercase mb-2 block" style={{ color: colors.muted }}>
                    Application ID or Mobile Number
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: colors.muted }} />
                    <input
                      type="text"
                      value={trackInput}
                      onChange={(e) => setTrackInput(e.target.value)}
                      placeholder="Enter 10-digit mobile or App ID"
                      className="w-full rounded-lg border py-3 pl-10 pr-4 outline-none font-medium"
                      style={{
                        backgroundColor: colors.input,
                        borderColor: colors.inputBorder,
                        color: colors.text,
                      }}
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={trackLoading}
                  className="theme-primary-btn w-full rounded-lg py-3.5 text-xs font-black uppercase tracking-widest text-white mt-2 disabled:opacity-70"
                >
                  {trackLoading ? "Searching..." : "Track Status"}
                </button>
              </form>

              {trackError && (
                <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-sm font-bold text-red-500">{trackError}</p>
                </div>
              )}

              {trackResult && (
                <div className="mt-8 p-6 rounded-lg border" style={{ backgroundColor: colors.panel, borderColor: colors.borderSoft }}>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: colors.borderSoft }}>
                      <span className="text-xs font-bold uppercase" style={{ color: colors.muted }}>Applicant Name</span>
                      <span className="font-bold">{trackResult.name}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: colors.borderSoft }}>
                      <span className="text-xs font-bold uppercase" style={{ color: colors.muted }}>Application ID</span>
                      <span className="font-mono text-sm">{trackResult._id}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-bold uppercase" style={{ color: colors.muted }}>Current Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        trackResult.status === 'approved' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                        trackResult.status === 'rejected' ? 'bg-red-500/20 text-red-600 dark:text-red-400' :
                        'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {trackResult.status}
                      </span>
                    </div>
                  </div>
                  
                  {trackResult.status === "pending" && (
                    <button 
                      onClick={() => router.push(`/bank-telecom-form?mobile=${trackInput}&guest=true`)}
                      className="mt-6 w-full py-2.5 rounded-lg border text-sm font-bold transition-colors"
                      style={{ borderColor: colors.accent, color: colors.accent }}
                    >
                      Complete Pending Application
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}