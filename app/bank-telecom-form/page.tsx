"use client";

import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
// --- TypeScript Interface ---
interface FormData {
  certificateClass: string;
  tokenType: string;
  validity: string;
  panName: string;
  gender: string;
  dob: string;
  panNumber: string;
  email: string;
  mobile: string;
  ekycId: string;
  ekycPin: string;
  pincode: string;
  city: string;
  state: string;
  remark?: string;
}

export default function DongleIQForm() {
  const [showPin, setShowPin] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const verifyType = searchParams.get("type"); // telecom or bank
  console.log("Verification Type:", verifyType);
  // Refs for file inputs
  const addressRef = useRef<HTMLInputElement>(null);
  const idProofRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  // States for filenames and photo preview
  const [addressFile, setAddressFile] = useState<string>("No file chosen");
  const [idFile, setIdFile] = useState<string>("No file chosen");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    certificateClass: "Class 3",
    tokenType: "Not Required",
    validity: "2 Years",
    panName: "",
    gender: "Select Gender",
    dob: "",
    panNumber: "",
    email: "",
    mobile: "9555744396",
    ekycId: "",
    ekycPin: "",
    pincode: "",
    city: "",
    state: "",
    remark: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Fixed File Handlers ---
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Fixed the type for the setter function and the event
  const handleDocChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const file = e.target.files?.[0];
    if (file) setter(file.name);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/save-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData, // all form fields
          verifyType, // 🔥 important (telecom or bank)
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Form saved successfully");
        setIsSubmitted(true); // show summary AFTER saving
      } else {
        alert("❌ Error saving form");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Server error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-sans text-[#333] pb-20 relative">
      {/* SUMMARY MODAL */}
      {isSubmitted && (
        <div className="fixed inset-0 z-200 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm print:bg-white">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden print:shadow-none">
            <div className="bg-[#2c8ed3] p-4 text-white flex justify-between items-center print:hidden">
              <h2 className="font-black text-xl uppercase">
                Dongle-IQ Summary
              </h2>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-2xl hover:opacity-70 transition"
              >
                ✕
              </button>
            </div>
            <div className="p-10 space-y-4 bg-white" id="printable-area">
              <div className="flex justify-between border-b-2 border-[#2c8ed3] pb-4 mb-6">
                <div className="font-black text-3xl text-[#2c8ed3] italic tracking-tighter">
                  DONGLE-IQ
                </div>
                <div className="text-right font-bold text-gray-500 text-xs">
                  APPLICATION RECEIPT
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <SummaryItem label="Applicant Name" value={formData.panName} />
                <SummaryItem label="Mobile Number" value={formData.mobile} />
                <SummaryItem label="PAN Number" value={formData.panNumber} />
                <SummaryItem label="eKYC ID" value={formData.ekycId} />
                <SummaryItem label="Address Proof" value={addressFile} />
                <SummaryItem label="ID Proof" value={idFile} />
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex gap-4 justify-end border-t print:hidden">
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2 font-bold text-gray-400 text-xs uppercase"
              >
                Back
              </button>
              <button
                onClick={() => window.print()}
                className="bg-[#2c8ed3] text-white px-10 py-3 rounded font-black shadow-lg uppercase tracking-wide"
              >
                Print PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="text-center text-sm font-bold text-blue-600 mt-2">
        Verification Type: {verifyType?.toUpperCase()}
      </div>
      <p className="text-center font-bold text-blue-600">{verifyType}</p>
      <div className="bg-[#2c8ed3] text-white p-3 px-6 flex justify-between items-center shadow-md print:hidden">
        <span className="font-black text-xl tracking-tight uppercase">
          Dongle-IQ Portal
        </span>
        <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded">
          PAN BASED DSC
        </span>
      </div>

      <div className="max-w-312.5 mx-auto mt-8 px-4 print:hidden">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl border border-gray-300 rounded-sm overflow-hidden"
        >
          {/* TIER 1 SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-[#f8fbff] border-b border-gray-200">
            <Select
              label="Certificate Class"
              name="certificateClass"
              options={["Class 3"]}
              onChange={handleChange}
              required
            />
            <Select
              label="Token Type"
              name="tokenType"
              options={["Not Required"]}
              onChange={handleChange}
              required
            />
            <Select
              label="Validity"
              name="validity"
              options={["2 Years"]}
              onChange={handleChange}
              required
            />
            <div className="flex items-end">
              <span className="bg-[#2c8ed3] text-white px-8 py-3 rounded-md text-xl font-black shadow-md border-b-4 border-blue-700">
                Price: ₹899
              </span>
            </div>
          </div>

          <div className="p-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input
                label="Name as per PAN"
                name="panName"
                placeholder="ENTER FULL NAME"
                required
                onChange={handleChange}
              />
              <Select
                label="Gender"
                name="gender"
                options={["Select Gender", "Male", "Female"]}
                required
                onChange={handleChange}
              />
              <Input
                label="Date of Birth"
                name="dob"
                placeholder="DD-MM-YYYY"
                required
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input
                label="PAN (Individual)"
                name="panNumber"
                placeholder="ABCDE1234F"
                required
                onChange={handleChange}
              />
              <Input
                label="Email ID"
                name="email"
                type="email"
                placeholder="EMAIL@DOMAIN.COM"
                required
                onChange={handleChange}
              />
              <Input
                label="Mobile No"
                name="mobile"
                value={formData.mobile}
                required
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input
                label="eKYC ID"
                name="ekycId"
                placeholder="MOBILE@DONGLE-IQ"
                required
                onChange={handleChange}
              />
              <Input
                label="eKYC PIN"
                name="ekycPin"
                type={showPin ? "text" : "password"}
                placeholder="6 DIGIT PIN"
                required
                onChange={handleChange}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[#2c8ed3]"
                  >
                    {showPin ? "🙈" : "👁️"}
                  </button>
                }
              />
              <div className="flex flex-col">
                <label className="text-sm font-black block mb-2 text-gray-700 uppercase tracking-tight">
                  BP Code
                </label>
                <div className="flex gap-2">
                  <input
                    className="w-full border: 1.5px solid #ced4da; p-[14px_18px] text-[16px] font-bold rounded bg-white border-2 border-gray-200"
                    placeholder="REF CODE"
                  />
                  <div className="flex items-center gap-2 px-3 bg-gray-100 border border-gray-200 rounded">
                    <input
                      type="radio"
                      defaultChecked
                      className="accent-[#2c8ed3] w-4 h-4"
                    />
                    <span className="text-xs font-bold uppercase">Yes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#e9ecef] p-3 px-6 -mx-8 font-black text-sm text-gray-600 border-y border-gray-300 uppercase tracking-widest">
              Address Details
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input
                label="Pincode"
                name="pincode"
                placeholder="600001"
                required
                onChange={handleChange}
              />
              <Input
                label="City"
                name="city"
                placeholder="CITY NAME"
                required
                onChange={handleChange}
              />
              <Input
                label="State"
                name="state"
                placeholder="STATE NAME"
                required
                onChange={handleChange}
              />
            </div>

            <div className="pt-6">
              <p className="text-xs text-red-500 font-bold italic mb-6 tracking-wide">
                * Supported formats: PDF, JPEG, JPG, PNG (&lt; 5MB)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <FileUpload
                  label="Address Proof"
                  inputRef={addressRef}
                  fileName={addressFile}
                  onChange={(e) => handleDocChange(e, setAddressFile)}
                />
                <FileUpload
                  label="ID Proof (PAN Card)"
                  inputRef={idProofRef}
                  fileName={idFile}
                  onChange={(e) => handleDocChange(e, setIdFile)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                <div>
                  <label className="text-sm font-black block mb-2 uppercase text-gray-700">
                    Applicant Photo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    ref={photoRef}
                    onChange={handlePhotoChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <div
                    onClick={() => photoRef.current?.click()}
                    className="border-2 border-dashed border-blue-200 bg-[#f8fbff] h-52 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-all overflow-hidden group shadow-inner"
                  >
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <>
                        <span className="text-6xl mb-3">☁️</span>
                        <p className="text-lg font-black text-gray-700">
                          Click to Upload Photo
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-black block mb-2 uppercase text-gray-700">
                    Internal Remarks
                  </label>
                  <textarea
                    name="remark"
                    className="w-full border-2 border-gray-200 flex-1 min-h-52 p-4 font-bold resize-none shadow-inner rounded-lg focus:border-[#2c8ed3] outline-none"
                    placeholder="ANY EXTRA NOTES..."
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 bg-gray-50 border-t border-gray-200 flex justify-center">
            <button
              type="submit"
              className="w-full max-w-xl bg-[#28a745] hover:bg-[#218838] text-white py-5 rounded-md font-black text-2xl shadow-xl transition-all hover:-translate-y-0.5 uppercase"
            >
              PROCEED TO SUMMARY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Helper Components with Fixed Types ---
function SummaryItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-b border-gray-100 pb-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-base font-bold text-gray-900 truncate">
        {value || "---"}
      </p>
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightIcon?: React.ReactNode;
}

function Input({
  label,
  required,
  type = "text",
  rightIcon,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      <label className="text-xs sm:text-sm font-black block mb-1 sm:mb-2 text-gray-700 uppercase tracking-tight">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative group">
        <input
          type={type}
          {...props}
          className="w-full border-2 border-gray-200 px-4 py-3 sm:py-3.5 pr-12 text-sm sm:text-base font-semibold rounded-lg bg-white transition-all duration-200 focus:border-[#2c8ed3] focus:ring-4 focus:ring-blue-100 outline-none hover:border-[#2c8ed3]/60"
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-md bg-gray-50 border border-gray-200 text-gray-500 group-focus-within:text-[#2c8ed3] transition-all duration-200">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

function Select({ label, options, required, ...props }: SelectProps) {
  return (
    <div className="w-full">
      <label className="text-sm font-black block mb-2 text-gray-700 uppercase tracking-tight">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        {...props}
        className="w-full border-2 border-gray-200 px-4 py-3 text-sm font-semibold rounded-lg bg-white transition-all duration-200 focus:border-[#2c8ed3] focus:ring-4 focus:ring-blue-100 outline-none hover:border-[#2c8ed3]/60"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

interface FileUploadProps {
  label: string;
  inputRef: React.RefObject<HTMLInputElement | null>; // Fixed ref type
  fileName: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FileUpload({ label, inputRef, fileName, onChange }: FileUploadProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-black text-gray-700 uppercase tracking-tight">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-4">
        <input
          type="file"
          ref={inputRef}
          onChange={onChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="bg-[#f8f9fa] border-2 border-gray-300 px-6 py-2.5 text-xs font-black rounded hover:border-[#2c8ed3] shadow-sm transition-all active:scale-95"
        >
          CHOOSE FILE
        </button>
        <span className="text-xs text-gray-400 font-bold italic truncate max-w-37.5">
          {fileName}
        </span>
      </div>
    </div>
  );
}
