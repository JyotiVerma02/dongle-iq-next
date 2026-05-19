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
  CheckCircle2,
  CreditCard,
  FileText,
  LoaderCircle,
  Menu,
  PencilLine,
  ShieldCheck,
  Sparkles,
  Moon,
  SunMedium,
} from "lucide-react";

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
  const [view, setView] = useState<UserDashboardView>("overview");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(
    null,
  );
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/get-user-data", {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUserData(data.user);
        setPaymentSummary(data.user.latestPayment ?? null);
      } else {
        setUserData(null);
        setPaymentSummary(null);
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setUserData(null);
      setPaymentSummary(null);
    } finally {
      setLoading(false);
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
    void fetchUserData();
  }, [fetchUserData]);
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
  const statusTone =
    applicationStatus === "approved"
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
      setPaymentMessage(
        error instanceof Error
          ? error.message
          : "Unable to proceed to payment.",
      );
    }
  }

  const selectView = (next: UserDashboardView) => {
    setView(next);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

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

  const overviewPanel = userData ? (
    <div
      className="shine-border theme-transition ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 shadow-[0_24px_80px_rgba(0,0,0,0.16)] sm:p-6 lg:p-8"
      style={{
        backgroundColor: shellBackground,
        borderColor: strongBorderColor,
      }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
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
          <p
            className="text-[10px] font-black uppercase tracking-[0.24em]"
            style={{ color: colors.muted }}
          >
            Journey Status
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { label: "Application Submitted", done: true },
              { label: "Payment Verified", done: paymentIsSettled },
              { label: "Admin Processing", done: paymentIsSettled },
            ].map((step) => (
              <div
                key={step.label}
                className="rounded-lg border px-4 py-3"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panel,
                }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    style={{ color: step.done ? colors.accent : colors.muted }}
                  />
                  <p className="text-xs font-black uppercase">{step.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
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
              <p
                className="text-[10px] font-black uppercase tracking-[0.22em]"
                style={{ color: colors.muted }}
              >
                Payable Amount
              </p>
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
                <a
                  href={`${paymentSummary.invoiceUrl}?download=1`}
                  target="_blank"
                  rel="noreferrer"
                  className="theme-transition inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-xs font-black uppercase tracking-[0.18em]"
                  style={{
                    borderColor: colors.borderSoft,
                    backgroundColor: colors.panel,
                    color: colors.text,
                  }}
                >
                  <FileText size={14} />
                  Download Invoice
                </a>
              ) : null}
            </div>
          </div>
          {paymentMessage ? (
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
          />
          <DocumentMeta
            label="Identity Proof"
            value={userData.idProof}
            colors={colors}
          />
          <DocumentMeta
            label="Address Proof"
            value={userData.addressProof}
            colors={colors}
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
          <div key={view} className="ud-enter space-y-6 sm:space-y-8">
            {overviewPanel}
          </div>
        );
        break;
      case "registration":
        mainSections = (
          <div key={view} className="ud-enter space-y-6 sm:space-y-8">
            {registrationPanel}
          </div>
        );
        break;
      case "payment":
        mainSections = (
          <div key={view} className="ud-enter space-y-6 sm:space-y-8">
            {paymentPanel}
          </div>
        );
        break;
      case "admin-review":
        mainSections = (
          <div key={view} className="ud-enter space-y-6 sm:space-y-8">
            {adminReviewPanel}
          </div>
        );
        break;
      case "certificate-summary":
        mainSections = (
          <div key={view} className="ud-enter space-y-6 sm:space-y-8">
            {certificatePanel}
          </div>
        );
        break;
      case "personal-details":
        mainSections = (
          <div key={view} className="ud-enter space-y-6 sm:space-y-8">
            {personalDetailsPanel}
          </div>
        );
        break;
      case "documents":
        mainSections = (
          <div key={view} className="ud-enter space-y-6 sm:space-y-8">
            {documentsPanel}
          </div>
        );
        break;
      default:
        mainSections = null;
    }
  }

  return (
    <div
      className="theme-transition ud-dashboard-root ud-shell overflow-hidden"
      style={{ color: colors.text }}
    >
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
              <div className="flex min-h-[45vh] items-center justify-center">
                <p
                  className="text-sm font-semibold"
                  style={{ color: colors.muted }}
                >
                  Loading your profile...
                </p>
              </div>
            ) : (
              mainSections
            )}
          </div>
        </main>
      </div>
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
}: {
  label: string;
  value?: string;
  colors: ReturnType<typeof getThemePalette>;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-3"
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
