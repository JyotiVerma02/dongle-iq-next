"use client";

import { Suspense } from "react";
import BankTelecomForm from "@/components/BankTelecomForm";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh w-full bg-transparent" />}>
      <BankTelecomForm showVerify={true} />
    </Suspense>
  );
}
