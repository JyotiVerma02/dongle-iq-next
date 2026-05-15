import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/app/lib/mongodb";
import {
  finalizeCapturedPayment,
  mapGatewayStatus,
  markPaymentFailed,
} from "@/app/lib/payments";
import {
  fetchPaymentDetails,
  isMockPaymentGatewayEnabled,
  verifyPaymentSignature,
} from "@/app/lib/razorpay";
import { withAuth } from "@/app/lib/withAuth";
import Payment from "@/model/payment";

const handler = async (req: NextRequest) => {
  try {
    await connectDB();

    const body = (await req.json()) as {
      paymentId?: string;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      razorpaySignature?: string;
      mock?: boolean;
    };

    const mockMode = body.mock && isMockPaymentGatewayEnabled();

    if (
      !mockMode &&
      (!body.razorpayOrderId ||
        !body.razorpayPaymentId ||
        !body.razorpaySignature)
    ) {
      return NextResponse.json(
        { success: false, message: "Missing Razorpay verification payload" },
        { status: 400 },
      );
    }

    const isValidSignature = mockMode
      ? true
      : verifyPaymentSignature({
          razorpayOrderId: body.razorpayOrderId!,
          razorpayPaymentId: body.razorpayPaymentId!,
          razorpaySignature: body.razorpaySignature!,
        });

    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 },
      );
    }

    const paymentDocument =
      (body.paymentId ? await Payment.findById(body.paymentId) : null) ||
      (body.razorpayOrderId
        ? await Payment.findOne({ razorpayOrderId: body.razorpayOrderId })
        : null);

    if (!paymentDocument) {
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 },
      );
    }

    const paymentDetails = mockMode
      ? {
          success: true as const,
          payment: {
            id: `mock_payment_${String(paymentDocument._id)}`,
            entity: "payment",
            amount: Math.round((paymentDocument.amount || 0) * 100),
            currency: paymentDocument.currency || "INR",
            status: "captured",
            order_id:
              paymentDocument.razorpayOrderId || `mock_order_${String(paymentDocument._id)}`,
            invoice_id: null,
            international: false,
            method: "mock",
            amount_refunded: 0,
            refund_status: null,
            captured: true,
            description: paymentDocument.description || null,
            card_id: null,
            bank: null,
            wallet: null,
            vpa: null,
            email: "",
            contact: "",
            fee: null,
            tax: null,
            error_code: null,
            error_description: null,
            created_at: Math.floor(Date.now() / 1000),
            notes: {},
          },
        }
      : await fetchPaymentDetails(body.razorpayPaymentId!);

    if (!paymentDetails.success) {
      return NextResponse.json(
        { success: false, message: paymentDetails.error },
        { status: 502 },
      );
    }

    paymentDocument.razorpaySignature =
      body.razorpaySignature || `mock_signature_${String(paymentDocument._id)}`;
    paymentDocument.status = mapGatewayStatus(paymentDetails.payment.status);
    paymentDocument.webhookData = paymentDetails.payment;
    paymentDocument.invoiceUrl = `/api/payments/${String(paymentDocument._id)}/invoice`;

    if (paymentDetails.payment.status === "captured") {
      await finalizeCapturedPayment({
        paymentDocument,
        gatewayPayment: paymentDetails.payment,
        source: "checkout-verification",
      });
    } else if (paymentDetails.payment.status === "failed") {
      await markPaymentFailed({
        paymentDocument,
        details: paymentDetails.payment,
        reason: paymentDetails.payment.error_description || "Gateway marked payment as failed",
        source: "checkout-verification",
      });
    } else {
      await paymentDocument.save();
    }

    return NextResponse.json({
      success: true,
      payment: paymentDocument,
      invoiceUrl: paymentDocument.invoiceUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to verify payment",
      },
      { status: 500 },
    );
  }
};

export const POST = withAuth(handler);
