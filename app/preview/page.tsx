"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const number = searchParams.get("number");

    setData({ name, email, number });
  }, [searchParams]);

  const handleConfirm = () => {
    // final submit or API call
    alert("Confirmed!");
    router.push("/success");
  };

  if (!data) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-white">
      <div className="bg-[#1A1A1A] p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/10">
        
        <h2 className="text-2xl font-bold mb-6">Preview Details</h2>

        <div className="space-y-3 text-sm">
          <p><strong>Name:</strong> {data.name}</p>
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Phone:</strong> {data.number}</p>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => router.back()}
            className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Back
          </button>

          <button
            onClick={handleConfirm}
            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}