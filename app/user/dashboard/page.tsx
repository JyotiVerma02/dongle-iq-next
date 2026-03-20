/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
// eslint-disable-next-line react-hooks/rules-of-hooks

export default function DSCRegistrationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
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
  });

  const [pricing, setPricing] = useState({
    certificate: 0,
    token: 0,
    assisted: 0,
    total: 0,
  });

  useEffect(() => {
    let cert = 0;
    let token = 0;
    let assisted = 0;

    // Pricing logic based on provided images
    if (formData.certType === "Signing & Encryption") {
      if (formData.validity === "1 Year") cert = 1200;
      if (formData.validity === "2 Years") cert = 1779;
      if (formData.validity === "3 Years") cert = 2400;
    } else if (formData.certType === "Signature") {
      cert = 800;
    }

    if (formData.tokenType === "USB Token") token = 500;
    if (formData.assistedService === "Required") assisted = 355;

    setPricing({
      certificate: cert,
      token: token,
      assisted: assisted,
      total: cert + token + assisted,
    });
  }, [formData]);

  const isProductSelected =
    formData.certType !== "" && formData.validity !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/user-dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          totalAmount: pricing.total,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (formData.ekycType === "Aadhaar") {
          router.push("/verify-aadhaar");
        } else {
          router.push("/verify"); // PAN flow
        }
      } else {
        alert("❌ Failed");
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Server Error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="min-h-screen bg-gray-50 py-12 px-4"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif" }}
      >
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Top Branding Section */}
          <div className="flex flex-col md:flex-row items-center p-10 gap-10">
            <div className="md:w-5/12">
              <img
                src="https://img.freepik.com/free-vector/electronic-signature-concept-illustration_114360-1010.jpg"
                alt="DSC Security"
                className="w-full h-auto"
              />
            </div>
            <div className="md:w-7/12">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gray-200"></div>
                <h1 className="text-4xl font-light text-gray-800">
                  DSC <span className="text-teal-500 font-extrabold">FORM</span>
                </h1>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {[
                  { label: "Name", type: "text", key: "name" },
                  { label: "Email", type: "email", key: "email" },
                  { label: "Mobile", type: "tel", key: "mobile" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-bold text-gray-900 mb-1.5">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      className="w-full border-2 border-gray-100 rounded-xl p-3 text-gray-800 font-medium outline-none focus:border-teal-400 focus:bg-teal-50/10 transition-all"
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.key]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Product Section - High Contrast */}
          <div className="bg-[#f8fafc] p-10 border-t border-gray-100">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-center text-lg font-extrabold italic text-gray-900 mb-8 tracking-wide uppercase">
                Please Select Our Product & Services
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Select Boxes with darker text */}
                {[
                  {
                    label: "User Type*",
                    key: "userType",
                    options: [
                      "Individual",
                      "Organization",
                      "Foreign Individual",
                    ],
                  },
                  {
                    label: "Class Type",
                    key: "classType",
                    options: ["Class III"],
                  },
                  {
                    label: "Certificate Types*",
                    key: "certType",
                    options: [
                      "Encryption",
                      "Signature",
                      "Signing & Encryption",
                    ],
                  },
                  {
                    label: "Validity*",
                    key: "validity",
                    options: ["1 Year", "2 Years", "3 Years"],
                  },
                  {
                    label: "Token Type",
                    key: "tokenType",
                    options: ["Not Required", "USB Token"],
                  },
                  {
                    label: "Assisted Service",
                    key: "assistedService",
                    options: ["Not Required", "Required"],
                  },
                ].map((item) => (
                  <div key={item.key} className="flex flex-col gap-2">
                    <label className="text-[13px] font-black text-gray-900 uppercase tracking-wider">
                      {item.label}
                    </label>
                    <select
                      className="w-full border-2 border-blue-100 rounded-xl p-3 bg-white text-sm font-bold text-gray-800 outline-none focus:border-blue-500 focus:ring-4 ring-blue-50"
                      value={formData[item.key]}
                      onChange={(e) =>
                        setFormData({ ...formData, [item.key]: e.target.value })
                      }
                    >
                      {item.key === "certType" || item.key === "validity" ? (
                        <option value="">Select Type</option>
                      ) : null}
                      {item.options.map((opt) => (
                        <option key={opt} className="text-gray-900">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* Price Visibility Logic */}
                <div
                  className={`md:col-span-2 flex items-center gap-4 transition-all duration-700 ${isProductSelected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
                >
                  <div className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-base shadow-lg shadow-blue-200">
                    Price: ₹{pricing.total}
                  </div>

                  <div className="flex-1 border-2 border-gray-900 rounded-lg overflow-hidden bg-white">
                    <table className="w-full text-[11px] leading-tight font-bold">
                      <thead>
                        <tr className="bg-gray-900 text-white">
                          <th
                            colSpan={3}
                            className="px-3 py-1.5 text-left italic"
                          >
                            Bifurcation (Inc. Tax)
                          </th>
                        </tr>
                        <tr className="bg-gray-50 border-b border-gray-900">
                          <th className="px-3 py-1.5 border-r border-gray-900 text-gray-600">
                            Cert
                          </th>
                          <th className="px-3 py-1.5 border-r border-gray-900 text-gray-600">
                            Token
                          </th>
                          <th className="px-3 py-1.5 text-gray-600">
                            Assisted
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-900 text-center text-sm">
                        <tr>
                          <td className="px-3 py-2 border-r border-gray-900">
                            ₹{pricing.certificate}
                          </td>
                          <td className="px-3 py-2 border-r border-gray-900">
                            ₹{pricing.token}
                          </td>
                          <td className="px-3 py-2">₹{pricing.assisted}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Final Action Bar */}
              <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <span className="text-sm font-black text-gray-900 uppercase">
                    eKYC Method:
                  </span>
                  <div className="flex gap-6">
                    {["PAN", "Aadhaar"].map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name="ekyc"
                          checked={formData.ekycType === type}
                          onChange={() =>
                            setFormData({ ...formData, ekycType: type })
                          }
                          className="w-5 h-5 accent-blue-600"
                        />
                        <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95"
                >
                  Proceed (Next)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
