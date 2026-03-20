"use client";

import React, { useState, useRef, ChangeEvent } from "react";

// --- TypeScript Interface ---
interface FormData {
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
}

export default function ProdigiSignForm() {
  const [showPin, setShowPin] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<FormData>>({
    mobile: "9555744396",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Auto-hide popup after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] font-sans text-[#333] pb-20 relative">
      
      {/* SUCCESS POPUP (Matches Video Alert) */}
      {isSubmitted && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-white border-t-4 border-green-500 shadow-2xl p-6 rounded flex items-center gap-4 animate-bounce">
          <div className="bg-green-100 text-green-600 rounded-full p-2 text-xl font-bold">✓</div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Success!</h3>
            <p className="text-gray-600">✅ Form Submitted Successfully</p>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-[#2c8ed3] text-white p-3 px-6 flex justify-between items-center shadow-md">
        <span className="font-bold text-lg tracking-tight">DSC PAN Based</span>
        <span className="text-sm font-medium opacity-90">Process Time : 1159 (Sec)</span>
      </div>

      <div className="max-w-[1200px] mx-auto mt-6 px-4">
        <form onSubmit={handleSubmit} className="bg-white shadow-xl border border-gray-300 rounded-sm overflow-hidden">
          
          {/* TOP DROPDOWNS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-[#fcfdfd] border-b border-gray-200">
            <Select label="Certificate Class" options={["Class 3"]} required />
            <Select label="Token Type" options={["Not Required"]} required />
            <Select label="Certificate Validity" options={["2 Years"]} required />
            <div className="flex items-end pb-1">
              <span className="bg-[#2c8ed3] text-white px-8 py-2.5 rounded text-lg font-black">
                Price: ₹899
              </span>
            </div>
          </div>

          <div className="p-8 space-y-10">
            {/* Rows 1 & 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input label="Name as per PAN" name="panName" required onChange={handleChange} />
              <Select label="Gender" options={["Select Gender", "Male", "Female"]} required />
              <Input label="Date of Birth" name="dob" placeholder="dd-mm-yyyy" required onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input label="PAN (Individual)" name="panNumber" placeholder="PAN NUMBER" required onChange={handleChange} />
              <Input label="Email ID" name="email" placeholder="Email Address" required onChange={handleChange} />
              <Input label="Mobile No" name="mobile" value={formData.mobile} required onChange={handleChange} />
            </div>

            {/* Row 3 - Eye Icon Logic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input label="eKYC ID" name="ekycId" placeholder="[number]@pan.prodigisign" required onChange={handleChange} />
              
              <div className="relative">
                <Input 
                  label="eKYC PIN" 
                  name="ekycPin" 
                  type={showPin ? "text" : "password"} 
                  placeholder="For example: 123456" 
                  required 
                  onChange={handleChange} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-[42px] text-[#2c8ed3] text-2xl hover:scale-110 transition"
                >
                  {showPin ? "👁️‍🗨️" : ""}
                </button>
              </div>

              <div>
                <label className="text-[14px] font-bold block mb-2 text-gray-700 uppercase">BP CODE</label>
                <div className="flex gap-2">
                  <input className="form-input flex-1" placeholder="REFERENCE CODE" />
                  <div className="flex items-center gap-2 px-3 bg-gray-50 border border-gray-200 rounded">
                    <span className="text-[10px] font-bold text-gray-400">Available?</span>
                    <input type="radio" defaultChecked className="accent-[#2c8ed3] w-4 h-4" />
                    <span className="text-sm font-bold">Yes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Header */}
            <div className="bg-[#e9ecef] p-3 px-6 -mx-8 font-bold text-[13px] text-gray-600 border-y border-gray-300 uppercase tracking-widest">
              Address
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Input label="Pincode" name="pincode" placeholder="Enter pincode" required onChange={handleChange} />
              <Input label="City" name="city" placeholder="City Name" required onChange={handleChange} />
              <Input label="State" name="state" placeholder="State" required onChange={handleChange} />
            </div>

            {/* Document Uploads */}
            <div className="border-t border-gray-100 pt-8">
              <p className="text-xs text-red-500 italic mb-6">* Supported formats: PDF, JPEG, JPG, PNG (&lt; 5MB)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <FileUpload label="Address Proof" />
                <FileUpload label="ID Proof" />
              </div>

              {/* IMAGE UPLOAD FIELD (Clickable & Drag-Drop style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
                <div>
                  <label className="text-sm font-bold block mb-2 uppercase text-gray-700">
                    Upload Photo (jpg, jpeg, png) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <div 
                    onClick={handleBoxClick}
                    className="border-2 border-dashed border-blue-200 bg-[#f0f7ff] h-44 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition shadow-inner"
                  >
                    <span className="text-5xl mb-2">☁️</span>
                    <p className="text-lg font-bold text-gray-700">
                      {selectedFile ? selectedFile.name : "Drag & Drop File"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 uppercase">OR Click Box to Browse File</p>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-bold block mb-2 uppercase text-gray-700">Remark (Optional)</label>
                  <textarea 
                    className="form-input flex-1 min-h-[176px] p-4 text-base resize-none" 
                    placeholder="Enter any additional remarks here..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* FINAL SUBMIT BUTTON */}
          <div className="p-8 bg-[#fcfdfd] border-t border-gray-200">
            <button 
              type="submit"
              className="w-full bg-[#28a745] hover:bg-[#218838] text-white py-4 rounded font-black text-2xl shadow-lg transition-transform active:scale-[0.99]"
            >
              Proceed (Next)
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          border: 1px solid #adb5bd;
          padding: 12px 16px;
          font-size: 16px;
          font-weight: 600;
          color: #000; /* Deep black text for clarity */
          border-radius: 4px;
          background: #fff;
        }
        .form-input::placeholder {
          color: #dee2e6; /* Very light placeholder */
          font-weight: 400;
        }
        .form-input:focus {
          border-color: #2c8ed3;
          outline: none;
          box-shadow: 0 0 0 4px rgba(44, 142, 211, 0.1);
        }
      `}</style>
    </div>
  );
}

// --- Internal Helpers ---

function Input({ label, required, type = "text", ...props }: any) {
  return (
    <div className="w-full">
      <label className="text-[14px] font-bold block mb-2 text-gray-700 uppercase tracking-tight">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input className="form-input" type={type} {...props} />
    </div>
  );
}

function Select({ label, options, required }: any) {
  return (
    <div className="w-full">
      <label className="text-[14px] font-bold block mb-2 text-gray-700 uppercase tracking-tight">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select className="form-input cursor-pointer">
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function FileUpload({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[14px] font-bold text-gray-700 uppercase tracking-tight">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-4">
        <button type="button" className="bg-[#f1f3f5] border border-gray-400 px-6 py-2 text-sm font-bold rounded hover:bg-gray-200">
          Choose File
        </button>
        <span className="text-sm text-gray-400 italic">No file chosen</span>
      </div>
    </div>
  );
}