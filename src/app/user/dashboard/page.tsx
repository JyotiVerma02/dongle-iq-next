"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  FileText,
  Info,
  LoaderCircle,
  Menu,
  PencilLine,
  ShieldCheck,
  Sparkles,
  Moon,
  SunMedium,
  RefreshCw,
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
import { useUserKeyboardShortcuts } from "./hooks/useUserKeyboardShortcuts";
import { ShortcutsModal } from "@/app/admin/dashboard/components/common/ShortcutsModal";

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
  overview: "Overview",
  registration: "Start registration",
  payment: "Payment",
  "admin-review": "Admin review",
  "certificate-summary": "Certificate",
  "personal-details": "Your details",
  documents: "Documents",
};

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

export default function DSCRegistrationForm() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <UserDashboardPage />
    </Suspense>
  );
}

function UserDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const premiumGradient =
    "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))";
  const shellBackground = isDarkMode ? colors.panelStrong : colors.card;
  const cardBackground = isDarkMode ? colors.card : colors.panelStrong;
  const strongBorderColor = isDarkMode ? colors.inputBorder : colors.border;
  const cardBorderColor = isDarkMode ? colors.border : colors.borderSoft;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [view, setView] = useState<UserDashboardView>("overview");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(
    null,
  );
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySMS, setNotifySMS] = useState(false);

  const hasSubmittedApplication = hasCompletedApplication(userData);
  const applicationStatus = hasSubmittedApplication
    ? userData?.status || "pending"
    : null;
  const paymentStatus = userData?.paymentStatus || "pending";
  const paymentIsSettled =
    paymentStatus === "paid" ||
    paymentSummary?.status === "verified" ||
    paymentSummary?.status === "completed";
  const paymentStageLabel = paymentIsSettled
    ? "Payment complete"
    : hasSubmittedApplication
      ? "Payment pending"
      : "Awaiting application";
  const statusTone = useMemo(() => {
    return applicationStatus === "approved"
      ? {
          badge: "border border-emerald-300/70 bg-emerald-50 text-emerald-700",
          accent: "#059669",
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
  /* eslint-enable react-hooks/set-state-in-effect */

  const fetchUserData = useCallback(async (signal?: AbortSignal) => {
    try {
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
              toast.success(`🎉 ${msg}! Your application is approved.`, { duration: 5000 });
            } else if (newStatus === "rejected") {
              toast.error(`⚠️ ${msg}. Correction requested.`, { duration: 6000 });
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
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name !== "AbortError") {
        console.error("Failed to fetch user data:", err);
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
    if (typeof window === "undefined" || !hasSubmittedApplication || !userData?._id) return;

    const eventSource = new EventSource("/api/realtime");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "STATUS_UPDATE" && data.userId === userData._id) {
          toast.success("Your application status has been updated in real-time!", {
            icon: "🔔",
            duration: 4000
          });
          void fetchUserData();
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
  }, [hasSubmittedApplication, userData?._id, fetchUserData]);

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
            setUserData((prev) => (prev ? { ...prev, remarksViewed: true } : null));
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

  const handleExportJSON = () => {
    if (!userData) return;
    const exportData = {
      exportedAt: new Date().toISOString(),
      applicant: {
        name: userData.name,
        email: userData.email,
        mobile: userData.number,
        pan: userData.pan,
        gender: userData.gender,
        dob: userData.dob,
        ekycId: userData.ekycId,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        pincode: userData.pincode,
      },
      certificate: {
        class: userData.certificateClass,
        type: userData.certType,
        validity: userData.validity,
        tokenType: userData.tokenType,
        assistedService: userData.assistedService,
      },
      payment: {
        status: userData.paymentStatus,
        amount: userData.price,
        invoiceNumber: paymentSummary?.invoiceNumber,
        invoiceDate: paymentSummary?.invoiceDate,
        razorpayPaymentId: paymentSummary?.razorpayPaymentId,
      },
      applicationStatus: userData.status,
      submittedAt: userData.createdAt,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dongle-iq-${userData.name?.replace(/\s+/g, "-") || "application"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggleEmail = () => {
    setNotifyEmail((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") localStorage.setItem("pref_notify_email", String(next));
      return next;
    });
  };

  const handleToggleSMS = () => {
    setNotifySMS((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") localStorage.setItem("pref_notify_sms", String(next));
      return next;
    });
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
      const msg = error instanceof Error ? error.message : "Unable to proceed to payment.";
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

  const rejectionReasonAlert = (userData && applicationStatus === "rejected") ? (
    <div
      className="mb-6 rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 shadow-[0_12px_36px_rgba(225,29,72,0.12)]"
      style={{
        borderColor: "rgba(225, 29, 72, 0.3)",
        backgroundColor: isDarkMode ? "rgba(225, 29, 72, 0.1)" : "rgba(225, 29, 72, 0.05)",
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
          <p className="mt-1 text-sm font-semibold" style={{ color: colors.text }}>
            {userData.internalRemarks || "Please make necessary corrections to your submitted details."}
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

  const overviewPanel = userData ? (
    <div className="space-y-6">
      {rejectionReasonAlert}
      <div
        className="shine-border theme-transition ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 shadow-[0_24px_80px_rgba(0,0,0,0.16)] sm:p-6 lg:p-8"
        style={{
          backgroundColor: shellBackground,
          borderColor: strongBorderColor,
        }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="mb-4 inline-flex rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em]"
                style={{
                  borderColor: cardBorderColor,
                  backgroundColor: cardBackground,
                  color: colors.accentLight,
                }}
              >
                Review Center
              </div>
              <button
                onClick={() => {
                  setIsRefreshing(true);
                  void fetchUserData();
                }}
                disabled={isRefreshing}
                className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.borderSoft,
                  color: colors.accent,
                }}
                title="Refresh status"
              >
                <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
              </button>
            </div>
            <h2
            className="text-xl font-black uppercase tracking-tight sm:text-2xl"
            style={{ color: colors.text }}
          >
            Hello, {userData.name || userData.email.split("@")[0]}!
          </h2>
          <p className="mt-1 text-sm" style={{ color: colors.muted }}>
            {userData.email}
          </p>
          <p
            className="mt-3 max-w-xl text-sm font-semibold leading-relaxed"
            style={{ color: colors.muted }}
          >
            {hasSubmittedApplication
              ? paymentIsSettled
                ? "Payment is complete and your application is now in admin processing."
                : "Your application is saved. Complete the payment step to trigger verification and invoice generation."
              : "Welcome. Start a DSC application below and complete the verification flow to see your live status here."}
          </p>
        </div>
        {hasSubmittedApplication ? (
          <div className="flex flex-col items-start gap-2 md:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-sm font-medium"
                style={{ color: colors.muted }}
              >
                Status:
              </span>
              <span
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase ${statusTone.badge}`}
              >
                {applicationStatus}
              </span>
            </div>
            <p
              className="text-xs font-semibold"
              style={{ color: colors.muted }}
            >
              Submitted: {submittedOn}
            </p>
            <p
              className="text-xs font-semibold"
              style={{ color: colors.muted }}
            >
              Payment: {paymentStageLabel}
            </p>
            {canEditApplication ? (
              <button
                onClick={handleEditApplication}
                className="theme-transition inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-center text-xs font-black uppercase tracking-[0.18em] sm:w-auto"
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
            {!paymentIsSettled ? (
              <button
                onClick={handleProceedToPayment}
                disabled={paymentLoading || loading || !userData?._id}
                className="theme-primary-btn theme-transition inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-center text-xs font-black uppercase tracking-[0.18em] text-white disabled:opacity-60 sm:w-auto"
              >
                {paymentLoading ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <CreditCard size={14} />
                )}
                {paymentLoading ? "Starting Payment" : "Proceed To Payment"}
              </button>
            ) : null}
          </div>
        ) : (
          <div
            className="rounded-lg border px-4 py-3"
            style={{
              borderColor: cardBorderColor,
              backgroundColor: cardBackground,
            }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-[0.24em]"
              style={{ color: colors.muted }}
            >
              Fresh Login
            </p>
            <p
              className="mt-1 text-base font-black"
              style={{ color: colors.text }}
            >
              No DSC submission yet
            </p>
            <p
              className="mt-1 text-[11px] font-semibold"
              style={{ color: colors.muted }}
            >
              Complete the form and bank/telecom verification to unlock tracking
              status.
            </p>
          </div>
        )}
      </div>
      <div className="ud-stat-grid mt-5">
        {[
          {
            icon: <ShieldCheck size={18} />,
            value: userData.isVerified ? "Verified" : "Pending",
            label: "Email Status",
          },
          {
            icon: <CreditCard size={18} />,
            value: paymentIsSettled
              ? "Verified"
              : hasSubmittedApplication
                ? "Pending"
                : "Locked",
            label: "Payment",
          },
          {
            icon: <Sparkles size={18} />,
            value: hasSubmittedApplication
              ? paymentIsSettled
                ? applicationStatus || "pending"
                : "Awaiting payment"
              : "Not Submitted",
            label: hasSubmittedApplication
              ? "Admin Processing"
              : "Application State",
          },
        ].map((item, index) => (
          <div
            key={item.label}
            className={`ud-surface ud-surface--lift rounded-xl border p-4 ${index === 1 ? "float-delay" : "float-slow"}`}
            style={{
              borderColor: cardBorderColor,
              backgroundColor: cardBackground,
            }}
          >
            <div
              className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg text-white"
              style={{ background: premiumGradient }}
            >
              {item.icon}
            </div>
            <p className="text-lg font-black uppercase">{item.value}</p>
            <p
              className="mt-1 text-[10px] font-black uppercase tracking-[0.22em]"
              style={{ color: colors.muted }}
            >
              {item.label}
            </p>
          </div>
        ))}
      </div>
      {hasSubmittedApplication ? (
        <div
          className="mt-6 rounded-xl border p-4 sm:p-5"
          style={{
            borderColor: cardBorderColor,
            backgroundColor: cardBackground,
          }}
        >
          <div className="flex items-center justify-between">
            <p
              className="text-[10px] font-black uppercase tracking-[0.24em]"
              style={{ color: colors.muted }}
            >
              Journey Status
            </p>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white"
              style={{ backgroundColor: colors.accent }}
            >
              Step {
                applicationStatus === "issued"
                  ? 4
                  : applicationStatus === "approved"
                  ? 4
                  : paymentIsSettled
                  ? 3
                  : 2
              } of 4
            </span>
          </div>
          <div className="mt-6 flex flex-col md:flex-row justify-between gap-6 md:gap-4 relative">
            {[
              {
                id: 1,
                label: "Application Submitted",
                status: "completed",
                description: "Your registration form is successfully recorded.",
              },
              {
                id: 2,
                label: "Payment Verified",
                status: paymentIsSettled ? "completed" : "active",
                description: paymentIsSettled
                  ? "Order payment processed and verified."
                  : "Awaiting payment verification.",
              },
              {
                id: 3,
                label: "Admin Review & Processing",
                status: !paymentIsSettled
                  ? "pending"
                  : applicationStatus === "approved" || applicationStatus === "issued"
                    ? "completed"
                    : applicationStatus === "rejected"
                      ? "rejected"
                      : "active",
                description: !paymentIsSettled
                  ? "Awaiting payment completion to start review."
                  : applicationStatus === "approved" || applicationStatus === "issued"
                    ? "Review complete. Details approved."
                    : applicationStatus === "rejected"
                      ? "Changes required. Admin requested correction."
                      : "Admin is reviewing your application details.",
              },
              {
                id: 4,
                label: "Certificate Issued",
                status: applicationStatus === "issued" ? "completed" : "pending",
                description: applicationStatus === "issued"
                  ? "Your Digital Signature Certificate has been issued!"
                  : "Certificate will be issued once approved.",
              },
            ].map((step, idx, arr) => {
              const isCompleted = step.status === "completed";
              const isActive = step.status === "active";
              const isRejected = step.status === "rejected";

              // Color tokens for icon container
              let iconBg = "bg-transparent";
              let iconBorder = "border-[var(--border-soft)]";
              let iconColor = colors.muted;
              let textWeight = "font-semibold";

              if (isCompleted) {
                iconBg = "bg-emerald-500/10 dark:bg-emerald-500/20";
                iconBorder = "border-emerald-500/30";
                iconColor = "#10b981";
              } else if (isActive) {
                iconBg = "bg-amber-500/10 dark:bg-amber-500/20";
                iconBorder = "border-amber-500/50 animate-pulse";
                iconColor = "#f59e0b";
                textWeight = "font-black";
              } else if (isRejected) {
                iconBg = "bg-rose-500/10 dark:bg-rose-500/20";
                iconBorder = "border-rose-500/50";
                iconColor = "#f43f5e";
                textWeight = "font-black";
              }

              return (
                <div key={step.id} className="flex-1 flex md:flex-col items-start gap-4 md:gap-3 relative group">
                  {/* Connecting line */}
                  {idx < arr.length - 1 && (
                    <>
                      {/* Desktop line */}
                      <div
                        className="hidden md:block absolute top-5 left-10 w-[calc(100%-1rem)] h-[2px] transition-all duration-500 z-0"
                        style={{
                          backgroundColor: isCompleted ? "#10b981" : colors.borderSoft,
                        }}
                      />
                      {/* Mobile line */}
                      <div
                        className="md:hidden absolute left-5 top-10 bottom-[-1.5rem] w-[2px] transition-all duration-500 z-0"
                        style={{
                          backgroundColor: isCompleted ? "#10b981" : colors.borderSoft,
                        }}
                      />
                    </>
                  )}

                  {/* Step Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 z-10 ${iconBg} ${iconBorder}`}
                    style={{ color: iconColor, borderColor: isCompleted || isActive || isRejected ? undefined : colors.borderSoft }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={18} />
                    ) : isActive ? (
                      <LoaderCircle size={18} className="animate-spin" />
                    ) : isRejected ? (
                      <span className="font-extrabold text-sm">!</span>
                    ) : (
                      <span className="font-bold text-xs">{step.id}</span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 z-10">
                    <p
                      className={`text-xs uppercase tracking-wider ${textWeight}`}
                      style={{ color: isActive || isRejected ? colors.text : colors.muted }}
                    >
                      {step.label}
                    </p>
                    <p
                      className="mt-0.5 text-[10px] leading-relaxed"
                      style={{ color: colors.subtleText }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Estimated Processing Time (Task 4.6) */}
          {userData && (userData.status === "pending" || userData.status === "approved") && paymentIsSettled && (
            <div
              className="mt-4 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 flex items-center justify-between text-xs font-semibold"
              style={{ color: colors.text }}
            >
              <div className="flex items-center gap-2">
                <Info size={14} className="text-amber-500" />
                <span>Processing Queue: {userData.queueLength} application(s) ahead of you.</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-amber-500">Est. Wait:</span>{" "}
                <span className="font-bold text-amber-600">{userData.estimatedTimeMinutes} mins</span>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Task 3.5 — What's Next */}
      <WhatsNextCard
        hasSubmittedApplication={hasSubmittedApplication}
        paymentIsSettled={paymentIsSettled}
        applicationStatus={applicationStatus}
        colors={colors}
        onNavigate={selectView}
      />

      {/* Task 3.6 — Notification Preferences */}
      <NotificationPrefsCard
        notifyEmail={notifyEmail}
        notifySMS={notifySMS}
        onToggleEmail={handleToggleEmail}
        onToggleSMS={handleToggleSMS}
        colors={colors}
      />

      {/* Task 4.5 — Admin Action History Timeline */}
      {userData?.actionHistory && userData.actionHistory.length > 0 && (
        <div
          className="rounded-xl border p-4 sm:p-5"
          style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-[0.24em] mb-4"
            style={{ color: colors.muted }}
          >
            Application History Log
          </p>
          <div className="relative border-l border-gray-200 dark:border-gray-800 ml-2.5 pl-4 space-y-4">
            {userData.actionHistory.map((item, index) => (
              <div key={index} className="relative">
                {/* Timeline dot */}
                <div
                  className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border"
                  style={{
                    backgroundColor:
                      item.action === "approved" || item.action === "issued"
                        ? "#10b981"
                        : item.action === "rejected"
                        ? "#f43f5e"
                        : colors.accent,
                    borderColor: colors.card,
                  }}
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold capitalize text-[var(--foreground)]">
                    {item.action === "submitted" ? "Application Submitted" : `Status Changed: ${item.action}`}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--muted)]">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-[var(--muted)] mt-0.5">
                  Performed by: <span className="text-[var(--foreground)]">{item.performedBy}</span>
                </p>
                {item.remarks && (
                  <p className="mt-1 text-[11px] font-medium leading-relaxed italic text-[var(--subtle-text)]">
                    &ldquo;{item.remarks}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task 3.2 — Export JSON */}
      {hasSubmittedApplication && userData ? (
        <div
          className="flex items-center justify-between rounded-xl border p-4"
          style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel }}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: colors.muted }}>Application Data</p>
            <p className="mt-1 text-xs font-semibold" style={{ color: colors.text }}>Export your full application as a JSON file for your records.</p>
          </div>
          <button
            type="button"
            onClick={handleExportJSON}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all hover:-translate-y-0.5"
            style={{ borderColor: colors.borderSoft, backgroundColor: colors.card, color: colors.accent }}
          >
            <Download size={13} />
            Export JSON
          </button>
        </div>
      ) : null}
    </div>
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
          <StatusMeta label="Last Update" value={reviewedOn} colors={colors} />
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

  let mainSections: ReactNode = null;
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
      className="theme-transition ud-dashboard-root ud-shell overflow-hidden relative"
      style={{ color: colors.text }}
    >
      {/* Offline Indicator Banner */}
      {!isOnline && (
        <div 
          className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-rose-600 px-4 py-2 text-center text-xs font-black uppercase tracking-wider text-white shadow-md animate-bounce"
        >
          <span>⚠️</span>
          <span>You are currently offline. Check your connection.</span>
        </div>
      )}

      {/* Form Submission Loading Backdrop */}
      {formSubmitting && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <LoaderCircle size={36} className="animate-spin" style={{ color: colors.accent }} />
            <p className="text-xs font-black uppercase tracking-wider" style={{ color: colors.text }}>
              Generating Application...
            </p>
          </div>
        </div>
      )}

      {/* Fixed Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95"
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

      <div className="ud-main relative">
        {!loading ? (
          <>
            <header
              className="ud-mobile-bar"
              style={{
                borderColor: colors.borderSoft,
              }}
            >
              <button
                type="button"
                onClick={handleSidebarToggle}
                className="theme-transition ud-menu-btn"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
                aria-label="Open navigation menu"
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[10px] font-black uppercase tracking-[0.2em]"
                  style={{ color: colors.muted }}
                >
                  User dashboard
                </p>
                <p
                  className="truncate text-sm font-black"
                  style={{ color: colors.text }}
                >
                  {USER_VIEW_LABELS[view]}
                </p>
              </div>
            </header>

            <header
              className="ud-desktop-bar"
              style={{ borderColor: colors.borderSoft }}
            >
              <button
                type="button"
                onClick={handleSidebarToggle}
                className="theme-transition ud-menu-btn"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: colors.subtleText }}
                >
                  Workspace
                </p>
                <p
                  className="truncate text-sm font-black"
                  style={{ color: colors.text }}
                >
                  {USER_VIEW_LABELS[view]}
                </p>
              </div>
            </header>
          </>
        ) : null}

        <main className="ud-main-scroll relative z-10">
          <div className="ud-page-inner">
            {loading ? (
              <UserDashboardSkeleton colors={colors} />
            ) : (
              mainSections
            )}
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
      badgeClass = "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    } else if (applicationStatus === "rejected") {
      badgeText = "Uploaded (Pending Re-review)";
      badgeClass = "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20";
    } else {
      badgeText = "Uploaded (Pending Review)";
      badgeClass = "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
  } else {
    if (hasSubmittedApplication) {
      badgeText = "Missing / Required";
      badgeClass = "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20";
    } else {
      badgeText = "Required on Submission";
      badgeClass = "bg-gray-500/10 dark:bg-gray-500/20 text-gray-500 dark:text-gray-450 border-gray-550/20";
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
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${badgeClass}`}>
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

function UserDashboardSkeleton({ colors }: { colors: ReturnType<typeof getThemePalette> }) {
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
            style={{ borderColor: colors.borderSoft, backgroundColor: colors.card }}
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
            <div key={i} className="flex-1 flex md:flex-col items-start gap-4 md:gap-3">
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
}: {
  payment: PaymentSummary;
  colors: ReturnType<typeof getThemePalette>;
  isDarkMode: boolean;
  onClose: () => void;
}) {
  void isDarkMode; // consumed by parent; kept for prop parity
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: colors.borderSoft }}
        >
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: colors.muted }}>
              Invoice Preview
            </p>
            <h3 className="mt-0.5 text-base font-black uppercase tracking-tight">Tax Invoice</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all hover:scale-105 active:scale-95"
            style={{ borderColor: colors.borderSoft, backgroundColor: colors.panelStrong, color: colors.muted }}
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
            { label: "Payment ID", value: payment.razorpayPaymentId || payment._id || "—" },
            { label: "Amount Paid", value: payment.amount ? `INR ${payment.amount.toFixed(2)}` : "—" },
            { label: "Status", value: payment.status || "—" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
              style={{ borderColor: colors.borderSoft, backgroundColor: colors.panelStrong }}
            >
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: colors.muted }}>
                {label}
              </span>
              <span className="max-w-[55%] truncate text-right text-xs font-bold">{value}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t px-6 pb-6 pt-4" style={{ borderColor: colors.borderSoft }}>
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
            style={{ borderColor: colors.border, backgroundColor: colors.panelStrong, color: colors.text }}
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
  pricing: { certificate: number; token: number; assisted: number; total: number };
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
        style={{ borderColor: colors.borderSoft, color: colors.muted, backgroundColor: colors.panelStrong }}
        aria-label="View fee breakdown"
      >
        <Info size={11} />
      </button>
      {visible && (
        <div
          className="absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-xl border p-3 shadow-2xl"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <p className="mb-2 text-[9px] font-black uppercase tracking-wider" style={{ color: colors.muted }}>
            Fee Breakdown
          </p>
          <div className="space-y-1.5">
            {[
              { label: "Certificate", amount: pricing.certificate },
              { label: "USB Token", amount: pricing.token },
              { label: "Assisted Service", amount: pricing.assisted },
            ].map(({ label, amount }) => (
              <div key={label} className="flex items-center justify-between text-[11px]">
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

// ─── Task 3.5 – What's Next Card ─────────────────────────────────────────────
function WhatsNextCard({
  hasSubmittedApplication,
  paymentIsSettled,
  applicationStatus,
  colors,
  onNavigate,
}: {
  hasSubmittedApplication: boolean;
  paymentIsSettled: boolean;
  applicationStatus: string | null;
  colors: ReturnType<typeof getThemePalette>;
  onNavigate: (view: UserDashboardView) => void;
}) {
  type NextStep = {
    step: number;
    title: string;
    description: string;
    action: { label: string; view: UserDashboardView } | null;
  };

  let next: NextStep;

  if (!hasSubmittedApplication) {
    next = {
      step: 1,
      title: "Submit Your Application",
      description: "Fill in personal details, certificate requirements, and upload required documents.",
      action: { label: "Start Registration", view: "registration" },
    };
  } else if (!paymentIsSettled) {
    next = {
      step: 2,
      title: "Complete Payment",
      description: "Your application is saved. Proceed to payment to activate admin processing.",
      action: { label: "Go to Payment", view: "payment" },
    };
  } else if (applicationStatus === "rejected") {
    next = {
      step: 3,
      title: "Resubmit Application",
      description: "Admin requested corrections. Review the feedback and resubmit.",
      action: { label: "View Admin Review", view: "admin-review" },
    };
  } else if (applicationStatus === "approved" || applicationStatus === "issued") {
    next = {
      step: 4,
      title: "Certificate Issued 🎉",
      description: "Your Digital Signature Certificate has been processed and approved!",
      action: { label: "View Certificate", view: "certificate-summary" },
    };
  } else {
    next = {
      step: 3,
      title: "Awaiting Admin Review",
      description: "Payment verified. Admin is reviewing your application — you will be notified once complete.",
      action: null,
    };
  }

  return (
    <div
      className="rounded-xl border p-4 sm:p-5"
      style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel }}
    >
      <div className="mb-3 flex items-center gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: colors.muted }}>
          What&apos;s Next
        </p>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white"
          style={{ backgroundColor: colors.accent }}
        >
          Step {next.step} of 4
        </span>
      </div>
      <h4 className="text-sm font-black uppercase tracking-tight" style={{ color: colors.text }}>
        {next.title}
      </h4>
      <p className="mt-1 text-xs font-semibold leading-relaxed" style={{ color: colors.muted }}>
        {next.description}
      </p>
      {next.action && (
        <button
          type="button"
          onClick={() => onNavigate(next.action!.view)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all hover:-translate-y-0.5"
          style={{ borderColor: colors.borderSoft, backgroundColor: colors.card, color: colors.accent }}
        >
          {next.action.label}
          <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Task 3.6 – Notification Preference Toggles ───────────────────────────────
function NotificationPrefsCard({
  notifyEmail,
  notifySMS,
  onToggleEmail,
  onToggleSMS,
  colors,
}: {
  notifyEmail: boolean;
  notifySMS: boolean;
  onToggleEmail: () => void;
  onToggleSMS: () => void;
  colors: ReturnType<typeof getThemePalette>;
}) {
  const prefs = [
    {
      key: "email",
      label: "Email Notifications",
      description: "Receive application status updates via email",
      enabled: notifyEmail,
      toggle: onToggleEmail,
    },
    {
      key: "sms",
      label: "SMS Notifications",
      description: "Receive real-time alerts directly on your phone",
      enabled: notifySMS,
      toggle: onToggleSMS,
    },
  ];

  return (
    <div
      className="rounded-xl border p-4 sm:p-5"
      style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel }}
    >
      <div className="mb-4 flex items-center gap-2">
        <Bell size={13} style={{ color: colors.accent }} />
        <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: colors.muted }}>
          Notification Preferences
        </p>
      </div>
      <div className="space-y-3">
        {prefs.map(({ key, label, description, enabled, toggle }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3 rounded-lg border p-3"
            style={{ borderColor: colors.inputBorder, backgroundColor: colors.panelStrong }}
          >
            <div>
              <p className="text-xs font-black" style={{ color: colors.text }}>
                {label}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold" style={{ color: colors.muted }}>
                {description}
              </p>
            </div>
            <button
              type="button"
              onClick={toggle}
              role="switch"
              aria-checked={enabled}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300"
              style={{
                backgroundColor: enabled ? "#10b981" : colors.inputBorder,
                borderColor: enabled ? "#10b981" : colors.inputBorder,
              }}
            >
              <span
                className={`pointer-events-none mt-[1px] inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
                  enabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
