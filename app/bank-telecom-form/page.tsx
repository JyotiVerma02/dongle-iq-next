/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DongleIQForm() {
  const router = useRouter();
  const photoRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const idProofRef = useRef<HTMLInputElement>(null);

  // Initial State
  const initialState = {
    name: "",
    gender: "",
    dob: "",
    pan: "",
    email: "",
    mobile: "7295014037",
    ekycId: "",
    ekycPin: "",
    bpCode: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    certificateClass: "Class III",
    tokenType: "Not Required",
    certType: "Signing",
    validity: "2 Years",
    addressProof: "",
    idProof: "",
    bpAvailable: "Yes",
    internalRemarks: "",
    photo: "",
    price: 1245
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false); // Improvement 3: Loading State
  const [timeLeft, setTimeLeft] = useState<number>(1200);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [addressFile, setAddressFile] = useState<string>("No file chosen");
  const [idFile, setIdFile] = useState<string>("No file chosen");
  const [photoFile, setPhotoFile] = useState<string>("");

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Session Expired! Please verify your mobile again.");
      router.push("/verify-mobile");
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // 1. Basic Field Validation
    if (!formData.name || !formData.pan || !formData.email || !formData.address || !formData.ekycPin) {
      alert("⚠️ Please fill all required fields marked with *");
      return;
    }

    // Improvement 1: Prevent empty file uploads
    if (!formData.addressProof || !formData.idProof || !formData.photo) {
      alert("⚠️ Please upload all required files (Address Proof, ID Proof, and Photo)");
      return;
    }

    // Improvement 2: PAN format validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.pan)) {
      alert("⚠️ Invalid PAN format (Example: ABCDE1234F)");
      return;
    }

    setLoading(true); // Improvement 3: Disable button

    try {
      const res = await fetch("/api/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Form Submitted Successfully!");
        setFormData(initialState);
        setAddressFile("No file chosen");
        setIdFile("No file chosen");
        setPhotoFile("");
        router.push("/admin/dashboard");
      } else {
        alert("❌ Error: " + (data.message || "Something went wrong!"));
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("❌ Critical Error: Could not connect to the server.");
    } finally {
      setLoading(false); // Improvement 3: Re-enable button
    }
  };

  return (
    <div className="min-h-screen bg-[#e9ecef] font-sans text-[#212529]">
      {/* Header */}
      <div className="bg-[#2c8ed3] text-white px-6 py-3 flex items-center justify-between shadow-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="bg-white text-[#2c8ed3] w-8 h-8 rounded-full flex items-center justify-center font-black text-xl">D</div>
          <span className="font-black text-lg tracking-tighter uppercase">Dongle-IQ</span>
        </div>
        <div className="text-center hidden md:block">
          <div className="text-[11px] font-bold opacity-80 uppercase tracking-widest">DSC PAN BASED</div>
          <div className="text-sm font-black">Process time: <span className=" tabular-nums">{timeLeft}</span> (sec)</div>
        </div>
        <button type="button" onClick={() => router.push("/")} className="hover:bg-red-500 bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
      </div>

      <div className="max-w-285 mx-auto p-4 lg:p-6">
        <form onSubmit={handleSubmit} className="bg-white shadow-[0_0.5rem_1rem_rgba(0,0,0,0.15)] rounded-sm overflow-hidden border border-[#dee2e6]">
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-5 bg-[#f8fbff] border-b border-[#dee2e6] items-end">
            <Select name="certificateClass" label="Certificate Class" options={["Class III"]} value={formData.certificateClass} onChange={handleChange} />
            <Select name="tokenType" label="Token Type" options={["Not Required", "Required"]} value={formData.tokenType} onChange={handleChange} />
            <Select name="certType" label="Certificate Type" options={["Signing", "Encryption", "Both"]} value={formData.certType} onChange={handleChange} />
            <Select name="validity" label="Certificate Validity" options={["2 Years", "1 Year"]} value={formData.validity} onChange={handleChange} />
            <div className="text-right pb-1">
              <span className="text-[#2c8ed3] font-black text-xl">Price: ₹{formData.price}</span>
            </div>
          </div>

          <div className="p-6 space-y-5 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input name="name" label="Name as per PAN" placeholder="ENTER FULL NAME" value={formData.name} onChange={handleChange} required />
              <Select name="gender" label="Gender" options={["Select Gender", "Male", "Female"]} value={formData.gender} onChange={handleChange} required />
              <Input name="dob" label="Date of Birth" placeholder="DD-MM-YYYY" value={formData.dob} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input name="pan" label="PAN No (Individual)" placeholder="ABCDE1234F" value={formData.pan} onChange={handleChange} required />
              <Input name="email" label="Email ID" type="email" placeholder="EMAIL ADDRESS" value={formData.email} onChange={handleChange} required />
              <Input name="mobile" label="Mobile No" readOnly value={formData.mobile} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input name="ekycId" label="eKYC ID" placeholder="mobile@dongle-iq" value={formData.ekycId} onChange={handleChange} required />
              <div>
                <label className="text-[13px] font-black block mb-1 text-black uppercase tracking-tight">eKYC PIN<span className="text-red-500">*</span></label>
                <div className="flex h-9.5">
                  <input name="ekycPin" type={showPin ? "text" : "password"} value={formData.ekycPin} onChange={handleChange} className="w-full border border-[#ced4da] px-3 text-[14px] font-semibold rounded-l focus:border-[#80bdff] outline-none" placeholder="6 DIGIT PIN" required />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="bg-[#2c8ed3] text-white px-3 rounded-r border border-[#2c8ed3]">{showPin ? "🔓" : "🔒"}</button>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-black block mb-1 text-black uppercase tracking-tight">BP Code<span className="text-red-500">*</span></label>
                <input name="bpCode" value={formData.bpCode} onChange={handleChange} className="w-full border border-[#ced4da] h-9.5 px-3 text-[14px] font-semibold rounded focus:border-[#80bdff] outline-none" placeholder="REFERENCE CODE" />
                <div className="flex items-center gap-3 mt-1.5 text-[12px] font-bold text-[#495057]">
                  <span>Is BPCode Available?</span>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="bpAvailable" value="Yes" checked={formData.bpAvailable === "Yes"} onChange={handleChange} className="accent-[#2c8ed3]" /> Yes</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="bpAvailable" value="No" checked={formData.bpAvailable === "No"} onChange={handleChange} className="accent-[#2c8ed3]" /> No</label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[13px] font-black block mb-1 text-black uppercase tracking-tight">Address<span className="text-red-500">*</span></label>
              <textarea name="address" placeholder="Full Address" value={formData.address} onChange={handleChange} required className="w-full border border-[#ced4da] min-h-20 p-3 text-[14px] font-semibold rounded focus:border-[#2c8ed3] outline-none placeholder:text-[#adb5bd] transition-all shadow-sm resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input name="pincode" label="Pincode" placeholder="600001" value={formData.pincode} onChange={handleChange} required />
              <Input name="city" label="City" placeholder="CITY NAME" value={formData.city} onChange={handleChange} required />
              <Input name="state" label="State" placeholder="STATE NAME" value={formData.state} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <FileComponent label="Address Proof" inputRef={addressRef} fileName={addressFile} setFile={(name: string) => { setAddressFile(name); setFormData(p => ({...p, addressProof: name}))}} />
              <FileComponent label="ID Proof" inputRef={idProofRef} fileName={idFile} setFile={(name: string) => { setIdFile(name); setFormData(p => ({...p, idProof: name}))}} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="text-[13px] font-black block mb-2 text-black uppercase">Upload Applicant Photo<span className="text-red-500">*</span></label>
                <input type="file" ref={photoRef} className="hidden" onChange={(e) => {
                    const name = e.target.files?.[0]?.name || "";
                    setPhotoFile(name);
                    setFormData(p => ({...p, photo: name}));
                }} />
                <div onClick={() => photoRef.current?.click()} className="border-2 border-dashed border-[#2c8ed3]/40 bg-[#f8fbff] h-37.5 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-[#eef6fc] transition-all group">
                  <div className="bg-[#2c8ed3] text-white p-3 rounded-full mb-2 shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-xl">{photoFile ? "✅" : "☁️"}</span>
                  </div>
                  <p className="text-[#2c8ed3] font-black text-sm uppercase">{photoFile || "Click to Upload Photo"}</p>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-black block mb-2 text-black uppercase">Internal Remarks</label>
                <textarea name="internalRemarks" value={formData.internalRemarks} onChange={handleChange} className="w-full border border-[#ced4da] p-3 text-[14px] font-semibold rounded h-37.5 resize-none outline-none shadow-inner" placeholder="ANY EXTRA NOTES..." />
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#f8f9fa] border-t border-[#dee2e6] flex justify-center">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#28a745] hover:bg-[#218838] text-white px-20 py-3 rounded font-black text-[16px] transition-all shadow-md uppercase active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Proceed to Summary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Helper Components ---
function Input({ label, required, ...props }: any) {
  return (
    <div className="w-full">
      <label className="text-[13px] font-black block mb-1 text-black uppercase tracking-tight">{label}{required && <span className="text-red-500">*</span>}</label>
      <input {...props} className="w-full border border-[#ced4da] h-9.5 px-3 text-[14px] font-semibold rounded focus:border-[#2c8ed3] outline-none placeholder:text-[#adb5bd] transition-all shadow-sm" />
    </div>
  );
}

function Select({ label, options, required, ...props }: any) {
  return (
    <div className="w-full">
      <label className="text-[13px] font-black block mb-1 text-black uppercase tracking-tight">{label}{required && <span className="text-red-500">*</span>}</label>
      <select {...props} className="w-full border border-[#ced4da] h-9.5 px-2 text-[14px] font-semibold rounded focus:border-[#2c8ed3] outline-none bg-white cursor-pointer shadow-sm">
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function FileComponent({ label, inputRef, fileName, setFile }: any) {
  return (
    <div>
      <label className="text-[13px] font-black block mb-2 text-black uppercase">{label}<span className="text-red-500">*</span></label>
      <div className="flex items-center gap-3">
        <input type="file" ref={inputRef} className="hidden" onChange={(e) => setFile(e.target.files?.[0]?.name || "No file chosen")} />
        <button type="button" onClick={() => inputRef.current.click()} className="bg-[#f8f9fa] border border-[#ced4da] px-4 py-1.5 text-[12px] font-black rounded text-[#212529] hover:bg-[#e2e6ea] transition-colors shadow-sm uppercase">Choose File</button>
        <span className="text-[12px] text-[#6c757d] font-bold italic truncate max-w-45">{fileName}</span>
      </div>
    </div>
  );
}