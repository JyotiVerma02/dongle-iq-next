"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { createQueryClient } from "@/lib/react-query";

import { CommandPalette } from "@/components/CommandPalette";
import CursorEffect from "@/components/CursorEffect";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <CursorEffect />
      <CommandPalette />
    </QueryClientProvider>
  );
}
