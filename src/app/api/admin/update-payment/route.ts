import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import {
  buildPaymentBreakdown,
  createInvoiceNumber,
  markUserPaymentState,
} from "@/lib/payments";
import { adminOnly } from "@/lib/withAuth";
import { buildChanges, createAuditEntry, createLegacyActionHistoryEntry } from "@/lib/adminAudit";
import { resolveAdminActor } from "@/lib/admin";
import { hasAdminPermission, normalizeAdminRole } from "@/lib/adminRoles";
import Payment from "@/models/payment";
import User from "@/models/user";

const handler = async (req: NextRequest, decoded: { userId: string; role: string }) => {
  try {
    await connectDB();

    const { userId, paymentStatus } = await req.json();

    if (!userId || !paymentStatus) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 },
      );
    }

    const admin = await resolveAdminActor(decoded.userId);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 },
      );
    }

    const adminRole = normalizeAdminRole(admin.role);
    if (!hasAdminPermission(adminRole, "update_payment")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to update payment status" },
        { status: 403 },
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const previousState = {
      paymentStatus: user.paymentStatus,
      gst: user.gst,
    };

    const breakdown = buildPaymentBreakdown(user);
    const latestPayment = await Payment.findOne({ userId }).sort({ createdAt: -1 });

    if (paymentStatus === "paid") {
      if (latestPayment) {
        latestPayment.status = "verified";
        latestPayment.method = latestPayment.method || "cash";
        latestPayment.invoiceNumber =
          latestPayment.invoiceNumber || createInvoiceNumber();
        latestPayment.invoiceDate = latestPayment.invoiceDate || new Date();
        latestPayment.invoiceUrl =
          latestPayment.invoiceUrl || `/api/payments/${String(latestPayment._id)}/invoice`;
        latestPayment.breakdown = latestPayment.breakdown || breakdown;
        latestPayment.amount = latestPayment.amount || breakdown.total;
        latestPayment.processedBy = decoded.userId;
        latestPayment.processedDate = new Date();
        latestPayment.notes = [
          ...(latestPayment.notes || []),
          {
            timestamp: new Date(),
            action: "payment_marked_paid",
            by: "admin",
            details: "Payment marked paid from admin dashboard",
          },
        ];
        await latestPayment.save();
      } else {
        const createdPayment = await Payment.create({
          userId: user._id,
          applicationId: user._id,
          dscId: user.dscId || `DIQ-PENDING-${String(user._id).slice(-6).toUpperCase()}`,
          amount: breakdown.total,
          currency: "INR",
          breakdown,
          status: "verified",
          method: "cash",
          invoiceNumber: createInvoiceNumber(),
          invoiceDate: new Date(),
          description: "Manual admin payment update",
          processedBy: decoded.userId,
          processedDate: new Date(),
          orderDetails: {
            certificateType: user.certType,
            certificateValidity: user.validity,
            tokenType: user.tokenType,
            assistedService: user.assistedService || "Not Required",
            description: "Manual admin payment update",
          },
          notes: [
            {
              timestamp: new Date(),
              action: "payment_marked_paid",
              by: "admin",
              details: "Payment created from admin dashboard as paid",
            },
          ],
        });

        createdPayment.invoiceUrl = `/api/payments/${String(createdPayment._id)}/invoice`;
        await createdPayment.save();
      }

      await markUserPaymentState(userId, "paid", breakdown.gst);
    } else {
      if (latestPayment) {
        latestPayment.status = paymentStatus === "pending" ? "pending" : "failed";
        latestPayment.notes = [
          ...(latestPayment.notes || []),
          {
            timestamp: new Date(),
            action: "payment_marked_unpaid",
            by: "admin",
            details: `Payment marked ${paymentStatus} from admin dashboard`,
          },
        ];
        await latestPayment.save();
      }

      await markUserPaymentState(
        userId,
        paymentStatus === "pending" ? "pending" : "unpaid",
      );
    }

    const updatedUser = await User.findById(userId);
    const updatedPayment = await Payment.findOne({ userId }).sort({ createdAt: -1 });

    if (updatedUser) {
      const actor = {
        id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: adminRole,
      };
      const nextState = {
        paymentStatus: updatedUser.paymentStatus,
        gst: updatedUser.gst,
      };

      updatedUser.actionHistory.push(
        createLegacyActionHistoryEntry({
          action: "payment_status_changed",
          actor,
          remarks: `Payment status updated to ${updatedUser.paymentStatus}`,
        }),
      );
      updatedUser.auditTrail.push(
        createAuditEntry({
          action: "payment_status_changed",
          actor,
          changes: buildChanges(previousState, nextState, ["paymentStatus", "gst"]),
          remarks: `Payment status updated to ${updatedUser.paymentStatus}`,
          metadata: {
            paymentStatus,
            paymentId: updatedPayment ? String(updatedPayment._id) : null,
          },
        }),
      );
      await updatedUser.save();
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
        ? {
            ...updatedUser.toObject(),
            latestPayment: updatedPayment
              ? {
                  _id: String(updatedPayment._id),
                  amount: updatedPayment.amount,
                  status: updatedPayment.status,
                  method: updatedPayment.method,
                  invoiceNumber: updatedPayment.invoiceNumber,
                  invoiceDate: updatedPayment.invoiceDate,
                  invoiceUrl: updatedPayment.invoiceUrl,
                  razorpayOrderId: updatedPayment.razorpayOrderId,
                  razorpayPaymentId: updatedPayment.razorpayPaymentId,
                  createdAt: updatedPayment.createdAt,
                  updatedAt: updatedPayment.updatedAt,
                }
              : null,
          }
        : null,
    });
  } catch (error) {
    console.error("PAYMENT UPDATE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update payment" },
      { status: 500 },
    );
  }
};

export const POST = adminOnly(handler);
