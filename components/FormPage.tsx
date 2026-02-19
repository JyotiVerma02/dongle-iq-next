"use client";




import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function Form() {
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState("personal");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    pan: "",
    aadharCard: "",
    dob: "",
    gender: "",
    country: "India",
    pincode: "",
    state: "",
    city: "",
    postOffice: "",
    streetAddress: "",
    companyName: "",
    designation: "",
  });

  // useEffect(() => {
  //   const isLoggedIn = localStorage.getItem("isLoggedIn");
  //   if (!isLoggedIn) {
  //     navigate("/");
  //   }
  //   localStorage.removeItem("dongleFormData");
  // }, [navigate]);

  //   useEffect(() => {
  //   const isLoggedIn = localStorage.getItem("isLoggedIn");
  //   if (!isLoggedIn) {
  //     navigate("/");
  //   }

  //   // Restore saved form data
  //   useEffect(() => {
  //   const savedData = localStorage.getItem("dongleFormData");
  //   if (savedData) {
  //     setFormData(JSON.parse(savedData));
  //   }
  // }, [navigate]);
  useEffect(() => {
    // 1️⃣ Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
router.push("/");

    }
  }, [router]);

  useEffect(() => {
    // 2️⃣ Restore saved form data
    const savedData = localStorage.getItem("dongleFormData");
    if (savedData) {
      // Wrap in setTimeout to avoid React warning
      setTimeout(() => {
        setFormData(JSON.parse(savedData));
      }, 0);
    }
  }, []);


  // const handleChange = (e) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value,
  //   });
  // };
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    localStorage.setItem("dongleFormData", JSON.stringify(updatedData));
  };


  const handleNext = () => {
    if (currentTab === "personal") {
      setCurrentTab("contact");
    } else if (currentTab === "contact") {
      setCurrentTab("company");
    } else if (currentTab === "company") {
      console.log("Form Data Submitted:", formData);
      setFormSubmitted(true);
    }
  };

  const handleBack = () => {
    if (currentTab === "company") {
      setCurrentTab("contact");
    } else if (currentTab === "contact") {
      setCurrentTab("personal");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleNext();
  };

  const handleEdit = () => {
    setFormSubmitted(false);
    setCurrentTab("company");
  };

  const handleConfirm = () => {
    // Save to local storage for Admin view
    const existingApplications = JSON.parse(localStorage.getItem("dongleApplications") || "[]");
    const newApplication = {
      ...formData,
      id: Date.now(),
      status: "Pending",
      submittedAt: new Date().toISOString()
    };
    existingApplications.push(newApplication);
    localStorage.setItem("dongleApplications", JSON.stringify(existingApplications));

    console.log("✅ Data saved to 'dongleApplications':", existingApplications);
    console.log("⚠️ 'dongleFormData' (draft) will be cleared now.");

    alert("Registration Confirmed Successfully ✅\n\nData has been moved to 'dongleApplications' in Local Storage.");
    setFormSubmitted(false);
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      mobileNumber: "",
      email: "",
      pan: "",
      aadharCard: "",
      dob: "",
      gender: "",
      country: "India",
      pincode: "",
      state: "",
      city: "",
      postOffice: "",
      streetAddress: "",
      companyName: "",
      designation: "",
    });
    localStorage.removeItem("dongleFormData");
    localStorage.removeItem("isLoggedIn");
   router.push("/");

  };

  return (
    <div className="min-h-screen flex flex-col bg-black  scrollbar-hide animated-bg">
      {/* <div className="absolute w-125 h-125 bg-pink-500/20 blur-[180px] rounded-full animate-float -top-25 -left-25" />
      <div className="absolute w-125 h-125 bg-blue-500/20 blur-[180px] rounded-full animate-float2 -bottom-25 -right-25" /> */}

      <div className="relative z-10 flex flex-col h-full w-full px-6 py-10">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-6xl  relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.6)] p-6 transition duration-500">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shine pointer-events-none"></div>

            <h1 className="text-2xs font-bold tracking-wide text-center mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Complete Your Onboarding Process
            </h1>

            {!formSubmitted ? (
              <>
                <div className="flex gap-3 mb-8 flex-wrap">
                  <button
                    onClick={() => setCurrentTab("personal")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition duration-300 flex items-center gap-2 ${currentTab === "personal"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white/20 text-white/70 border border-white/30 hover:bg-white/30"
                      }`}
                  >
                    <span>👤</span> Personal Details
                  </button>
                  <button
                    onClick={() => setCurrentTab("contact")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition duration-300 flex items-center gap-2 ${currentTab === "contact"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white/20 text-white/70 border border-white/30 hover:bg-white/30"
                      }`}
                  >
                    <span>📍</span> Address Details
                  </button>
                  <button
                    onClick={() => setCurrentTab("company")}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition duration-300 flex items-center gap-2 ${currentTab === "company"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white/20 text-white/70 border border-white/30 hover:bg-white/30"
                      }`}
                  >
                    <span>🏢</span> Company Details
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {currentTab === "personal" && (
                    <>
                      <div>
                        <h2 className="text-lg font-semibold text-white mb-4">
                          Person Details
                        </h2>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="flex flex-col text-sm">
                            <label className="mb-2 text-white/80 font-medium">
                              First Name
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              placeholder="Enter First Name"
                              className="bg-white/5 border border-white/30 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300"
                            />
                          </div>
                          <div className="flex flex-col text-sm">
                            <label className="mb-2 text-white/80 font-medium">
                              Middle Name
                            </label>
                            <input
                              type="text"
                              name="middleName"
                              value={formData.middleName}
                              onChange={handleChange}
                              placeholder="Enter Middle Name"
                              className="bg-white/5 border border-white/30 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300"
                            />
                          </div>
                          <div className="flex flex-col text-sm">
                            <label className="mb-2 text-white/80 font-medium">
                              Last Name
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              placeholder="Enter Last Name"
                              className="bg-white/5 border border-white/30 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          <div className="flex flex-col text-sm">
                            <label className="mb-2 text-white/80 font-medium">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              name="dob"
                              value={formData.dob}
                              onChange={handleChange}
                              className="bg-white/5 border border-white/30 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300"
                            />
                          </div>
                          <div className="flex flex-col text-sm">
                            <label className="mb-2 text-white/80 font-medium">
                              Gender
                            </label>
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              className="bg-white/5 border border-white/30 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300 [&>option]:bg-gray-800 [&>option]:text-white"
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="flex flex-col text-sm">
                            <label className="mb-2 text-white/80 font-medium">
                              PAN Card Number
                            </label>
                            <input
                              type="text"
                              name="pan"
                              value={formData.pan}
                              onChange={handleChange}
                              placeholder="Enter PAN"
                              className="bg-white/5 border border-white/30 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300"
                            />
                          </div>
                          <div className="flex flex-col text-sm">
                            <label className="mb-2 text-white/80 font-medium">
                              Aadhar Card
                            </label>
                            <input
                              type="text"
                              name="aadharCard"
                              value={formData.aadharCard}
                              onChange={handleChange}
                              placeholder="Enter Aadhar"
                              className="bg-white/5 border border-white/30 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col text-sm">
                          <label className="mb-2 text-white/80 font-medium">
                            Mobile Number
                          </label>
                          <input
                            type="text"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            placeholder="Enter Mobile Number"
                            className="bg-white/5 border border-white/30 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300"
                          />
                        </div>
                        <div className="flex flex-col text-sm">
                          <label className="mb-2 text-white/80 font-medium">
                            Email ID
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter Email"
                            className="bg-white/5 border border-white/30 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {currentTab === "contact" && (
                    <>
                      <h2 className="text-lg font-semibold text-white mb-4">
                        Address Details
                      </h2>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="flex flex-col text-sm">
                          <label className="mb-2 text-white/80 font-medium">
                            Country
                          </label>
                          <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/30 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300 [&>option]:bg-gray-800 [&>option]:text-white"
                          >
                            <option value="India">India</option>
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                          </select>
                        </div>
                        <div className="flex flex-col text-sm">
                          <label className="mb-2 text-white/80 font-medium">
                            Pincode
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            placeholder="Enter Pincode"
                            className="bg-white/5 border border-white/30 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300"
                          />
                        </div>
                        <div className="flex flex-col text-sm">
                          <label className="mb-2 text-white/80 font-medium">
                            State
                          </label>
                          <select
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/30 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300 [&>option]:bg-gray-800 [&>option]:text-white"
                          >
                            <option value="">Select State</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Bangalore">Bangalore</option>
                          </select>
                        </div>
                        <div className="flex flex-col text-sm">
                          <label className="mb-2 text-white/80 font-medium">
                            City
                          </label>
                          <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/30 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300 [&>option]:bg-gray-800 [&>option]:text-white"
                          >
                            <option value="">Select City</option>
                            <option value="New Delhi">New Delhi</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Bangalore">Bangalore</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col text-sm">
                          <label className="mb-2 text-white/80 font-medium">
                            Post Office
                          </label>
                          <select
                            name="postOffice"
                            value={formData.postOffice}
                            onChange={handleChange}
                            className="bg-white/5 border border-white/30 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300 [&>option]:bg-gray-800 [&>option]:text-white"
                          >
                            <option value="">Select Post Office</option>
                            <option value="Central">Central</option>
                            <option value="North">North</option>
                            <option value="South">South</option>
                          </select>
                        </div>
                        <div className="flex flex-col text-sm">
                          <label className="mb-2 text-white/80 font-medium">
                            Street Address
                          </label>
                          <input
                            type="text"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleChange}
                            placeholder="Enter Street Address"
                            className="bg-white/5 border border-white/30 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Company Details - Placeholder */}
                  {currentTab === "company" && (
                    <div className="flex flex-col gap-4">
                      <p className="text-white/60 text-sm">
                        Company Information (Optional)
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="mb-2 text-white/80 font-medium">
                            Company Name
                          </label>
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Enter Company Name"
                            className="bg-white/5 border border-white/30 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-2 text-white/80 font-medium">
                            Designation
                          </label>
                          <input
                            type="text"
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
                            placeholder="Enter Designation"
                            className="bg-white/5 border border-white/30 text-white placeholder-white/50 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-400 transition duration-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between gap-3 pt-6">
                    {currentTab !== "personal" && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-6 py-2 bg-gray-600 text-white text-sm rounded-lg font-medium hover:bg-gray-700 transition duration-300 shadow-lg flex items-center gap-2"
                      >
                        ← Back
                      </button>
                    )}
                    <div className="ml-auto"></div>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2 bg-purple-600 text-white text-sm rounded-lg font-medium hover:bg-purple-700 transition duration-300 shadow-lg flex items-center gap-2"
                    >
                      {currentTab === "company" ? "✓ Confirm" : "Next →"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="bg-white/5 border border-white/20 rounded-xl p-4">
                  <h2 className="text-lg font-semibold text-white mb-3">
                    📋 Review Your Details
                  </h2>

                  <div className="space-x-6 text-sm ">

                    <div>
                      <h3 className="text-white font-semibold mb-4 text-sm">
                        👤 Personal Details
                      </h3>

                      {/* Row 1 */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">First Name</p>
                          <p className="text-white font-medium">
                            {formData.firstName || "—"}
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">Middle Name</p>
                          <p className="text-white font-medium">
                            {formData.middleName || "—"}
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">Last Name</p>
                          <p className="text-white font-medium">
                            {formData.lastName || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Row 2 */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">Date of Birth</p>
                          <p className="text-white font-medium">
                            {formData.dob || "—"}
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">Gender</p>
                          <p className="text-white font-medium">
                            {formData.gender || "—"}
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">PAN</p>
                          <p className="text-white font-medium">
                            {formData.pan || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Row 3 */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">Aadhar</p>
                          <p className="text-white font-medium">
                            {formData.aadharCard || "—"}
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">Mobile</p>
                          <p className="text-white font-medium">
                            {formData.mobileNumber || "—"}
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">Email</p>
                          <p className="text-white font-medium">
                            {formData.email || "—"}
                          </p>
                        </div>
                      </div>
                    </div>


                    <div>
                      <h3 className="text-white font-semibold mb-4 text-sm">
                        📍 Address Details
                      </h3>

                      {/* Row 1 */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">Country</p>
                          <p className="text-white font-medium">
                            {formData.country || "—"}
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">State</p>
                          <p className="text-white font-medium">
                            {formData.state || "—"}
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">City</p>
                          <p className="text-white font-medium">
                            {formData.city || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Row 2 */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">Pin Code</p>
                          <p className="text-white font-medium">
                            {formData.pincode || "—"}
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">Post Office</p>
                          <p className="text-white font-medium">
                            {formData.postOffice || "—"}
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">Street</p>
                          <p className="text-white font-medium">
                            {formData.streetAddress || "—"}
                          </p>
                        </div>
                      </div>
                    </div>



                    <div>
                      <h3 className="text-white font-semibold mb-4 text-sm">
                        🏢 Company Details
                      </h3>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">Company Name</p>
                          <p className="text-white font-medium">
                            {formData.companyName || "—"}
                          </p>
                        </div>

                        <div className="bg-white/5 border border-white/20 rounded-lg p-1">
                          <p className="text-white/70 text-xs">Designation</p>
                          <p className="text-white font-medium">
                            {formData.designation || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="px-6 py-1 bg-white/20 border border-white/30 text-white text-sm rounded-lg font-medium hover:bg-white/30 transition duration-300 shadow-lg flex items-center gap-2"
                  >
                    ✎ Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="px-6 py-1 bg-green-500 text-white text-sm rounded-lg font-medium hover:bg-green-600 transition duration-300 shadow-lg flex items-center gap-2"
                  >
                    ✓ Confirm
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
