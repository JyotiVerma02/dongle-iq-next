"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const [password,setPassword] = useState("");
const [confirmPassword,setConfirmPassword] = useState("");
const [message,setMessage] = useState("");
const [loading,setLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

 const handleSubmit = async (e:any)=>{
  e.preventDefault();

  if(!token){
    setMessage("Invalid or expired reset link");
    return;
  }

  if(password !== confirmPassword){
    setMessage("Passwords do not match");
    return;
  }

  setLoading(true);

  const res = await fetch("/api/reset-password",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({token,password})
  });

 const data = await res.json();

setMessage(data.message);

if (res.ok) {
  setTimeout(() => {
    router.push("/login");
  }, 2000);
}

setLoading(false);

  return (
    <div
      className="min-h-screen flex pt-14 relative overflow-hidden bg-cover bg-center bg-no-repeat bg-linear-to-br from-slate-900 via-slate-900 to-blue-950"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* LEFT SIDE */}
      <div
        className="hidden md:flex w-3/5 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/tech-bg.jpg')" }}
      >
        <div className="relative z-10 text-white p-12 md:p-16 flex flex-col justify-center h-full">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-lg">
            <span className="block text-white">Smart USB Dongle</span>
            <span className="block text-emerald-400 text-2xl md:text-4xl mt-2">
              Management for Agents and Admins
            </span>
          </h1>

          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed font-medium">
            Reset your account password securely and continue managing your
            dongle applications through Dongle IQ.
          </p>
        </div>
      </div>

      {/* Glow circles */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl -top-40 -left-40 bg-blue-500/20"></div>
      <div className="absolute w-96 h-96 rounded-full blur-3xl -bottom-40 -right-40 bg-indigo-500/20"></div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center">
        <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-100 border border-white/20 text-white overflow-hidden">
          {/* Shine animation */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shine_3s_infinite] pointer-events-none"></div>

          <h2 className="text-4xl font-bold mb-3 text-white">Reset Password</h2>

          <p className="text-gray-300 mb-6">
         Create your new password
          </p>

          {message && (
            <div className="mb-4 text-green-400 text-sm font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            {/* New Password */}
            <div className="mb-4">
              <label className="block text-gray-300 mb-2 font-medium text-sm">
                New Password
              </label>

              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
              />
            </div>
            {/* Confirm Password */}
<div className="mb-4">
  <label className="block text-gray-300 mb-2 font-medium text-sm">
    Confirm Password
  </label>

  <input
  type="password"
  placeholder="Confirm password"
  value={confirmPassword}
  onChange={(e)=>setConfirmPassword(e.target.value)}
  className="w-full p-3 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
  />
</div>

            <button
type="submit"
disabled={loading}
className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300 text-white p-3 rounded-lg font-semibold"
>
{loading ? "Resetting..." : "Reset Password"}
</button>
          </form>
        </div>
      </div>
    </div>
  );
}
}