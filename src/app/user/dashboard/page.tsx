"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  FileText,
  Headset,
  Info,
  LoaderCircle,
  LogOut,
  Mail,
  Menu,
  PencilLine,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Moon,
  SunMedium,
  RefreshCw,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { ErrorBoundary } from "@/app/admin/dashboard/components/common/ErrorBoundary";

import {
  APPLICATION_CONFIG_KEY,
  clearFormState,
  clearPreviewDraft,
  saveFormState,
} from "@/lib/applicationPreview";
import ApplicationForm, {
  type ApplicationFormData,
} from "@/components/ApplicationForm";
import { calculatePricing } from "@/lib/pricing";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";
import {
  UserSidebar,
  type UserDashboardView,
} from "@/components/user-dashboard/UserSidebar";
import { OverviewHeroShield } from "@/components/user-dashboard/OverviewHeroShield";
import { useUserKeyboardShortcuts } from "./hooks/useUserKeyboardShortcuts";
import { ShortcutsModal } from "@/app/admin/dashboard/components/common/ShortcutsModal";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type PaymentSummary = {
  _id: string;
  amount: number;
  status: string;
  method?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceUrl?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type UserData = {
  name: string;
  _id?: string;
  email: string;
  number?: string;
  status?: string;
  internalRemarks?: string;
  isVerified?: boolean;
  isAadhaarVerified?: boolean;
  pan?: string;
  gender?: string;
  dob?: string;
  ekycId?: string;
  certificateClass?: string;
  certType?: string;
  validity?: string;
  tokenType?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  photo?: string;
  idProof?: string;
  addressProof?: string;
  price?: number;
  assistedService?: string;
  paymentStatus?: "paid" | "pending" | "unpaid";
  latestPayment?: PaymentSummary | null;
  createdAt?: string;
  updatedAt?: string;
  remarksViewed?: boolean;
  resubmissionDocs?: {
    photo: boolean;
    idProof: boolean;
    addressProof: boolean;
  };
  actionHistory?: Array<{
    action: string;
    performedBy: string;
    timestamp: string;
    remarks: string;
  }>;
  queueLength?: number;
  estimatedTimeMinutes?: number;
};

const DEFAULT_FORM_VALUES: ApplicationFormData = {
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
};

const USER_VIEW_LABELS: Record<UserDashboardView, string> = {
  overview: "Overview Dashboard",
  applications: "My Applications",
  "my-dsc": "My DSC",
  "irctc-agents": "IRCTC Agents",
  transactions: "Transactions",
  notifications: "Notifications",
  "support-tickets": "Support Tickets",
  "profile-settings": "Profile & Settings",
  "upgrade-pro": "Upgrade to Pro",
  registration: "Start registration",
  payment: "Payment",
  "admin-review": "Admin review",
  "certificate-summary": "Certificate",
  "personal-details": "Your details",
  documents: "Documents",
};

const USER_SEARCH_ENTRIES: Array<{
  view: UserDashboardView;
  terms: string[];
}> = Object.entries(USER_VIEW_LABELS).map(([view, label]) => ({
  view: view as UserDashboardView,
  terms: [label, view.replace(/-/g, " ")],
}));

function hasCompletedApplication(user: UserData | null) {
  if (!user) {
    return false;
  }

  return Boolean(
    user.name &&
    user.email &&
    user.number &&
    user.pan &&
    user.address &&
    user.certType &&
    user.validity &&
    user.photo &&
    user.idProof &&
    user.addressProof,
  );
}
export default function DashboardPage() {
  useAuthGuard();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle size={36} className="animate-spin" style={{ color: "var(--accent)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <UserDashboardPage />
    </Suspense>
  );
}


// export default function DSCRegistrationForm() {
//   return (
//     <Suspense
//       fallback={<div className="min-h-screen bg-[var(--background)]" />}
//     >
//       <UserDashboardPage />
//     </Suspense>
//   );
// }

function UserDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const shellBackground = isDarkMode ? colors.panelStrong : colors.card;
  const cardBackground = isDarkMode ? colors.card : colors.panelStrong;
  const strongBorderColor = isDarkMode ? colors.inputBorder : colors.border;
  const cardBorderColor = isDarkMode ? colors.border : colors.borderSoft;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [view, setView] = useState<UserDashboardView>("overview");
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const [userDropdownPosition, setUserDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(
    null,
  );
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<{ _id: string; title: string; message: string; isRead?: boolean; type?: string; createdAt?: string }[]>([]);

  const fetchNotifications = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/notifications", { signal });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      }
    } catch (error: any) {
      if (error.name !== "AbortError" && error.message !== "Failed to fetch") {
        console.error(error);
      }
    }
  }, []);

  const fetchUnreadCount = fetchNotifications;

  useEffect(() => {
    const controller = new AbortController();
    fetchNotifications(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchNotifications]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const isRejectionNotification = useCallback((item: { title: string; message: string; type?: string }) => {
    const title = item.title.toLowerCase();
    const message = item.message.toLowerCase();
    return item.type === "rejection_reason" || title.includes("rejection") || message.includes("rejected");
  }, []);

  const hasSubmittedApplication = hasCompletedApplication(userData);
  const applicationStatus = hasSubmittedApplication
    ? userData?.status || "pending"
    : null;
  const paymentStatus = userData?.paymentStatus || "pending";
  const paymentIsSettled =
    paymentStatus === "paid" ||
    paymentSummary?.status === "verified" ||
    paymentSummary?.status === "completed";
  const userInitials = useMemo(() => {
    if (userData?.name) {
      return userData.name
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }

    return userData?.email?.charAt(0).toUpperCase() || "JV";
  }, [userData?.email, userData?.name]);
  const updateUserDropdownPosition = useCallback(() => {
    const rect = userDropdownButtonRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setUserDropdownPosition({
      top: rect.bottom + 8,
      right: Math.max(window.innerWidth - rect.right, 16),
    });
  }, []);
  const statusTone = useMemo(() => {
    return applicationStatus === "approved"
      ? {
          badge:
            "border border-orange-300/70 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
          accent: "#ff6a00",
          title: "Approved by admin",
          note: "Your application has been reviewed and approved for the next step.",
        }
      : applicationStatus === "rejected"
        ? {
            badge: "border border-rose-300/70 bg-rose-50 text-rose-700",
            accent: "#e11d48",
            title: "Changes required",
            note: "Admin reviewed your application and marked changes before approval.",
          }
        : {
            badge: "border border-amber-300/70 bg-amber-50 text-amber-700",
            accent: "#d97706",
            title: "Pending admin review",
            note: "Your application is in the admin review queue right now.",
          };
  }, [applicationStatus]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isUserDropdownOpen) {
      return;
    }

    updateUserDropdownPosition();

    window.addEventListener("resize", updateUserDropdownPosition);
    window.addEventListener("scroll", updateUserDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateUserDropdownPosition);
      window.removeEventListener("scroll", updateUserDropdownPosition, true);
    };
  }, [isUserDropdownOpen, updateUserDropdownPosition]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const fetchUserData = useCallback(async (signal?: AbortSignal) => {
    try {
      setError(null);
      const res = await fetch("/api/get-user-data", {
        cache: "no-store",
        signal,
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUserData((prev) => {
          if (prev && prev.status !== data.user.status) {
            const oldStatus = prev.status || "pending";
            const newStatus = data.user.status || "pending";
            const msg = `Application status changed from ${oldStatus.toUpperCase()} to ${newStatus.toUpperCase()}`;
            if (newStatus === "approved") {
              toast.success(`🎉 ${msg}! Your application is approved.`, {
                duration: 5000,
              });
            } else if (newStatus === "rejected") {
              toast.error(`⚠️ ${msg}. Correction requested.`, {
                duration: 6000,
              });
            } else {
              toast(`ℹ/ ${msg}`, { duration: 4000 });
            }
          }
          return data.user;
        });
        setPaymentSummary(data.user.latestPayment ?? null);
      } else {
        setUserData(null);
        setPaymentSummary(null);
      }
    } catch (err: any) {
      if (err.name !== "AbortError" && err.message !== "Failed to fetch") {
        console.error("Failed to fetch user data:", err);
        // Only show error if we don't already have data
        if (!userData) {
          setError("Failed to load dashboard data.");
        }
      } else if (err.message === "Failed to fetch" && !userData) {
        setError("Network connection interrupted. Please check your internet.");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  const fetchLatestPayment = useCallback(async () => {
    try {
      const res = await fetch("/api/payments/latest", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setPaymentSummary(data.payment ?? null);
      }
    } catch (error) {
      console.error("Failed to fetch payment:", error);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const controller = new AbortController();
    void fetchUserData(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchUserData]);

  // Real-time EventSource connection (replaces polling)
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !hasSubmittedApplication ||
      !userData?._id
    )
      return;

    const eventSource = new EventSource("/api/realtime");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "STATUS_UPDATE" && data.userId === userData._id) {
          toast.success(
            "Your application status has been updated in real-time!",
            {
              icon: "🔔",
              duration: 4000,
            },
          );
          void fetchUserData();
        }

        const refreshEvents = new Set([
          "NOTIFICATION_CREATED",
          "STATUS_UPDATE",
          "APPLICATION_UPDATED",
          "PAYMENT_UPDATED",
          "SUPPORT_TICKET_UPDATED",
        ]);
        if (refreshEvents.has(data.type)) {
          void fetchUnreadCount();
        }
      } catch (err) {
        console.error("Error parsing real-time event:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Real-time SSE connection error:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [hasSubmittedApplication, userData?._id, fetchUserData, fetchUnreadCount]);

  // Mark rejection remarks as viewed when user is on dashboard and views rejection status
  useEffect(() => {
    if (
      userData &&
      userData.status === "rejected" &&
      !userData.remarksViewed &&
      view === "overview"
    ) {
      fetch("/api/user/mark-remarks-viewed", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUserData((prev) =>
              prev ? { ...prev, remarksViewed: true } : null,
            );
          }
        })
        .catch((err) => console.error("Failed to mark remarks viewed:", err));
    }
  }, [userData, view]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setSidebarOpen(event.matches);
      if (!event.matches) {
        setIsCollapsed(false);
      }
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  useEffect(() => {
    if (loading || !userData || hasSubmittedApplication) {
      return;
    }

    clearPreviewDraft();
    clearFormState();
    sessionStorage.removeItem(APPLICATION_CONFIG_KEY);
    sessionStorage.removeItem("verifiedMobile");
  }, [hasSubmittedApplication, loading, userData]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (
      !loading &&
      hasSubmittedApplication &&
      searchParams.get("stage") === "payment"
    ) {
      setView("payment");
    }
  }, [hasSubmittedApplication, loading, searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const submittedOn = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not submitted yet";
  const reviewedOn = userData?.updatedAt
    ? new Date(userData.updatedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Awaiting update";

  const canEditApplication =
    hasSubmittedApplication &&
    !paymentIsSettled &&
    (applicationStatus === "pending" || applicationStatus === "rejected");

  const handleEditApplication = () => {
    if (!userData || !canEditApplication) {
      return;
    }

    sessionStorage.setItem(
      APPLICATION_CONFIG_KEY,
      JSON.stringify({
        certificateClass:
          userData.certificateClass || DEFAULT_FORM_VALUES.classType,
        certType: userData.certType || DEFAULT_FORM_VALUES.certType,
        validity: userData.validity || DEFAULT_FORM_VALUES.validity,
        tokenType: userData.tokenType || DEFAULT_FORM_VALUES.tokenType,
        assistedService:
          userData.assistedService || DEFAULT_FORM_VALUES.assistedService,
        price:
          typeof userData.price === "number"
            ? String(userData.price)
            : String(
                calculatePricing({
                  certType: userData.certType || DEFAULT_FORM_VALUES.certType,
                  validity: userData.validity || DEFAULT_FORM_VALUES.validity,
                  tokenType:
                    userData.tokenType || DEFAULT_FORM_VALUES.tokenType,
                  assistedService:
                    userData.assistedService ||
                    DEFAULT_FORM_VALUES.assistedService,
                }).total,
              ),
        name: userData.name || "",
        email: userData.email || "",
        mobile: userData.number || "",
      }),
    );

    saveFormState({
      name: userData.name || "",
      gender: userData.gender || "",
      dob: userData.dob || "",
      pan: userData.pan || "",
      email: userData.email || "",
      mobile: userData.number || "",
      ekycId: userData.ekycId || "",
      ekycPin: "",
      bpCode: "",
      address: userData.address || "",
      pincode: userData.pincode || "",
      city: userData.city || "",
      state: userData.state || "",
      certificateClass: userData.certificateClass || "Class III",
      tokenType: userData.tokenType || "Not Required",
      certType: userData.certType || "Signature",
      validity: userData.validity || "2 Years",
      addressProof: "",
      idProof: "",
      bpAvailable: "Yes",
      internalRemarks: "",
      photo: "",
      assistedService:
        userData.assistedService || DEFAULT_FORM_VALUES.assistedService,
      price:
        typeof userData.price === "number"
          ? String(userData.price)
          : String(
              calculatePricing({
                certType: userData.certType || DEFAULT_FORM_VALUES.certType,
                validity: userData.validity || DEFAULT_FORM_VALUES.validity,
                tokenType: userData.tokenType || DEFAULT_FORM_VALUES.tokenType,
                assistedService:
                  userData.assistedService ||
                  DEFAULT_FORM_VALUES.assistedService,
              }).total,
            ),
    });

    clearPreviewDraft();
    sessionStorage.setItem("verifiedMobile", userData.number || "");
    router.push(`/bank-telecom-form?mobile=${userData.number || ""}`);
  };

  const handleSidebarToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsCollapsed((current) => !current);
      setSidebarOpen(true);
      return;
    }
    setSidebarOpen((current) => !current);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      /* keep navigation */
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  const loadRazorpayScript = useCallback(() => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true), {
          once: true,
        });
        existingScript.addEventListener("error", () => resolve(false), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  async function handleProceedToPayment() {
    if (!userData?._id) {
      setPaymentMessage("User record is not ready yet.");
      return;
    }

    setPaymentLoading(true);
    setPaymentMessage("");
    setPaymentError("");

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData._id,
          description: `${userData.certType || "DSC"} application payment`,
        }),
      });
      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.message || "Failed to start payment.");
      }

      if (orderData.provider === "mock") {
        const verifyResponse = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: orderData.paymentId,
            mock: true,
          }),
        });
        const verifyData = await verifyResponse.json();

        if (!verifyResponse.ok || !verifyData.success) {
          throw new Error(
            verifyData.message || "Mock payment verification failed.",
          );
        }

        setPaymentSummary(verifyData.payment ?? null);
        setPaymentMessage(
          "Mock payment completed in development. Invoice generated and status updated.",
        );
        await Promise.all([fetchLatestPayment(), fetchUserData()]);
        setView("payment");
        setPaymentLoading(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Dongle IQ",
        description: `${userData.certType || "DSC"} application payment`,
        order_id: orderData.order.id,
        prefill: {
          name: userData.name,
          email: userData.email,
          contact: userData.number,
        },
        theme: {
          color: colors.accent,
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            setPaymentMessage(
              "Payment popup closed. You can try again anytime.",
            );
          },
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: orderData.paymentId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed.",
              );
            }

            setPaymentSummary(verifyData.payment ?? null);
            setPaymentMessage(
              "Payment verified, invoice generated, and status updated.",
            );
            await Promise.all([fetchLatestPayment(), fetchUserData()]);
            setView("payment");
          } catch (error) {
            setPaymentMessage(
              error instanceof Error
                ? error.message
                : "Verification failed after payment.",
            );
          } finally {
            setPaymentLoading(false);
          }
        },
      });

      razorpay.open();
    } catch (error) {
      setPaymentLoading(false);
      const msg =
        error instanceof Error
          ? error.message
          : "Unable to proceed to payment.";
      setPaymentMessage(msg);
      setPaymentError(msg);
    }
  }

  const selectView = (next: UserDashboardView) => {
    setView(next);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleDashboardSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = dashboardSearch.trim().toLowerCase();

    if (!query) {
      return;
    }

    const match = USER_SEARCH_ENTRIES.find((entry) =>
      entry.terms.some((term) => term.toLowerCase().includes(query)),
    );

    if (match) {
      selectView(match.view);
      setDashboardSearch("");
      return;
    }

    toast.error("No matching dashboard section found.");
  };

  useUserKeyboardShortcuts(selectView, () => setIsShortcutsOpen(true));

  const initialFormValues = useMemo<ApplicationFormData>(
    () => ({
      ...DEFAULT_FORM_VALUES,
      name: userData?.name || "",
      email: userData?.email || "",
      mobile: userData?.number || "",
      classType: userData?.certificateClass || DEFAULT_FORM_VALUES.classType,
      certType: userData?.certType || DEFAULT_FORM_VALUES.certType,
      validity: userData?.validity || DEFAULT_FORM_VALUES.validity,
      tokenType: userData?.tokenType || DEFAULT_FORM_VALUES.tokenType,
      assistedService:
        userData?.assistedService || DEFAULT_FORM_VALUES.assistedService,
    }),
    [
      userData?.name,
      userData?.email,
      userData?.number,
      userData?.certificateClass,
      userData?.certType,
      userData?.validity,
      userData?.tokenType,
      userData?.assistedService,
    ],
  );

  const pricingPreview = useMemo(
    () =>
      calculatePricing({
        certType: userData?.certType,
        validity: userData?.validity,
        tokenType: userData?.tokenType,
        assistedService: userData?.assistedService,
      }),
    [
      userData?.assistedService,
      userData?.certType,
      userData?.tokenType,
      userData?.validity,
    ],
  );

  const baseSubtotal =
    typeof userData?.price === "number" && userData.price > 0
      ? userData.price
      : pricingPreview.total;
  const estimatedGst = Number(((baseSubtotal * 18) / 100).toFixed(2));
  const payableAmount = paymentSummary?.amount || baseSubtotal + estimatedGst;

  const handleApplicationStart = async (
    formData: ApplicationFormData & { totalAmount: number },
  ) => {
    try {
      setFormSubmitting(true);
      const response = await fetch("/api/create-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Could not start verification.");
      }

      sessionStorage.setItem(
        APPLICATION_CONFIG_KEY,
        JSON.stringify({
          certificateClass: formData.classType,
          certType: formData.certType,
          validity: formData.validity,
          tokenType: formData.tokenType,
          assistedService: formData.assistedService,
          price: String(formData.totalAmount),
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
        }),
      );
      sessionStorage.setItem("userEmail", formData.email);
      router.push(
        formData.ekycType === "Aadhaar" ? "/verify-aadhaar" : "/verify",
      );
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to start verification.");
      console.error(err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const postSubmitLocked = (
    <div
      className="shine-border theme-transition ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.12)] sm:p-8"
      style={{
        backgroundColor: shellBackground,
        borderColor: strongBorderColor,
      }}
    >
      <p
        className="text-[10px] font-black uppercase tracking-[0.24em]"
        style={{ color: colors.muted }}
      >
        After submission
      </p>
      <h3
        className="mt-2 text-lg font-black uppercase tracking-tight"
        style={{ color: colors.text }}
      >
        Tracking unlocks here
      </h3>
      <p
        className="mt-2 max-w-lg text-sm font-semibold leading-relaxed"
        style={{ color: colors.muted }}
      >
        Finish the registration flow and upload all required proofs. Once your
        DSC application is complete, admin review, certificate summary, personal
        details, and documents appear in the sidebar under{" "}
        <span className="font-black">After submission</span>.
      </p>
      <button
        type="button"
        onClick={() => selectView("registration")}
        className="theme-transition mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-black uppercase tracking-[0.18em]"
        style={{
          borderColor: cardBorderColor,
          backgroundColor: cardBackground,
          color: colors.text,
        }}
      >
        Go to Start registration
      </button>
    </div>
  );

  const rejectionReasonAlert =
    userData && applicationStatus === "rejected" ? (
      <div
        className="mb-6 rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 shadow-[0_12px_36px_rgba(225,29,72,0.12)]"
        style={{
          borderColor: "rgba(225, 29, 72, 0.3)",
          backgroundColor: isDarkMode
            ? "rgba(225, 29, 72, 0.1)"
            : "rgba(225, 29, 72, 0.05)",
        }}
      >
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0 mt-0.5 border border-rose-500/20">
            <span className="font-bold text-lg">⚠️</span>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-rose-500">
              Application Rejection Reason
            </h4>
            <p
              className="mt-1 text-sm font-semibold"
              style={{ color: colors.text }}
            >
              {userData.internalRemarks ||
                "Please make necessary corrections to your submitted details."}
            </p>
          </div>
        </div>
        {canEditApplication && (
          <button
            onClick={handleEditApplication}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <PencilLine size={14} />
            Resubmit Form
          </button>
        )}
      </div>
    ) : null;

  const padOverviewStat = (value: number) => String(value).padStart(2, "0");

  const overviewStats = {
    total: hasSubmittedApplication ? 1 : 0,
    approved:
      applicationStatus === "approved" || applicationStatus === "issued"
        ? 1
        : 0,
    rejected: applicationStatus === "rejected" ? 1 : 0,
    pending:
      hasSubmittedApplication &&
      applicationStatus !== "approved" &&
      applicationStatus !== "issued" &&
      applicationStatus !== "rejected"
        ? 1
        : 0,
  };

  const getApplicationStepState = (
    stepId: number,
  ): "completed" | "active" | "pending" | "rejected" => {
    if (applicationStatus === "rejected" && stepId === 4) return "rejected";

    const completedByStep = [
      hasSubmittedApplication,
      hasSubmittedApplication &&
        Boolean(userData?.photo || userData?.idProof || userData?.addressProof),
      paymentIsSettled,
      applicationStatus === "approved" || applicationStatus === "issued",
      applicationStatus === "issued",
    ];

    const stepIndex = stepId - 1;
    const isCompleted = completedByStep.slice(0, stepIndex + 1).every(Boolean);
    if (isCompleted) return "completed";

    const firstIncomplete = completedByStep.findIndex((done) => !done);
    if (firstIncomplete === stepIndex) return "active";
    return "pending";
  };

  const overviewPanel = userData ? (
    <div className="space-y-6 ud-overview-theme">
      {rejectionReasonAlert}

      {/* Row 1: Unified hero — welcome + shield + fresh/status in one banner */}
      <div className="ud-hero-banner relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:p-6">
        <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:gap-2">
          {/* Welcome */}
          <div className="flex min-w-0 flex-1 flex-col justify-center xl:max-w-[42%]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-purple-500">
                WELCOME BACK
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsRefreshing(true);
                  void fetchUserData();
                }}
                disabled={isRefreshing}
                className="ud-hover-surface inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-orange-500 transition hover:scale-105 active:scale-95 disabled:opacity-60"
                title="Refresh status"
              >
                <RefreshCw
                  size={10}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-[1.65rem]">
              Hello, {userData.name || "User"}! 👋
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Manage your DSC and IRCTC applications securely and track their
              progress in real time.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <div className="ud-hero-badge ud-hero-badge--green inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold">
                <ShieldCheck size={12} />
                Verified User
              </div>
              <div className="ud-hero-badge ud-hero-badge--purple inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold">
                <CheckCircle2 size={12} />
                Account Verified
              </div>
            </div>
          </div>

          {/* Shield (center) — design asset */}
          <div className="hidden shrink-0 items-center justify-center px-2 sm:flex xl:w-[300px]">
            <OverviewHeroShield />
          </div>

          {/* Fresh login / application status (nested panel, same banner) */}
          <div className="ud-hero-fresh-panel ud-hover-surface flex w-full shrink-0 flex-col justify-between rounded-2xl border border-slate-200/70 bg-slate-50/90 p-5 xl:ml-auto xl:w-[min(100%,300px)]">
            {hasSubmittedApplication ? (
              <>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500">
                    APPLICATION STATUS
                  </p>
                  <h4 className="mt-2 text-base font-bold text-slate-800">
                    {applicationStatus === "approved"
                      ? "Approved by admin"
                      : applicationStatus === "rejected"
                        ? "Changes required"
                        : "Under review"}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {paymentIsSettled
                      ? "Your application is being verified by the admin team."
                      : "Complete bank/telecom verification and payment to unlock tracking."}
                  </p>
                </div>
                <div className="mt-4">
                  {!paymentIsSettled ? (
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      disabled={paymentLoading}
                      className="ud-cta-gradient flex w-full cursor-pointer items-center justify-between rounded-xl bg-gradient-to-r from-purple-600 via-violet-500 to-orange-500 px-5 py-3 text-xs font-bold text-white shadow-[0_6px_24px_rgba(124,58,237,0.35)] transition hover:brightness-110 active:scale-[0.98]"
                    >
                      <span>Complete Payment</span>
                      <span>&gt;</span>
                    </button>
                  ) : canEditApplication ? (
                    <button
                      type="button"
                      onClick={handleEditApplication}
                      className="ud-cta-gradient flex w-full cursor-pointer items-center justify-between rounded-xl bg-gradient-to-r from-purple-600 via-violet-500 to-orange-500 px-5 py-3 text-xs font-bold text-white transition hover:brightness-110 active:scale-[0.98]"
                    >
                      <span>Edit Application</span>
                      <span>&gt;</span>
                    </button>
                  ) : (
                    <div className="rounded-xl border border-orange-500/25 bg-orange-500/10 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-orange-500">
                      In Processing
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-orange-500">
                    FRESH LOGIN
                  </p>
                  <h4 className="mt-2 text-base font-bold text-slate-800">
                    No DSC submission yet
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Complete the form and bank/telecom verification to unlock
                    tracking status.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => selectView("notifications")}
                  className="ud-cta-gradient mt-4 flex w-full cursor-pointer items-center justify-between rounded-xl bg-gradient-to-r from-purple-600 via-violet-500 to-orange-500 px-5 py-3 text-xs font-bold text-white shadow-[0_6px_24px_rgba(124,58,237,0.35)] transition hover:brightness-110 active:scale-[0.98]"
                >
                  <span>Start New Application</span>
                  <span>&gt;</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            value: overviewStats.total,
            label: "TOTAL APPLICATIONS",
            sub: "All time applications",
            icon: <FileText size={18} />,
            iconWrap: "bg-purple-50 text-purple-600 border-purple-100/50",
            accent: "text-purple-500",
          },
          {
            value: overviewStats.approved,
            label: "APPROVED DSC",
            sub: "Successfully approved",
            icon: <CheckCircle2 size={18} />,
            iconWrap: "bg-green-50 text-green-600 border-green-100/50",
            accent: "text-emerald-500",
          },
          {
            value: overviewStats.pending,
            label: "PENDING",
            sub: "Awaiting review",
            icon: <Clock size={18} />,
            iconWrap: "bg-orange-50 text-orange-600 border-orange-100/50",
            accent: "text-orange-500",
          },
          {
            value: overviewStats.rejected,
            label: "REJECTED",
            sub: "Not approved",
            icon: <AlertCircle size={18} />,
            iconWrap: "bg-rose-50 text-rose-600 border-rose-100/50",
            accent: "text-rose-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="ud-stat-card ud-hover-surface relative flex min-h-[130px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${stat.iconWrap}`}
              >
                {stat.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="max-w-[10rem] truncate whitespace-nowrap text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-slate-500 sm:max-w-none sm:text-[10px]">
                    {stat.label}
                  </p>
                  <div className="shrink-0 text-slate-400">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1 text-[1.55rem] font-black leading-none text-slate-900 sm:text-[1.9rem]">
                  {padOverviewStat(stat.value)}
                </p>
                <p className="mt-1 text-[9px] leading-tight text-slate-400 sm:text-[10px]">
                  {stat.sub}
                </p>
              </div>
            </div>
            <div
              className={`mt-3 flex items-center gap-1 border-t border-slate-100 pt-2.5 text-[10px] font-semibold ${stat.accent}`}
            >
              <span>—</span>
              <span>0%</span>
              <span className="font-normal text-slate-500">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 3: Main split columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Column 1: Application Progress */}
        <div className="ud-panel-card ud-hover-surface flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Application Progress
              </h3>
              <button
                type="button"
                onClick={() => selectView("registration")}
                className="ud-hover-surface cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[10px] font-bold text-slate-600 transition hover:text-slate-900"
              >
                View All &gt;
              </button>
            </div>

            <div className="relative mt-6 grid grid-cols-5 gap-2">
              <div className="absolute top-5 left-6 right-6 z-0 hidden h-0 border-t border-dashed border-slate-200 md:block" />
              {[
                { id: 1, label: "Personal Details", icon: <FileText size={14} /> },
                { id: 2, label: "Document Upload", icon: <Upload size={14} /> },
                { id: 3, label: "Verification", icon: <ShieldCheck size={14} /> },
                { id: 4, label: "Review", icon: <Clock size={14} /> },
                { id: 5, label: "Complete", icon: <CheckCircle2 size={14} /> },
              ].map((step) => {
                const stepState = getApplicationStepState(step.id);
                const isCompleted = stepState === "completed";
                const isActive = stepState === "active";
                const isRejected = stepState === "rejected";
                return (
                  <div
                    key={step.id}
                    className="relative z-10 flex flex-col items-center text-center"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                        isCompleted
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.35)]"
                          : isActive
                            ? "border-purple-500 bg-purple-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]"
                            : isRejected
                              ? "border-red-500 bg-red-50 text-red-500"
                              : "border-slate-200 bg-slate-50 text-slate-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={16} strokeWidth={2.5} />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Step {step.id}
                    </p>
                    <p className="max-w-full truncate px-1 text-[10px] font-bold text-slate-700">
                      {step.label}
                    </p>
                    <p
                      className={`mt-0.5 text-[9px] font-medium ${
                        isCompleted
                          ? "text-emerald-600"
                          : isActive
                            ? "text-purple-600"
                            : isRejected
                              ? "text-red-500"
                              : "text-slate-400"
                      }`}
                    >
                      {isCompleted
                        ? "Completed"
                        : isActive
                          ? "In Progress"
                          : isRejected
                            ? "Rejected"
                            : "Not Started"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom start registration banner */}
          {!hasSubmittedApplication ? (
            <div className="ud-start-first-app ud-hover-surface mt-6 flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-purple-200/60 bg-purple-500/15 text-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  <span className="text-xl font-bold leading-none">+</span>
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-800">
                    Start your first application
                  </h4>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    Submit your details to begin your DSC application journey.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => selectView("registration")}
                className="ud-cta-gradient w-full shrink-0 cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 via-violet-500 to-violet-600 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition hover:brightness-110 active:scale-[0.98] sm:w-auto"
              >
                Start Application &gt;
              </button>
            </div>
          ) : (
            <div className="ud-start-first-app ud-hover-surface mt-6 flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 border border-green-200 text-green-600">
                  <CheckCircle2 size={18} />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-slate-800">
                    Application Active
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    We are processing your files. Check status changes here.
                  </p>
                </div>
              </div>
              {canEditApplication && (
                <button
                  type="button"
                  onClick={handleEditApplication}
                  className="ud-cta-gradient w-full shrink-0 cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 via-violet-500 to-violet-600 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition hover:brightness-110 active:scale-[0.98] sm:w-auto"
                >
                  Edit Form &gt;
                </button>
              )}
            </div>
          )}
        </div>

        {/* Column 2: Recent Activity */}
        <div className="ud-panel-card ud-hover-surface flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Recent Activity
              </h3>
              <button
                type="button"
                className="ud-hover-surface rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[10px] font-bold text-slate-600 transition hover:text-slate-900"
              >
                View All
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Welcome to DongleIQ",
                  desc: "Your account has been created successfully.",
                  time: "Just now",
                  color: "purple",
                  icon: <FileText size={14} />,
                },
                {
                  title: "Email Verified",
                  desc: "Your email address has been verified.",
                  time: "Just now",
                  color: "green",
                  icon: <CheckCircle2 size={14} />,
                },
                {
                  title: "Profile Created",
                  desc: "Your profile has been set up.",
                  time: "Just now",
                  color: "blue",
                  icon: <Users size={14} />,
                },
              ].map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                      act.color === "purple"
                        ? "bg-purple-50 text-purple-600 border-purple-100/50"
                        : act.color === "green"
                          ? "bg-green-50 text-green-600 border-green-100/50"
                          : "bg-blue-50 text-blue-600 border-blue-100/50"
                    }`}
                  >
                    {act.icon}
                  </div>
                  <div className="text-left min-w-0">
                    <h5 className="text-xs font-bold text-slate-800">
                      {act.title}
                    </h5>
                    <p className="text-[10px] text-slate-500 truncate">
                      {act.desc}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {act.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Quick Actions */}
        <div className="ud-panel-card ud-hover-surface flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Quick Actions
              </h3>
            </div>

            <div className="mt-4 flex flex-col">
              {[
                {
                  label: "New Application",
                  view: "registration",
                  locked: false,
                  icon: <FileText size={15} />,
                },
                {
                  label: "Upload Documents",
                  view: "documents",
                  locked: !hasSubmittedApplication,
                  icon: <Upload size={15} />,
                },
                {
                  label: "Track Application",
                  view: "admin-review",
                  locked: !hasSubmittedApplication,
                  icon: <Clock size={15} />,
                },
                {
                  label: "Download Invoice",
                  action: "invoice",
                  locked: !paymentIsSettled,
                  icon: <Download size={15} />,
                },
                {
                  label: "Help & Support",
                  action: "help",
                  locked: false,
                  icon: <Headset size={15} />,
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.locked) return;
                    if (item.view) selectView(item.view as UserDashboardView);
                    if (item.action === "invoice") setShowInvoiceModal(true);
                  }}
                  disabled={item.locked}
                  className={`ud-hover-surface flex items-center justify-between border-b border-slate-100 py-3 text-left text-xs font-semibold transition-all ${
                    item.locked
                      ? "cursor-not-allowed text-slate-300 opacity-35"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-500">
                      {item.icon}
                    </span>
                    {item.label}
                  </span>
                  <ChevronRight size={14} className="text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Application history */}
      {hasSubmittedApplication && (
        <div className="space-y-6 pt-6 border-t border-slate-100">
          {userData?.actionHistory && userData.actionHistory.length > 0 && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="mb-4 whitespace-nowrap text-[9px] font-black uppercase leading-none text-slate-400">
                Application History Log
              </p>
              <div className="relative border-l border-slate-100 ml-2.5 pl-4 space-y-4">
                {userData.actionHistory.map((item, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-white bg-orange-500" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-bold capitalize text-slate-800">
                        {item.action === "submitted"
                          ? "Application Submitted"
                          : `Status Changed: ${item.action}`}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                      Performed by:{" "}
                      <span className="text-slate-600">{item.performedBy}</span>
                    </p>
                    {item.remarks && (
                      <p className="mt-1 text-[11px] font-medium leading-relaxed italic text-slate-600 bg-slate-50 border border-slate-100/70 p-3 rounded-xl">
                        &ldquo;{item.remarks}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  ) : (
    <div
      className="ud-surface ud-surface-glass rounded-xl border p-6 text-center sm:p-8"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <p className="text-sm font-semibold" style={{ color: colors.muted }}>
        Sign in to load your profile overview. You can still start registration
        below.
      </p>
    </div>
  );

  const registrationPanel =
    hasSubmittedApplication && userData ? (
      <div
        className="shine-border theme-transition ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.12)] sm:p-8"
        style={{
          backgroundColor: shellBackground,
          borderColor: strongBorderColor,
        }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.24em]"
          style={{ color: colors.muted }}
        >
          Registration complete
        </p>
        <h3
          className="mt-2 text-lg font-black uppercase tracking-tight"
          style={{ color: colors.text }}
        >
          DSC application on file
        </h3>
        <p
          className="mt-2 text-sm font-semibold leading-relaxed"
          style={{ color: colors.muted }}
        >
          Submitted on {submittedOn}. Next step is payment, then backend
          verification, invoice generation, and admin processing.
        </p>
        {!paymentIsSettled ? (
          <button
            type="button"
            onClick={handleProceedToPayment}
            disabled={paymentLoading}
            className="theme-primary-btn theme-transition mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white disabled:opacity-60"
          >
            {paymentLoading ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <CreditCard size={14} />
            )}
            {paymentLoading ? "Starting Payment" : "Proceed To Payment"}
          </button>
        ) : canEditApplication ? (
          <button
            type="button"
            onClick={handleEditApplication}
            className="theme-transition mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-black uppercase tracking-[0.18em]"
            style={{
              borderColor: cardBorderColor,
              backgroundColor: cardBackground,
              color: colors.text,
            }}
          >
            <PencilLine size={14} />
            {applicationStatus === "rejected"
              ? "Resubmit Form"
              : "Edit Application"}
          </button>
        ) : null}
        {paymentMessage ? (
          <p
            className="mt-4 text-sm font-semibold"
            style={{ color: colors.muted }}
          >
            {paymentMessage}
          </p>
        ) : null}
      </div>
    ) : (
      <div className="ud-registration-scope">
        <ApplicationForm
          embedded
          initialValues={initialFormValues}
          submitLabel="Generate Application"
          mode="client"
          onSubmit={handleApplicationStart}
        />
      </div>
    );

  const paymentPanel =
    userData && hasSubmittedApplication ? (
      <div
        className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6 lg:p-8"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.24em]"
          style={{ color: colors.muted }}
        >
          Payment Gateway
        </p>
        <h3
          className="mt-2 text-xl font-black uppercase tracking-tight"
          style={{ color: colors.text }}
        >
          {paymentIsSettled ? "Payment Success" : "Proceed To Payment"}
        </h3>
        <p
          className="mt-2 text-sm font-semibold leading-relaxed"
          style={{ color: colors.muted }}
        >
          Submit application, open Razorpay checkout, verify payment on the
          backend, generate invoice, then move into admin processing.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatusMeta label="Application" value="Submitted" colors={colors} />
          <StatusMeta
            label="Payment"
            value={paymentSummary?.status || paymentStatus}
            colors={colors}
          />
          <StatusMeta
            label="Invoice"
            value={paymentSummary?.invoiceNumber || "Pending"}
            colors={colors}
          />
          <StatusMeta
            label="Admin"
            value={paymentIsSettled ? "Processing" : "Waiting for payment"}
            colors={colors}
          />
        </div>

        <div
          className="mt-5 rounded-xl border p-4"
          style={{
            borderColor: colors.borderSoft,
            backgroundColor: colors.panelStrong,
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-1">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{ color: colors.muted }}
                >
                  Payable Amount
                </p>
                <FeeTooltip pricing={pricingPreview} colors={colors} />
              </div>
              <p
                className="mt-2 text-3xl font-black"
                style={{ color: colors.accent }}
              >
                INR {payableAmount.toFixed(2)}
              </p>
              <p
                className="mt-2 text-xs font-semibold"
                style={{ color: colors.muted }}
              >
                Includes estimated GST of INR {estimatedGst.toFixed(2)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {!paymentIsSettled ? (
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={paymentLoading}
                  className="theme-primary-btn theme-transition inline-flex items-center gap-2 rounded-lg px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white disabled:opacity-60"
                >
                  {paymentLoading ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <CreditCard size={14} />
                  )}
                  {paymentLoading ? "Opening Razorpay" : "Open Razorpay Popup"}
                </button>
              ) : null}
              {paymentSummary?.invoiceUrl ? (
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(true)}
                  className="theme-transition inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-xs font-black uppercase tracking-[0.18em]"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.panel,
                    color: colors.text,
                  }}
                >
                  <FileText size={14} />
                  View Invoice
                </button>
              ) : null}
            </div>
          </div>
          {paymentError && !paymentIsSettled ? (
            <div
              className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-3"
              style={{
                borderColor: "rgba(239,68,68,0.35)",
                backgroundColor: "rgba(239,68,68,0.07)",
              }}
            >
              <p className="flex-1 text-xs font-semibold text-rose-500">
                {paymentError}
              </p>
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={paymentLoading}
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-60"
              >
                <CreditCard size={12} />
                Retry Payment
              </button>
            </div>
          ) : null}
          {paymentMessage && !paymentError ? (
            <p
              className="mt-4 text-sm font-semibold"
              style={{ color: colors.muted }}
            >
              {paymentMessage}
            </p>
          ) : null}
        </div>
      </div>
    ) : (
      postSubmitLocked
    );

  const adminReviewPanel =
    userData && hasSubmittedApplication ? (
      <div className="space-y-6">
        {rejectionReasonAlert}
        <div
          className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6"
          style={{
            borderColor: cardBorderColor,
            backgroundColor: cardBackground,
          }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-[0.24em]"
            style={{ color: colors.muted }}
          >
            Admin Review Details
          </p>
          <h3
            className="mt-2 text-xl font-black uppercase tracking-tight"
            style={{ color: statusTone.accent }}
          >
            {statusTone.title}
          </h3>
          <p
            className="mt-2 text-xs font-semibold leading-relaxed"
            style={{ color: colors.muted }}
          >
            {userData.internalRemarks
              ? userData.internalRemarks
              : applicationStatus === "approved"
                ? "Your documents and profile details have been accepted by admin."
                : applicationStatus === "rejected"
                  ? "Admin has requested corrections before moving forward."
                  : paymentIsSettled
                    ? "Payment is verified. Your application is now waiting for admin processing."
                    : "Complete payment to move this application into admin processing."}
          </p>
          <div className="ud-meta-grid mt-5">
            <StatusMeta
              label="Review Status"
              value={applicationStatus || "pending"}
              colors={colors}
            />
            <StatusMeta
              label="Last Update"
              value={reviewedOn}
              colors={colors}
            />
          </div>
        </div>
      </div>
    ) : (
      postSubmitLocked
    );

  const certificatePanel =
    userData && hasSubmittedApplication ? (
      <div
        className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: colors.panelStrong,
        }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.24em]"
          style={{ color: colors.muted }}
        >
          Submitted Application
        </p>
        <div className="ud-meta-grid mt-4">
          <StatusMeta
            label="Certificate"
            value={userData.certType || "Not selected"}
            colors={colors}
          />
          <StatusMeta
            label="Class"
            value={userData.certificateClass || "Not selected"}
            colors={colors}
          />
          <StatusMeta
            label="Validity"
            value={userData.validity || "Not selected"}
            colors={colors}
          />
          <StatusMeta
            label="Token"
            value={userData.tokenType || "Not selected"}
            colors={colors}
          />
          <StatusMeta
            label="Assisted"
            value={userData.assistedService || "Not selected"}
            colors={colors}
          />
          <StatusMeta
            label="PAN"
            value={userData.pan || "Not added"}
            colors={colors}
          />
          <StatusMeta
            label="Amount"
            value={
              typeof userData.price === "number"
                ? `INR ${userData.price}`
                : "Not available"
            }
            colors={colors}
          />
        </div>
      </div>
    ) : (
      postSubmitLocked
    );

  const personalDetailsPanel =
    userData && hasSubmittedApplication ? (
      <div
        className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6 lg:p-8"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.24em]"
          style={{ color: colors.muted }}
        >
          Your Details
        </p>
        <div className="ud-meta-grid mt-5 gap-3">
          <StatusMeta
            label="Full Name"
            value={userData.name || "Not added"}
            colors={colors}
          />
          <StatusMeta
            label="Email"
            value={userData.email || "Not added"}
            colors={colors}
          />
          <StatusMeta
            label="Mobile"
            value={userData.number || "Not added"}
            colors={colors}
          />
          <StatusMeta
            label="Gender"
            value={userData.gender || "Not added"}
            colors={colors}
          />
          <StatusMeta
            label="Date of Birth"
            value={userData.dob || "Not added"}
            colors={colors}
          />
          <StatusMeta
            label="eKYC ID"
            value={userData.ekycId || "Not added"}
            colors={colors}
          />
        </div>
        <div className="mt-4">
          <StatusMeta
            label="Address"
            value={
              [
                userData.address,
                userData.city,
                userData.state,
                userData.pincode,
              ]
                .filter(Boolean)
                .join(", ") || "Not added"
            }
            colors={colors}
          />
        </div>
      </div>
    ) : (
      postSubmitLocked
    );

  const documentsPanel =
    userData && hasSubmittedApplication ? (
      <div
        className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6 lg:p-8"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        <p
          className="text-[10px] font-black uppercase tracking-[0.24em]"
          style={{ color: colors.muted }}
        >
          Your Uploaded Documents
        </p>
        <div className="mt-4 grid gap-3">
          <DocumentMeta
            label="Applicant Photo"
            value={userData.photo}
            colors={colors}
            applicationStatus={applicationStatus}
            hasSubmittedApplication={hasSubmittedApplication}
          />
          <DocumentMeta
            label="Identity Proof"
            value={userData.idProof}
            colors={colors}
            applicationStatus={applicationStatus}
            hasSubmittedApplication={hasSubmittedApplication}
          />
          <DocumentMeta
            label="Address Proof"
            value={userData.addressProof}
            colors={colors}
            applicationStatus={applicationStatus}
            hasSubmittedApplication={hasSubmittedApplication}
          />
        </div>
      </div>
    ) : (
      postSubmitLocked
    );

  const cleanPanel = ({
    title,
    eyebrow,
    description,
    children,
  }: {
    title: string;
    eyebrow: string;
    description: string;
    children?: ReactNode;
  }) => (
    <section
      className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <nav
        aria-label="Section breadcrumb"
        className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em]"
        style={{ color: colors.muted }}
      >
        <button
          type="button"
          onClick={() => selectView("overview")}
          className="transition-colors hover:text-[var(--accent)]"
          style={{ color: colors.accent }}
          title="Back to Dashboard"
        >
          Dashboard
        </button>
        <ChevronRight className="h-3 w-3 flex-shrink-0" style={{ color: colors.muted }} />
        <span style={{ color: colors.text }}>{title}</span>
      </nav>
      <p
        className="mt-3 text-[10px] font-black uppercase tracking-[0.24em]"
        style={{ color: colors.muted }}
      >
        {eyebrow}
      </p>
      <h2
        className="mt-2 text-xl font-black tracking-tight"
        style={{ color: colors.text }}
      >
        {title}
      </h2>
      <p
        className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed"
        style={{ color: colors.muted }}
      >
        {description}
      </p>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );

  const applicationsPanel = cleanPanel({
    title: "My Applications",
    eyebrow: "Submitted DSC applications",
    description: "Your submitted DSC application, review status, and payment progress stay here.",
    children: userData ? (
      <div className="ud-meta-grid">
        <StatusMeta label="Application ID" value={userData._id?.slice(-6).toUpperCase() || "Not created"} colors={colors} />
        <StatusMeta label="Type" value={userData.certType || "Not selected"} colors={colors} />
        <StatusMeta label="Status" value={applicationStatus || "Not submitted"} colors={colors} />
        <StatusMeta label="Submitted" value={submittedOn} colors={colors} />
      </div>
    ) : null,
  });

  const myDscPanel = cleanPanel({
    title: "My DSC",
    eyebrow: "Issued certificates",
    description: "Issued certificate details will appear here after approval and issuance.",
    children: (
      <div className="ud-meta-grid">
        <StatusMeta label="Certificate" value={userData?.certType || "Not issued"} colors={colors} />
        <StatusMeta label="Validity" value={userData?.validity || "Not available"} colors={colors} />
        <StatusMeta label="Token" value={userData?.tokenType || "Not linked"} colors={colors} />
        <StatusMeta label="Status" value={applicationStatus === "issued" ? "Issued" : "Pending issue"} colors={colors} />
      </div>
    ),
  });

  const transactionsPanel = cleanPanel({
    title: "Transactions",
    eyebrow: "Payments history",
    description: "Payment status, invoice, and Razorpay transaction details.",
    children: (
      <div className="ud-meta-grid">
        <StatusMeta label="Payment Status" value={paymentSummary?.status || paymentStatus} colors={colors} />
        <StatusMeta label="Amount" value={`INR ${payableAmount.toFixed(2)}`} colors={colors} />
        <StatusMeta label="Invoice" value={paymentSummary?.invoiceNumber || "Pending"} colors={colors} />
        <StatusMeta label="Razorpay ID" value={paymentSummary?.razorpayPaymentId || "Not available"} colors={colors} />
      </div>
    ),
  });

  const notificationsPanel = (
    <div className="space-y-4">
      <nav
        aria-label="Notifications breadcrumb"
        className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em]"
        style={{ color: colors.muted }}
      >
        <button
          type="button"
          onClick={() => selectView("overview")}
          className="transition-colors hover:text-[var(--accent)]"
          style={{ color: colors.accent }}
          title="Back to Dashboard"
        >
          Dashboard
        </button>
        <ChevronRight className="h-3 w-3 flex-shrink-0" style={{ color: colors.muted }} />
        <span style={{ color: colors.text }}>Notifications</span>
      </nav>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: colors.muted }}>Account Updates</p>
          <h2 className="text-lg font-black" style={{ color: colors.text }}>Notifications</h2>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all hover:opacity-80"
            style={{ borderColor: colors.inputBorder, backgroundColor: colors.panelStrong, color: colors.accent }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.card }}
      >
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.panelStrong }}
            >
              <Bell size={24} style={{ color: colors.muted }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: colors.muted }}>No notifications yet</p>
            <p className="text-xs" style={{ color: colors.muted }}>You&apos;ll see application & payment updates here.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: colors.border }}>
            {notifications.map((item) => (
              <div
                key={item._id}
                onClick={() => { if (!item.isRead) void markNotificationRead(item._id); }}
                className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors hover:opacity-90"
                style={{
                  backgroundColor: item.isRead
                    ? "transparent"
                    : isRejectionNotification(item)
                      ? (isDarkMode ? "rgba(244,63,94,0.09)" : "rgba(244,63,94,0.05)")
                      : isDarkMode ? "rgba(249,115,22,0.07)" : "rgba(249,115,22,0.04)",
                  borderLeft: isRejectionNotification(item)
                    ? "3px solid rgba(244,63,94,0.8)"
                    : "3px solid transparent",
                }}
              >
                {/* Unread dot */}
                <div className="mt-1.5 shrink-0">
                  {item.isRead ? (
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: isRejectionNotification(item)
                          ? "#fb7185"
                          : colors.borderSoft,
                      }}
                    />
                  ) : (
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: isRejectionNotification(item)
                          ? "#fb7185"
                          : "#f97316",
                      }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-xs leading-snug ${item.isRead ? "font-semibold" : "font-bold"}`}
                      style={{
                        color: isRejectionNotification(item)
                          ? (isDarkMode ? "#fb7185" : "#e11d48")
                          : colors.text,
                      }}
                    >
                      {item.title}
                    </p>
                    {isRejectionNotification(item) && (
                      <span className="shrink-0 rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-500">
                        Rejected
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug" style={{ color: colors.muted }}>
                    {item.message}
                  </p>
                  {item.createdAt && (
                    <p className="mt-1 text-[10px]" style={{ color: colors.muted }}>
                      {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
                {!item.isRead && (
                  <span className="mt-1 shrink-0 rounded-full bg-orange-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-orange-500">
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const supportPanel = cleanPanel({
    title: "Support Tickets",
    eyebrow: "Customer support",
    description: "Support ticket creation is not connected yet. Use live chat for help right now.",
  });

  const irctcPanel = cleanPanel({
    title: "IRCTC Agents",
    eyebrow: "IRCTC registrations",
    description: "IRCTC agent registrations are not connected for this account yet.",
  });

  const profileSettingsPanel = cleanPanel({
    title: "Profile & Settings",
    eyebrow: "Account settings",
    description: "Your core account details.",
    children: (
      <div className="ud-meta-grid">
        <StatusMeta label="Name" value={userData?.name || "Not added"} colors={colors} />
        <StatusMeta label="Email" value={userData?.email || "Not added"} colors={colors} />
        <StatusMeta label="Mobile" value={userData?.number || "Not added"} colors={colors} />
        <StatusMeta label="Aadhaar" value={userData?.isAadhaarVerified ? "Verified" : "Not verified"} colors={colors} />
      </div>
    ),
  });

  const upgradeProPanel = cleanPanel({
    title: "Upgrade to Pro",
    eyebrow: "Premium plan",
    description: "Premium features are not active yet for this account.",
  });

  let mainSections: ReactNode = null;
  
  if (error && !userData) {
    mainSections = (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-rose-50 dark:bg-rose-500/10 p-4 rounded-full mb-4">
          <AlertCircle size={32} className="text-rose-500" />
        </div>
        <h3 className="text-lg font-black uppercase tracking-tight mb-2">Connection Issue</h3>
        <p className="text-sm font-semibold text-slate-500 max-w-xs mb-6">{error}</p>
        <button 
          onClick={() => { setLoading(true); void fetchUserData(); }}
          className="theme-primary-btn px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider text-white"
        >
          Retry Connection
        </button>
      </div>
    );
  } else 

  if (!loading) {
    switch (view) {
      case "overview":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {overviewPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "applications":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {applicationsPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "my-dsc":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {myDscPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "irctc-agents":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {irctcPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "transactions":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {transactionsPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "notifications":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {notificationsPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "support-tickets":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {supportPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "profile-settings":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {profileSettingsPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "upgrade-pro":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {upgradeProPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "registration":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {registrationPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "payment":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {paymentPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "admin-review":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {adminReviewPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "certificate-summary":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {certificatePanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "personal-details":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {personalDetailsPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      case "documents":
        mainSections = (
          <ErrorBoundary>
            <div key={view} className="ud-enter space-y-6 sm:space-y-8">
              {documentsPanel}
            </div>
          </ErrorBoundary>
        );
        break;
      default:
        mainSections = null;
    }
  }

  return (
    <div
      className="theme-transition ud-dashboard-root ud-shell overflow-hidden relative text-[13px]"
      style={{ color: colors.text }}
    >
      {/* Offline Indicator Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-rose-600 px-4 py-2 text-center text-xs font-black uppercase tracking-wider text-white shadow-md animate-bounce">
          <span>⚠️</span>
          <span>You are currently offline. Check your connection.</span>
        </div>
      )}

      {/* Form Submission Loading Backdrop */}
      {formSubmitting && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <LoaderCircle
              size={36}
              className="animate-spin"
              style={{ color: colors.accent }}
            />
            <p
              className="text-xs font-black uppercase tracking-wider"
              style={{ color: colors.text }}
            >
              Generating Application...
            </p>
          </div>
        </div>
      )}

      {/* Fixed Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 lg:hidden"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.borderSoft,
          color: colors.accent,
          boxShadow: `0 8px 20px -12px ${colors.accentShadow}`,
        }}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle theme"
      >
        {isDarkMode ? <SunMedium size={20} /> : <Moon size={20} />}
      </button>
      {!loading ? (
        <>
          <UserSidebar
            view={view}
            userData={userData}
            hasSubmittedApplication={hasSubmittedApplication}
            isSidebarOpen={isSidebarOpen}
            isCollapsed={isCollapsed}
            onViewChange={selectView}
            onLogout={handleLogout}
            onToggleTheme={toggleTheme}
            isDarkMode={isDarkMode}
            unreadCount={unreadCount}
          />
          {isSidebarOpen ? (
            <div
              className="ud-backdrop lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden
            />
          ) : null}
        </>
      ) : null}

      <div
        className="ud-main ud-dashboard-theme relative"
        style={{ backgroundColor: "var(--background)" }}
      >
        {!loading ? (
          <>
            <header
              className="ud-mobile-bar flex items-center justify-between"
              style={{
                borderColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#f1f5f9",
                backgroundColor: isDarkMode ? "rgba(11,15,23,0.94)" : "#ffffff",
              }}
            >
              <button
                type="button"
                onClick={handleSidebarToggle}
                className="theme-transition ud-menu-btn"
                style={{
                  borderColor: isDarkMode
                    ? "rgba(255,255,255,0.08)"
                    : "#e2e8f0",
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.04)"
                    : "#f8fafc",
                  color: colors.text,
                }}
                aria-label="Open navigation menu"
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0 flex-1 px-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  User dashboard
                </p>
                <p className="truncate text-xs font-black text-slate-800">
                  {USER_VIEW_LABELS[view]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 cursor-pointer"
                  onClick={() => selectView("notifications")}
                >
                  <Bell size={14} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="ud-header-avatar flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-[0_0_12px_rgba(124,58,237,0.35)]">
                  {userData?.name
                    ? userData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "JV"}
                </div>
              </div>
            </header>

            <header
              className="ud-desktop-bar sticky top-0 z-50 h-[60px] items-center justify-between px-6 shadow-sm backdrop-blur-md"
              style={{
                background: isDarkMode
                  ? "rgba(15,23,42,0.75)"
                  : "rgba(255,255,255,0.75)",
                backdropFilter: "blur(20px)",
                borderBottom: isDarkMode
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid #e2e8f0",
              }}
            >
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleSidebarToggle}
                  className="theme-transition ud-menu-btn"
                  style={{
                    borderColor: isDarkMode
                      ? "rgba(255,255,255,0.08)"
                      : "#e2e8f0",
                    backgroundColor: isDarkMode
                      ? "rgba(255,255,255,0.04)"
                      : "#f8fafc",
                    color: colors.text,
                  }}
                  aria-expanded={!isCollapsed}
                  aria-label={
                    isCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                >
                  <Menu size={18} />
                </button>

                {/* Search Bar */}
                <form
                  onSubmit={handleDashboardSearchSubmit}
                  className="hidden w-80 max-w-full items-center gap-2 rounded-lg  bg-slate-50 px-3 py-1.5 text-xs text-slate-500 sm:flex"
                >
                  <Search size={14} className="mr-2 shrink-0 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search dashboard..."
                    value={dashboardSearch}
                    onChange={(event) => setDashboardSearch(event.target.value)}
                    className="w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                  />
                  {/* <span className="rounded bg-slate-200/50 border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shrink-0 ml-1">
                    ⌘K
                  </span> */}
                </form>
              </div>

              {/* Right widgets */}
              <div className="flex items-center gap-4">
                {/* Notification bell */}
                <div
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 cursor-pointer"
                  onClick={() => selectView("notifications")}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {/* Sun/Moon Toggle — active state stays violet in both themes */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="ud-header-theme-toggle flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 p-1"
                  title="Toggle theme"
                >
                  <div
                    className={`ud-header-theme-toggle__icon rounded-full p-1.5 ${!isDarkMode ? "is-active" : ""}`}
                  >
                    <SunMedium size={14} />
                  </div>
                  <div
                    className={`ud-header-theme-toggle__icon rounded-full p-1.5 ${isDarkMode ? "is-active" : ""}`}
                  >
                    <Moon size={14} />
                  </div>
                </button>

                {/* User profile dropdown */}
                <div
                  ref={userDropdownRef}
                  className="relative border-l border-slate-200 pl-4 dark:border-white/10"
                >
                  <button
                    ref={userDropdownButtonRef}
                    type="button"
                    onClick={() => {
                      updateUserDropdownPosition();
                      setIsUserDropdownOpen((current) => !current);
                    }}
                    className="ud-header-user flex items-center gap-3 rounded-full px-1.5 py-1 transition-all hover:bg-slate-100/80 active:scale-[0.98] dark:hover:bg-white/5"
                    aria-haspopup="menu"
                    aria-expanded={isUserDropdownOpen}
                    aria-label="Open user menu"
                  >
                    <div className="ud-header-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-[0_0_14px_rgba(124,58,237,0.35)]">
                      {userInitials}
                    </div>
                    <div className="hidden text-left xl:block">
                      <p className="ud-header-user-name text-xs font-bold leading-tight text-slate-800">
                        {userData?.name || "User"}
                      </p>
                      <span className="ud-header-user-meta mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">
                        <CheckCircle2 size={10} className="text-violet-500" />
                        Verified User
                      </span>
                    </div>
                    <ChevronDown
                      size={15}
                      className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                        isUserDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isUserDropdownOpen ? (
                    <div
                      role="menu"
                      className="fixed z-[9999] w-64 overflow-hidden rounded-2xl border py-2 shadow-2xl"
                      style={{
                        top: userDropdownPosition.top,
                        right: userDropdownPosition.right,
                        borderColor: isDarkMode
                          ? "rgba(255,255,255,0.08)"
                          : "#e2e8f0",
                        backgroundColor: isDarkMode
                          ? "rgba(11,15,23,0.98)"
                          : "#ffffff",
                        boxShadow: isDarkMode
                          ? "0 24px 60px -24px rgba(0,0,0,0.85)"
                          : "0 24px 60px -24px rgba(15,23,42,0.25)",
                      }}
                    >
                      <div className="border-b px-4 pb-3 pt-2 dark:border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="ud-header-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                            {userInitials}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="truncate text-sm font-bold"
                              style={{ color: colors.text }}
                            >
                              {userData?.name || "User"}
                            </p>
                            <p
                              className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-xs"
                              style={{ color: colors.muted }}
                            >
                              <Mail size={12} className="shrink-0" />
                              <span className="truncate">
                                {userData?.email || "No email added"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          selectView("profile-settings");
                          setIsUserDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-violet-500/10"
                        style={{ color: colors.text }}
                      >
                        <User size={15} className="text-violet-500" />
                        Profile
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          selectView("profile-settings");
                          setIsUserDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-violet-500/10"
                        style={{ color: colors.text }}
                      >
                        <Settings size={15} className="text-violet-500" />
                        Settings
                      </button>
                      <div
                        className="my-1 border-t"
                        style={{
                          borderColor: isDarkMode
                            ? "rgba(255,255,255,0.08)"
                            : "#e2e8f0",
                        }}
                      />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          void handleLogout();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-bold text-rose-500 transition-colors hover:bg-rose-500/10"
                      >
                        <LogOut size={15} />
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </header>
          </>
        ) : null}

        <main className="ud-main-scroll relative z-10">
          <div className="ud-page-inner">
            {loading ? <UserDashboardSkeleton colors={colors} /> : mainSections}
          </div>
        </main>
      </div>

      {/* Keyboard shortcuts help modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        shortcuts={[
          { keys: ["g", "o"], description: "Go to Overview" },
          { keys: ["g", "r"], description: "Go to Start Registration" },
          { keys: ["g", "p"], description: "Go to Payment Gateway" },
          { keys: ["g", "a"], description: "Go to Admin Review" },
          { keys: ["g", "c"], description: "Go to Certificate Summary" },
          { keys: ["g", "d"], description: "Go to Documents" },
          { keys: ["Ctrl", "?"], description: "Show keyboard shortcuts" },
          { keys: ["Esc"], description: "Close this panel / cancel chord" },
        ]}
      />

      {/* Task 3.1 — Invoice Preview Modal */}
      {showInvoiceModal && paymentSummary ? (
        <InvoicePreviewModal
          payment={paymentSummary}
          colors={colors}
          isDarkMode={isDarkMode}
          onClose={() => setShowInvoiceModal(false)}
          unreadCount={unreadCount}
        />
      ) : null}
    </div>
  );
}

function StatusMeta({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof getThemePalette>;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{
        borderColor: colors.inputBorder,
        backgroundColor: colors.panelStrong,
      }}
    >
      <p
        className="text-[9px] font-black uppercase tracking-[0.18em]"
        style={{ color: colors.muted }}
      >
        {label}
      </p>
      <p
        className="mt-1 break-all text-xs font-semibold"
        style={{ color: colors.text }}
      >
        {value}
      </p>
    </div>
  );
}

function DocumentMeta({
  label,
  value,
  colors,
  applicationStatus,
  hasSubmittedApplication,
}: {
  label: string;
  value?: string;
  colors: ReturnType<typeof getThemePalette>;
  applicationStatus: string | null;
  hasSubmittedApplication: boolean;
}) {
  let badgeText = "";
  let badgeClass = "";

  if (value) {
    if (applicationStatus === "approved" || applicationStatus === "issued") {
      badgeText = "Approved / Uploaded";
      badgeClass =
        "bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/20";
    } else if (applicationStatus === "rejected") {
      badgeText = "Uploaded (Pending Re-review)";
      badgeClass =
        "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20";
    } else {
      badgeText = "Uploaded (Pending Review)";
      badgeClass =
        "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  } else {
    if (hasSubmittedApplication) {
      badgeText = "Missing / Required";
      badgeClass =
        "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20";
    } else {
      badgeText = "Required on Submission";
      badgeClass =
        "bg-gray-500/10 dark:bg-gray-500/20 text-gray-500 dark:text-gray-450 border-gray-550/20";
    }
  }

  return (
    <div
      className="rounded-lg border px-3 py-3"
      style={{
        borderColor: colors.inputBorder,
        backgroundColor: colors.panelStrong,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className="text-[9px] font-black uppercase tracking-[0.18em]"
          style={{ color: colors.muted }}
        >
          {label}
        </p>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${badgeClass}`}
        >
          {badgeText}
        </span>
      </div>
      {value ? (
        <div className="ud-doc-actions mt-2 flex flex-wrap gap-2">
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{
              color: colors.accent,
              borderColor: colors.inputBorder,
              backgroundColor: colors.card,
            }}
          >
            View Document
          </a>
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{
              color: colors.text,
              borderColor: colors.inputBorder,
              backgroundColor: colors.panel,
            }}
          >
            Open Uploaded File
          </a>
        </div>
      ) : (
        <p
          className="mt-1 text-xs font-semibold"
          style={{ color: colors.text }}
        >
          Not uploaded yet
        </p>
      )}
    </div>
  );
}

function UserDashboardSkeleton({
  colors,
}: {
  colors: ReturnType<typeof getThemePalette>;
}) {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div
        className="h-44 rounded-xl border p-6 flex flex-col justify-between"
        style={{ borderColor: colors.borderSoft, backgroundColor: colors.card }}
      >
        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-[var(--skeleton)]" />
          <div className="h-6 w-56 rounded bg-[var(--skeleton)]" />
        </div>
        <div className="h-8 w-40 rounded-lg bg-[var(--skeleton)]" />
      </div>

      {/* Grid for Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border p-4 flex flex-col justify-between"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.card,
            }}
          >
            <div className="h-3 w-16 rounded bg-[var(--skeleton)]" />
            <div className="h-5 w-24 rounded bg-[var(--skeleton)]" />
            <div className="h-3 w-20 rounded bg-[var(--skeleton)]" />
          </div>
        ))}
      </div>

      {/* Timeline Skeleton */}
      <div
        className="rounded-xl border p-6 space-y-4"
        style={{ borderColor: colors.borderSoft, backgroundColor: colors.card }}
      >
        <div className="h-3 w-24 rounded bg-[var(--skeleton)]" />
        <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-1 flex md:flex-col items-start gap-4 md:gap-3"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--skeleton)]" />
              <div className="flex-1 space-y-2 w-full">
                <div className="h-3 w-24 rounded bg-[var(--skeleton)]" />
                <div className="h-2.5 w-32 rounded bg-[var(--skeleton)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Task 3.1 – Invoice Preview Modal ────────────────────────────────────────
function InvoicePreviewModal({
  payment,
  colors,
  isDarkMode,
  onClose,
  unreadCount,
}: {
  payment: PaymentSummary;
  colors: ReturnType<typeof getThemePalette>;
  isDarkMode: boolean;
  onClose: () => void;
  unreadCount: number;
}) {
  void isDarkMode; // consumed by parent; kept for prop parity
  void unreadCount;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          color: colors.text,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: colors.borderSoft }}
        >
          <div>
            <p
              className="text-[9px] font-black uppercase tracking-[0.24em]"
              style={{ color: colors.muted }}
            >
              Invoice Preview
            </p>
            <h3 className="mt-0.5 text-base font-black uppercase tracking-tight">
              Tax Invoice
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105 active:scale-95"
            style={{
              borderColor: colors.borderSoft,
              backgroundColor: colors.panelStrong,
              color: colors.muted,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-2 p-6">
          {[
            { label: "Invoice #", value: payment.invoiceNumber || "—" },
            {
              label: "Date",
              value: payment.invoiceDate
                ? new Date(payment.invoiceDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—",
            },
            {
              label: "Payment ID",
              value: payment.razorpayPaymentId || payment._id || "—",
            },
            {
              label: "Amount Paid",
              value: payment.amount ? `INR ${payment.amount.toFixed(2)}` : "—",
            },
            { label: "Status", value: payment.status || "—" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: colors.panelStrong,
              }}
            >
              <span
                className="text-[10px] font-black uppercase tracking-wider"
                style={{ color: colors.muted }}
              >
                {label}
              </span>
              <span className="max-w-[55%] truncate text-right text-xs font-bold">
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 border-t px-6 pb-6 pt-4"
          style={{ borderColor: colors.borderSoft }}
        >
          {payment.invoiceUrl && (
            <a
              href={`${payment.invoiceUrl}?download=1`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-xs font-black uppercase tracking-wider text-white transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: colors.accent }}
            >
              <Download size={13} />
              Download PDF
            </a>
          )}
          <button
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-xs font-black uppercase tracking-wider transition-all hover:-translate-y-0.5"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.panelStrong,
              color: colors.text,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Task 3.7 – Fee Breakdown Tooltip ────────────────────────────────────────
function FeeTooltip({
  pricing,
  colors,
}: {
  pricing: {
    certificate: number;
    token: number;
    assisted: number;
    total: number;
  };
  colors: ReturnType<typeof getThemePalette>;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border transition-all hover:scale-110"
        style={{
          borderColor: colors.borderSoft,
          color: colors.muted,
          backgroundColor: colors.panelStrong,
        }}
        aria-label="View fee breakdown"
      >
        <Info size={11} />
      </button>
      {visible && (
        <div
          className="absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-xl border p-3 shadow-2xl"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <p
            className="mb-2 text-[9px] font-black uppercase tracking-wider"
            style={{ color: colors.muted }}
          >
            Fee Breakdown
          </p>
          <div className="space-y-1.5">
            {[
              { label: "Certificate", amount: pricing.certificate },
              { label: "USB Token", amount: pricing.token },
              { label: "Assisted Service", amount: pricing.assisted },
            ].map(({ label, amount }) => (
              <div
                key={label}
                className="flex items-center justify-between text-[11px]"
              >
                <span style={{ color: colors.muted }}>{label}</span>
                <span className="font-bold">INR {amount}</span>
              </div>
            ))}
            <div
              className="flex items-center justify-between border-t pt-1.5 text-xs font-black"
              style={{ borderColor: colors.borderSoft }}
            >
              <span>Total</span>
              <span style={{ color: colors.accent }}>INR {pricing.total}</span>
            </div>
          </div>
          {/* Caret */}
          <div
            className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent"
            style={{ borderTopColor: colors.border }}
          />
        </div>
      )}
    </span>
  );
}
