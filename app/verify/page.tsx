"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [activeTab, setActiveTab] = useState("telecom");
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

    alert("✅ Verified Successfully");
 router.push("/bank-telecom-form");
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-gray-300">

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("telecom")}
            className={`flex-1 py-2 rounded-lg font-bold border ${
              activeTab === "telecom"
                ? "bg-blue-600 text-white border-black"
                : "bg-white text-gray-700 border-black"
            }`}
          >
            Telecom Verification
          </button>

          <button
            onClick={() => setActiveTab("bank")}
            className={`flex-1 py-2 rounded-lg font-bold border ${
              activeTab === "bank"
                ? "bg-blue-600 text-white border-black"
                : "bg-white text-gray-700 border-black"
            }`}
          >
            Bank Verification
          </button>
        </div>

        {/* Dynamic Instruction */}
        <p className="text-sm text-gray-800 mb-6 text-center font-medium">
          {activeTab === "telecom" ? (
            <>
              Enter the applicant's 10-digit registered mobile number. <br />
              Ensure the name matches telecom records.
            </>
          ) : (
            <>
              Applicant’s mobile number for DSC registration.
            </>
          )}
        </p>

        {/* Mobile Input */}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1 text-gray-800">
            Mobile Number
          </label>
          <input
            type="tel"
            maxLength={10}
            placeholder="Enter mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full border-2 border-gray-400 rounded-lg p-3 text-black bg-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* OTP Input */}
        <div className="mb-4">
          <label className="block text-sm font-bold mb-1 text-gray-800">
            OTP
          </label>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border-2 border-gray-400 rounded-lg p-3 text-black bg-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Checkbox (Dynamic Text) */}
        <div className="flex items-start gap-2 mb-4">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
          <span className="text-xs text-gray-800">
            {activeTab === "telecom" ? (
              <>
                I authorize verification of the mobile number and name with
                telecom records. <br />
              </>
            ) : (
              <>
                I authorize verification of the name with Bank records. <br />
              </>
            )}

            <span className="text-red-500 font-semibold">
              You must accept the terms and conditions to continue.
            </span>
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition">
            Send OTP
          </button>

          <button
            onClick={handleVerify}
            disabled={!isChecked}
            className={`py-3 rounded-lg font-bold transition ${
              isChecked
                ? "bg-green-600 hover:bg-green-700 text-white"
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