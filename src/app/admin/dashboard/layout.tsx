import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Dongle IQ",
  description: "Dongle IQ Administrative Control Panel",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
