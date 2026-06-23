"use client";

import { Suspense } from "react";
import BankTelecomForm from "@/components/BankTelecomForm";

export default function DongleIQFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-black" />}>
      <BankTelecomForm />
    </Suspense>
  );
}
