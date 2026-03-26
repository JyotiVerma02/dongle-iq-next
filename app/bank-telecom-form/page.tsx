/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DongleIQForm() {
  const router = useRouter();

  // Timer State: 300 seconds (5 minutes)
  const [timeLeft, setTimeLeft] = useState<number>(1200);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [addressFile, setAddressFile] = useState<string>("No file chosen");
  const [idFile, setIdFile] = useState<string>("No file chosen");

  const addressRef = useRef<HTMLInputElement>(null);
  const idProofRef = useRef<HTMLInputElement>(null);

  // Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Session Expired! Please verify your mobile and OTP again.");
      router.push("/verify-mobile");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const handleClose = () => {
    if (
      confirm("Are you sure you want to close the form? Progress will be lost.")
    ) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#e9ecef] font-sans text-[#212529]">
      {/* MERGED HEADER: Logo (Left), Timer (Center), Close (Right) */}
      <div className="bg-[#2c8ed3] text-white px-6 py-3 flex items-center justify-between shadow-md border-b border-white/10">
        {/* Left Side: Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-white text-[#2c8ed3] w-8 h-8 rounded-full flex items-center justify-center font-black text-xl">
            D
          </div>
          <span className="font-black text-lg tracking-tighter uppercase">
            Dongle-IQ
          </span>
        </div>

        {/* Center: Timer & Title */}
        <div className="text-center hidden md:block">
          <div className="text-[11px] font-bold opacity-80 uppercase tracking-widest">
            DSC PAN BASED
          </div>
          <div className="text-sm font-black">
            Process time: <span className=" tabular-nums">{timeLeft}</span>{" "}
            (sec)
          </div>
        </div>

        {/* Right Side: Close Button */}
        <button
          onClick={handleClose}
          className="hover:bg-red-500 bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors group"
          title="Close Form"
        >
          <span className="text-xl font-light group-hover:font-bold">✕</span>
        </button>
      </div>

      <div className="max-w-285 mx-auto p-4 lg:p-6">
        <form className="bg-white shadow-[0_0.5rem_1rem_rgba(0,0,0,0.15)] rounded-sm overflow-hidden border border-[#dee2e6]">
          {/* Tier 1: Selection Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-5 bg-[#f8fbff] border-b border-[#dee2e6] items-end">
            <Select label="Certificate Class" options={["Class III"]} />
            <Select label="Token Type" options={["Not Required", "Required"]} />
            <Select
              label="Certificate Type"
              options={["Signing", "Encryption", "Both"]}
            />
            <Select
              label="Certificate Validity"
              options={["2 Years", "1 Year"]}
            />
            <div className="text-right pb-1">
              <span className="text-[#2c8ed3] font-black text-xl">
                Price: ₹0
              </span>
            </div>
          </div>

          <div className="p-6 space-y-5 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Name as per PAN"
                placeholder="ENTER FULL NAME"
                required
              />
              <Select
                label="Gender"
                options={["Select Gender", "Male", "Female"]}
                required
              />
              <Input label="Date of Birth" placeholder="DD-MM-YYYY" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="PAN No (Individual)"
                placeholder="ABCDE1234F"
                required
              />
              <Input
                label="Email ID"
                type="email"
                placeholder="EMAIL ADDRESS"
                required
              />
              <Input
                label="Mobile No"
                defaultValue="7295014037"
                readOnly
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input label="eKYC ID" placeholder="mobile@dongle-iq" required />
              <div>
                <label className="text-[13px] font-black block mb-1 text-black uppercase tracking-tight">
                  eKYC PIN<span className="text-red-500">*</span>
                </label>
                <div className="flex h-9.5">
                  <input
                    type={showPin ? "text" : "password"}
                    className="w-full border border-[#ced4da] px-3 text-[14px] font-semibold rounded-l focus:border-[#80bdff] outline-none"
                    placeholder="6 DIGIT PIN"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="bg-[#2c8ed3] text-white px-3 rounded-r border border-[#2c8ed3]"
                  >
                    {showPin ? "🔓" : "🔒"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[13px] font-black block mb-1 text-black uppercase tracking-tight">
                  BP Code<span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full border border-[#ced4da] h-9.5 px-3 text-[14px] font-semibold rounded focus:border-[#80bdff] outline-none"
                  placeholder="REFERENCE CODE"
                />
                <div className="flex items-center gap-3 mt-1.5 text-[12px] font-bold text-[#495057]">
                  <span>Is BPCode Available?</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="bp"
                      defaultChecked
                      className="accent-[#2c8ed3]"
                    />{" "}
                    Yes
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="bp"
                      className="accent-[#2c8ed3]"
                    />{" "}
                    No
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[13px] font-black block mb-1 text-black uppercase tracking-tight">
                Address<span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Full Address"
                required
                className="w-full border border-[#ced4da] min-h-20 p-3 text-[14px] font-semibold rounded focus:border-[#2c8ed3] outline-none placeholder:text-[#adb5bd] transition-all shadow-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input label="Pincode" placeholder="600001" required />
              <Input label="City" placeholder="CITY NAME" required />
              <Input label="State" placeholder="STATE NAME" required />
            </div>

            <div className="text-[12px] text-red-600 font-bold border-t border-[#dee2e6] pt-4 italic">
              Note: Supported File format to upload proofs are PDF, JPEG, JPG,
              PNG and File size should be less than 5 MB
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <FileComponent
                label="Address Proof"
                inputRef={addressRef}
                fileName={addressFile}
                setFile={setAddressFile}
              />
              <FileComponent
                label="ID Proof"
                inputRef={idProofRef}
                fileName={idFile}
                setFile={setIdFile}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="text-[13px] font-black block mb-2 text-black uppercase">
                  Upload Applicant Photo<span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-[#2c8ed3]/40 bg-[#f8fbff] h-37.5 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-[#eef6fc] transition-all group">
                  <div className="bg-[#2c8ed3] text-white p-3 rounded-full mb-2 shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-xl">☁️</span>
                  </div>
                  <p className="text-[#2c8ed3] font-black text-sm uppercase">
                    Drag & Drop File
                  </p>
                </div>
              </div>
              <div>
                <label className="text-[13px] font-black block mb-2 text-black uppercase">
                  Internal Remarks
                </label>
                <textarea
                  className="w-full border border-[#ced4da] p-3 text-[14px] font-semibold rounded h-37.5 resize-none outline-none shadow-inner"
                  placeholder="ANY EXTRA NOTES..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#f8f9fa] border-t border-[#dee2e6] flex justify-center">
            <button
              type="submit"
              className="bg-[#28a745] hover:bg-[#218838] text-white px-20 py-3 rounded font-black text-[16px] transition-all shadow-md uppercase tracking-wide active:scale-95"
            >
              Proceed to Summary
            </button>
          </div>
        </form>

        <div className="mt-5 pb-10 flex justify-between text-[11px] text-[#495057] font-bold px-1 border-t border-[#dee2e6] pt-3">
          <div>
            All rights reserved by{" "}
            <span className="text-[#2c8ed3]">Dongle-IQ® Solutions</span>
          </div>
          <div className="flex gap-4">
            <span>Version : 2.1.0.4</span>
            <span>Build : 2026.03.26</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Internal Helper Components ---

function Input({ label, required, ...props }: any) {
  return (
    <div className="w-full">
      <label className="text-[13px] font-black block mb-1 text-black uppercase tracking-tight">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        className="w-full border border-[#ced4da] h-9.5 px-3 text-[14px] font-semibold rounded focus:border-[#2c8ed3] outline-none placeholder:text-[#adb5bd] transition-all shadow-sm"
      />
    </div>
  );
}

function Select({ label, options, required, ...props }: any) {
  return (
    <div className="w-full">
      <label className="text-[13px] font-black block mb-1 text-black uppercase tracking-tight">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        {...props}
        className="w-full border border-[#ced4da] h-9.5 px-2 text-[14px] font-semibold rounded focus:border-[#2c8ed3] outline-none bg-white cursor-pointer shadow-sm"
      >
        {options.map((o: string) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function FileComponent({ label, inputRef, fileName, setFile }: any) {
  return (
    <div>
      <label className="text-[13px] font-black block mb-2 text-black uppercase">
        {label}
        <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          onChange={(e) =>
            setFile(e.target.files?.[0]?.name || "No file chosen")
          }
        />
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          className="bg-[#f8f9fa] border border-[#ced4da] px-4 py-1.5 text-[12px] font-black rounded text-[#212529] hover:bg-[#e2e6ea] transition-colors shadow-sm uppercase"
        >
          Choose File
        </button>
        <span className="text-[12px] text-[#6c757d] font-bold italic truncate max-w-45">
          {fileName}
        </span>
      </div>
    </div>
  );
}
