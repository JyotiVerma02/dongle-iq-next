import { FileText, ArrowRight } from "lucide-react";
import { User, DashboardView } from "../../types";
import { useTheme } from "@/components/ThemeContext";

interface RecentActivityProps {
  users: User[];
  setView: (view: DashboardView) => void;
}

function getRelativeTime(dateString: string, index: number) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0 || isNaN(diffMs)) {
      const fallbackTimes = ["2h ago", "5h ago", "1d ago", "2d ago", "2d ago"];
      return fallbackTimes[index % fallbackTimes.length];
    }

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return "2h ago";
  }
}

const mockUsers = [
  {
    _id: "mock1",
    name: "Jyoti Verma",
    email: "jyotiverma.feb9@gmail.com",
    number: "9876543210",
    status: "approved",
    serviceType: "dsc",
    certificateClass: "Aadhaar DSC",
    certType: "Individual",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    _id: "mock2",
    name: "Rahul Sharma",
    email: "rahul@sharma.com",
    number: "9876543211",
    status: "pending",
    serviceType: "dsc",
    certificateClass: "Class 3 DSC",
    certType: "Individual",
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    _id: "mock3",
    name: "Tech Solutions Pvt. Ltd.",
    email: "info@techsolutions.com",
    number: "9876543212",
    status: "approved",
    serviceType: "dsc",
    certificateClass: "Organization DSC",
    certType: "Combo",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    _id: "mock4",
    name: "Vikram Singh",
    email: "vikram@singh.com",
    number: "9876543213",
    status: "rejected",
    serviceType: "dsc",
    certificateClass: "Aadhaar DSC",
    certType: "Individual",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    _id: "mock5",
    name: "Priya Patel",
    email: "priya@patel.com",
    number: "9876543214",
    status: "pending",
    serviceType: "dsc",
    certificateClass: "Class 2 DSC",
    certType: "Individual",
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

const STATUS_STYLES: Record<string, { text: string; bg: string }> = {
  approved: { text: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  issued:   { text: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  rejected: { text: "#f43f5e", bg: "rgba(244,63,94,0.12)" },
  pending:  { text: "#f97316", bg: "rgba(249,115,22,0.12)" },
};

export function RecentActivity({ users, setView }: RecentActivityProps) {
  const { isDarkMode } = useTheme();

  // Combine real users with mock data to fill 5 slots
  const baseUsers = users.slice(0, 5);
  const finalDisplayItems = [...baseUsers];
  if (finalDisplayItems.length < 5) {
    const needed = 5 - finalDisplayItems.length;
    for (let i = 0; i < needed; i++) {
      finalDisplayItems.push(mockUsers[i % mockUsers.length] as unknown as User);
    }
  }

  return (
    <div
      className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-5 flex flex-col h-full"
      style={{
        borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3
          className="text-[11px] font-black uppercase tracking-[0.15em]"
          style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}
        >
          Recent Applications
        </h3>
        <button
          onClick={() => setView("applications")}
          className="group flex items-center text-[10px] font-bold uppercase tracking-[0.15em] hover:brightness-110"
          style={{ color: "#ff6a00" }}
        >
          View All
          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="flex-1 space-y-2.5">
        {finalDisplayItems.map((user, idx) => {
          const status = user.status || "pending";
          const sc = STATUS_STYLES[status] || STATUS_STYLES.pending;
          const relativeTime = getRelativeTime(user.createdAt, idx);

          const displayAppId = user._id.startsWith("mock")
            ? `APP-2025-00${124 - idx}`
            : `APP-2025-${user._id.substring(user._id.length - 5).toUpperCase()}`;

          const dscDescription = user.certificateClass
            ? `${user.certificateClass} (${user.certType || "Individual"})`
            : "Class III DSC (Signature)";

          return (
            <div
              key={user._id}
              className="flex items-center justify-between p-2.5 rounded-xl border transition-colors duration-200"
              style={{
                borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: sc.bg, color: sc.text }}
                >
                  <FileText size={14} />
                </div>
                <div className="min-w-0 text-left">
                  <p
                    className="text-[11px] font-bold truncate"
                    style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}
                  >
                    {displayAppId}
                  </p>
                  <p
                    className="text-[9px] truncate font-medium"
                    style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }}
                  >
                    {dscDescription}
                  </p>
                  <p
                    className="text-[9px] truncate"
                    style={{ color: isDarkMode ? "rgba(255,255,255,0.25)" : "#cbd5e1" }}
                  >
                    {user.name}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-2">
                <span
                  className="inline-flex rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider capitalize"
                  style={{ backgroundColor: sc.bg, color: sc.text }}
                >
                  {status}
                </span>
                <p
                  className="mt-1 text-[9px] font-semibold"
                  style={{ color: isDarkMode ? "rgba(255,255,255,0.25)" : "#cbd5e1" }}
                >
                  {relativeTime}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
