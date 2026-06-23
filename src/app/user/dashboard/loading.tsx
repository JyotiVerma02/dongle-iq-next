import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle
          size={36}
          className="animate-spin"
          style={{ color: "var(--accent)" }}
        />
        <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
          Loading dashboard...
        </p>
      </div>
    </div>
  );
}
