import { NextRequest, NextResponse } from "next/server";

import { verifySessionToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/payment";
import User from "@/models/user";

export { POST } from "@/app/api/create-application/route";

type DecodedToken = {
  userId: string;
};

function formatDate(value?: Date | string | null) {
  if (!value) return "Not available";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = (await verifySessionToken(token)) as DecodedToken;
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const payments = await Payment.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .lean();

    const hasApplication = Boolean(
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

    const latestPayment = payments[0] ?? null;
    const status = user.status || "pending";
    const paymentStatus = user.paymentStatus || "pending";
    const certificateIssued = status === "issued";

    const applications = hasApplication
      ? [
          {
            id: String(user._id),
            applicationNo: `APP-${String(user._id).slice(-6).toUpperCase()}`,
            type: user.certType || "DSC",
            certificateClass: user.certificateClass || "Class III",
            status,
            paymentStatus,
            submittedOn: formatDate(user.createdAt),
            updatedOn: formatDate(user.updatedAt),
            action: latestPayment?.invoiceUrl ? "View / Invoice / Track" : "View / Track",
          },
        ]
      : [];

    const certificates =
      hasApplication && (status === "approved" || status === "issued")
        ? [
            {
              type: user.certType || "DSC",
              validity: user.validity || "Not available",
              token: user.tokenType || "Not linked",
              status: certificateIssued ? "Issued" : "Approved, awaiting issue",
              issuedOn: certificateIssued ? formatDate(user.updatedAt) : "Pending issue",
              expiry: certificateIssued ? user.validity || "Not available" : "Pending issue",
            },
          ]
        : [];

    const transactions = payments.map((payment) => ({
      id: String(payment._id),
      invoice: payment.invoiceNumber || payment.razorpayOrderId || String(payment._id).slice(-8).toUpperCase(),
      amount: `INR ${Number(payment.amount || 0).toFixed(2)}`,
      status: payment.status || paymentStatus,
      date: formatDate(payment.invoiceDate || payment.createdAt),
      action: payment.invoiceUrl ? "Download PDF" : "Invoice pending",
      razorpayPaymentId: payment.razorpayPaymentId || "Not available",
      invoiceUrl: payment.invoiceUrl || "",
    }));

    const notifications = [
      user.isVerified
        ? {
            title: "OTP verified",
            description: "Your mobile verification is complete.",
            time: formatDate(user.updatedAt),
            tone: "success",
          }
        : null,
      hasApplication
        ? {
            title: "Application submitted",
            description: `Your ${user.certType || "DSC"} application is ${status}.`,
            time: formatDate(user.createdAt),
            tone: status === "rejected" ? "danger" : "info",
          }
        : null,
      latestPayment
        ? {
            title: "Payment update",
            description: `Latest payment status: ${latestPayment.status || paymentStatus}.`,
            time: formatDate(latestPayment.updatedAt || latestPayment.createdAt),
            tone: "payment",
          }
        : null,
      user.internalRemarks
        ? {
            title: "Admin feedback",
            description: user.internalRemarks,
            time: formatDate(user.updatedAt),
            tone: status === "rejected" ? "danger" : "info",
          }
        : null,
    ].filter(Boolean);

    return NextResponse.json({
      success: true,
      dashboard: {
        applications,
        certificates,
        transactions,
        notifications,
        irctcApplications: [],
        supportTickets: [],
        account: {
          name: user.name || "",
          email: user.email || "",
          mobile: user.number || "",
          twoFactor: user.isAadhaarVerified ? "Aadhaar verified" : "Not enabled",
          notifications: "Email enabled",
          linkedDevices: "Current session",
          lastLogin: "Current session",
          browserDevice: "Web dashboard",
        },
        plan: {
          name: "Free Plan",
          features: [
            "DSC application tracking",
            "Payment invoices",
            "Document status",
          ],
        },
      },
    });
  } catch (error) {
    console.error("user-dashboard GET error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data",
      },
      { status: 500 },
    );
  }
}
