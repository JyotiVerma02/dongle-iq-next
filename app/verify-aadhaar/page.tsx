"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AadhaarVerifyPage() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const router = useRouter();

  const handleVerify = () => {
    if (!isChecked) {
      alert("⚠️ Please accept terms & conditions");
      return;
    }

    if (!mobile || !otp) {
      alert("⚠️ Enter mobile & OTP");
      return;
    }

    alert("✅ Aadhaar Verified Successfully");
    router.push("/bank-telecom-form");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-gray-300">

        {/* Heading */}
        <h2 className="text-center text-lg font-bold text-gray-800 mb-4">
          Aadhaar Verification
        </h2>

        {/* Important Line */}
        <p className="text-sm text-gray-800 mb-6 text-center font-medium">
          Please enter and verify Aadhaar Registered Mobile Number
        </p>

        {/* Mobile */}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1 text-gray-800">
            Mobile Number
          </label>
          <input
            type="tel"
            maxLength={10}
            placeholder="Enter Aadhaar linked mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            // Updated to be darker and bolder
            className="w-full border-2 border-gray-500 rounded-lg p-3 outline-none focus:border-blue-600 text-black font-bold placeholder-gray-300"
          />
        </div>

        {/* OTP */}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1 text-gray-800">
            OTP
          </label>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            // Updated to be darker and bolder
            className="w-full border-2 border-gray-500 rounded-lg p-3 outline-none focus:border-blue-600 text-black font-bold placeholder-gray-300"
          />
        </div>

        {/* Checkbox */}
        <div className="flex items-start gap-2 mb-4">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
            className="mt-1 w-4 h-4 accent-blue-600"
          />
          <span className="text-xs text-gray-800">
            I authorize verification of my Aadhaar details. <br />
            <span className="text-red-500 font-semibold">
              You must accept the terms and conditions to continue.
            </span>
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button className="bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
            Send OTP
          </button>

          <button
            onClick={handleVerify}
            disabled={!isChecked}
            className={`py-3 rounded-lg font-bold transition-all ${
              isChecked
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Verify & Continue
          </button>
        </div>
      </div>
    </div>
  );
}