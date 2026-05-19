import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import {
  finalizeCapturedPayment,
  markPaymentFailed,
} from "@/lib/payments";
import { verifyWebhookSignature } from "@/lib/razorpay";
import Payment from "@/models/payment";

type RazorpayWebhookPayload = {
  event: string;
  payload?: {
    payment?: { entity?: RazorpayPaymentWebhookEntity };
    refund?: { entity?: RazorpayRefundWebhookEntity };
  };
};

type RazorpayPaymentWebhookEntity = {
  id: string;
  order_id: string;
  amount?: number;
  error_description?: string;
  notes?: Record<string, string>;
};

type RazorpayRefundWebhookEntity = {
  id: string;
  payment_id: string;
  amount?: number;
  notes?: Record<string, string>;
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const signature = req.headers.get("x-razorpay-signature") || "";
    const rawBody = await req.text();

    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { success: false, message: "Invalid webhook signature" },
        { status: 400 },
      );
    }

    const body = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const paymentEntity = body.payload?.payment?.entity;
    const refundEntity = body.payload?.refund?.entity;

    const paymentDocument = paymentEntity
      ? await Payment.findOne({
          $or: [
            { razorpayOrderId: paymentEntity.order_id },
            { razorpayPaymentId: paymentEntity.id },
          ],
        })
      : null;

    if (!paymentDocument && body.event !== "refund.processed") {
      return NextResponse.json({ success: true, ignored: true });
    }

    if (paymentDocument) {
      paymentDocument.webhookData = body;
      paymentDocument.invoiceUrl = `/api/payments/${String(paymentDocument._id)}/invoice`;
    }

    switch (body.event) {
      case "payment.captured":
      case "order.paid":
        if (paymentDocument && paymentEntity) {
          await finalizeCapturedPayment({
            paymentDocument,
            gatewayPayment: paymentEntity,
            source: "webhook",
          });
        }
        break;
      case "payment.failed":
        if (paymentDocument && paymentEntity) {
          await markPaymentFailed({
            paymentDocument,
            details: paymentEntity,
            reason: paymentEntity.error_description || "Razorpay payment failure",
            source: "webhook",
          });
        }
        break;
      case "refund.processed":
        if (refundEntity?.payment_id) {
          const refundPayment = await Payment.findOne({
            razorpayPaymentId: refundEntity.payment_id,
          });

          if (refundPayment) {
            refundPayment.status = "refunded";
            refundPayment.refundDetails = {
              razorpayRefundId: refundEntity.id,
              refundAmount: Number(refundEntity.amount || 0) / 100,
              refundDate: new Date(),
              refundReason: refundEntity.notes?.reason || "",
              refundStatus: "processed",
            };
            refundPayment.notes = [
              ...(refundPayment.notes || []),
              {
                timestamp: new Date(),
                action: "refund_processed",
                by: "system",
                details: `Refund ${refundEntity.id} processed`,
              },
            ];
            await refundPayment.save();
          }
        }
        break;
      default:
        if (paymentDocument) {
          paymentDocument.notes = [
            ...(paymentDocument.notes || []),
            {
              timestamp: new Date(),
              action: "webhook_received",
              by: "system",
              details: `Webhook event ${body.event} received`,
            },
          ];
          await paymentDocument.save();
        }
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Webhook handling failed",
      },
      { status: 500 },
    );
  }
}
