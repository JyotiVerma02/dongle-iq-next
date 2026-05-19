"use client";

import { useState } from "react";
import { 
  User, 
  Shield, 
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";
import { useRouter } from "next/navigation";
import { saveFormState } from "@/lib/applicationPreview";

interface CreateDSCViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CreateDSCView({ onBack, onSuccess }: CreateDSCViewProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    certificateClass: "Class 3",
    certType: "Signature",
    validity: "2 Years",
    tokenType: "USB Token",
    assistedService: "Not Required",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save state for bank-telecom-form
    saveFormState({
      ...formData,
      // Map any fields if necessary, but names match now
    });

    // Navigate to bank-telecom-form
    router.push(`/bank-telecom-form?mobile=${formData.mobile}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            style={{ color: colors.muted }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Create New DSC</h1>
            <p className="text-sm" style={{ color: colors.muted }}>Register a new Digital Signature Certificate</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div 
          className="rounded-xl border p-6 space-y-4"
          style={{ backgroundColor: colors.card, borderColor: colors.borderSoft }}
        >
          <div className="flex items-center gap-2 mb-2">
            <User size={18} style={{ color: colors.accent }} />
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: colors.muted }}>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: colors.muted }}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: colors.muted }}>Mobile Number *</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
                placeholder="9876543210"
              />
            </div>
          </div>
        </div>

        {/* DSC Details */}
        <div 
          className="rounded-xl border p-6 space-y-4"
          style={{ backgroundColor: colors.card, borderColor: colors.borderSoft }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield size={18} style={{ color: colors.accent }} />
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>DSC Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: colors.muted }}>Certificate Class</label>
              <select
                name="certificateClass"
                value={formData.certificateClass}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
              >
                <option value="Class 3">Class 3</option>
                <option value="Class 2">Class 2</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: colors.muted }}>Certificate Type</label>
              <select
                name="certType"
                value={formData.certType}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
              >
                <option value="Signature">Signature</option>
                <option value="Encryption">Encryption</option>
                <option value="Combo">Combo</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: colors.muted }}>Validity</label>
              <select
                name="validity"
                value={formData.validity}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
              >
                <option value="1 Year">1 Year</option>
                <option value="2 Years">2 Years</option>
                <option value="3 Years">3 Years</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" style={{ color: colors.muted }}>Token Type</label>
              <select
                name="tokenType"
                value={formData.tokenType}
                onChange={handleChange}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ backgroundColor: colors.shell, borderColor: colors.borderSoft, color: colors.text }}
              >
                <option value="USB Token">USB Token</option>
                <option value="Soft Token">Soft Token</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105 active:scale-95"
            style={{ background: "var(--brand-gradient)", boxShadow: `0 8px 20px -6px ${colors.accentShadow}` }}
          >
            <span>Continue to Details</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
