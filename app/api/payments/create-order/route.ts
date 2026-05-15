// import { NextRequest, NextResponse } from "next/server";

// import { connectDB } from "@/app/lib/mongodb";
// import {
//   amountToPaise,
//   buildPaymentBreakdown,
//   createPaymentReceipt,
// } from "@/app/lib/payments";
// import {
//   createRazorpayOrder,
//   getRazorpayPublicConfig,
//   isMockPaymentGatewayEnabled,
// } from "@/app/lib/razorpay";
// import { withAuth } from "@/app/lib/withAuth";
// import Payment from "@/model/payment";
// import User from "@/model/user";

// const handler = async (req: NextRequest, decoded: { userId: string; role: string }) => {
//   try {
//     await connectDB();

//     const body = (await req.json().catch(() => ({}))) as {
//       userId?: string;
//       description?: string;
//     };

//     const targetUserId =
//       decoded.role === "admin" || decoded.role === "superadmin"
//         ? body.userId || decoded.userId
//         : decoded.userId;

//     const user = await User.findById(targetUserId).select("-password");

//     if (!user) {
//       return NextResponse.json(
//         { success: false, message: "User not found" },
//         { status: 404 },
//       );
//     }

//     const breakdown = buildPaymentBreakdown(user);
//     const payment = await Payment.create({
//       userId: user._id,
//       applicationId: user._id,
//       dscId: user.dscId || `DIQ-PENDING-${String(user._id).slice(-6).toUpperCase()}`,
//       amount: breakdown.total,
//       currency: "INR",
//       breakdown,
//       status: "pending",
//       method: "razorpay",
//       gstRate: 18,
//       orderDetails: {
//         certificateType: user.certType,
//         certificateValidity: user.validity,
//         tokenType: user.tokenType,
//         assistedService: user.assistedService || "Not Required",
//         description:
//           body.description ||
//           `${user.certType || "DSC"} application for ${user.name || user.email}`,
//       },
//       description:
//         body.description ||
//         `${user.certType || "DSC"} application for ${user.name || user.email}`,
//       metadata: {
//         ipAddress:
//           req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
//           req.headers.get("x-real-ip") ||
//           "",
//         userAgent: req.headers.get("user-agent") || "",
//         source: "web",
//       },
//       notes: [
//         {
//           action: "payment_created",
//           by: decoded.role === "admin" ? "admin" : "user",
//           details: "Payment initialized before Razorpay order creation",
//         },
//       ],
//     });

//     const useMockGateway = isMockPaymentGatewayEnabled();
//     const orderResult = useMockGateway
//       ? {
//           success: true as const,
//           orderId: `mock_order_${String(payment._id)}`,
//           amount: amountToPaise(breakdown.total),
//           currency: "INR",
//           order: {
//             id: `mock_order_${String(payment._id)}`,
//             amount: amountToPaise(breakdown.total),
//             currency: "INR",
//             status: "created",
//             receipt: createPaymentReceipt(String(payment._id)),
//             notes: {
//               paymentId: String(payment._id),
//               userId: String(user._id),
//               dscId: payment.dscId,
//             },
//           },
//         }
//       : await createRazorpayOrder({
//           amount: amountToPaise(breakdown.total),
//           currency: "INR",
//           receipt: createPaymentReceipt(String(payment._id)),
//           description:
//             payment.description || `${user.certType || "DSC"} application payment`,
//           notes: {
//             paymentId: String(payment._id),
//             userId: String(user._id),
//             dscId: payment.dscId,
//           },
//         });

//     if (!orderResult.success) {
//       await Payment.findByIdAndUpdate(payment._id, {
//         status: "failed",
//         validationErrors: [orderResult.error],
//       });

//       return NextResponse.json(
//         { success: false, message: orderResult.error },
//         { status: 502 },
//       );
//     }

//     payment.razorpayOrderId = orderResult.orderId;
//     payment.status = "initiated";
//     payment.referenceNumber = orderResult.orderId;
//     payment.webhookData = { order: orderResult.order };
//     payment.invoiceUrl = `/api/payments/${String(payment._id)}/invoice`;
//     payment.notes.push({
//       action: "razorpay_order_created",
//       by: "system",
//       details: `Razorpay order ${orderResult.orderId} created`,
//     });
//     await payment.save();

//     return NextResponse.json({
//       success: true,
//       provider: useMockGateway ? "mock" : "razorpay",
//       paymentId: payment._id,
//       keyId: useMockGateway ? "mock_key" : getRazorpayPublicConfig().keyId,
//       amount: orderResult.amount,
//       currency: orderResult.currency,
//       order: orderResult.order,
//       breakdown,
//     });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error instanceof Error ? error.message : "Failed to create payment order",
//       },
//       { status: 500 },
//     );
//   }
// };

// export const POST = withAuth(handler);
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/app/lib/mongodb";
import {
  createPaymentReceipt,
} from "@/app/lib/payments";

import {
  createRazorpayOrder,
  getRazorpayPublicConfig,
  isMockPaymentGatewayEnabled,
} from "@/app/lib/razorpay";

import { withAuth } from "@/app/lib/withAuth";

import Payment from "@/model/payment";
import User from "@/model/user";

const handler = async (
  req: NextRequest,
  decoded: { userId: string; role: string },
) => {
  try {
    await connectDB();

    const body = (await req.json().catch(() => ({}))) as {
      userId?: string;
      description?: string;
    };

    const targetUserId =
      decoded.role === "admin" || decoded.role === "superadmin"
        ? body.userId || decoded.userId
        : decoded.userId;

    const user = await User.findById(targetUserId).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    // =========================
    // TEST PAYMENT AMOUNT
    // =========================
    const testAmountRupees = 1;
    const testAmountPaise = 100;

    const breakdown = {
      subtotal: testAmountRupees,
      gstAmount: 0,
      total: testAmountRupees,
    };

    const payment = await Payment.create({
      userId: user._id,
      applicationId: user._id,

      dscId:
        user.dscId ||
        `DIQ-PENDING-${String(user._id)
          .slice(-6)
          .toUpperCase()}`,

      // DATABASE AMOUNT
      amount: testAmountRupees,

      currency: "INR",

      breakdown,

      status: "pending",

      method: "razorpay",

      gstRate: 0,

      orderDetails: {
        certificateType: user.certType,
        certificateValidity: user.validity,
        tokenType: user.tokenType,

        assistedService:
          user.assistedService || "Not Required",

        description:
          body.description ||
          `${user.certType || "DSC"} application for ${
            user.name || user.email
          }`,
      },

      description:
        body.description ||
        `${user.certType || "DSC"} application for ${
          user.name || user.email
        }`,

      metadata: {
        ipAddress:
          req.headers
            .get("x-forwarded-for")
            ?.split(",")[0]
            ?.trim() ||
          req.headers.get("x-real-ip") ||
          "",

        userAgent:
          req.headers.get("user-agent") || "",

        source: "web",
      },

      notes: [
        {
          action: "payment_created",
          by:
            decoded.role === "admin"
              ? "admin"
              : "user",

          details:
            "₹1 test payment initialized",
        },
      ],
    });

    const useMockGateway =
      isMockPaymentGatewayEnabled();

    const orderResult = useMockGateway
      ? {
          success: true as const,

          orderId: `mock_order_${String(
            payment._id,
          )}`,

          amount: testAmountPaise,

          currency: "INR",

          order: {
            id: `mock_order_${String(
              payment._id,
            )}`,

            amount: testAmountPaise,

            currency: "INR",

            status: "created",

            receipt: createPaymentReceipt(
              String(payment._id),
            ),

            notes: {
              paymentId: String(payment._id),

              userId: String(user._id),

              dscId: payment.dscId,
            },
          },
        }
      : await createRazorpayOrder({
          // RAZORPAY AMOUNT
          amount: testAmountPaise,

          currency: "INR",

          receipt: createPaymentReceipt(
            String(payment._id),
          ),

          description:
            payment.description ||
            `${user.certType || "DSC"} application payment`,

          notes: {
            paymentId: String(payment._id),

            userId: String(user._id),

            dscId: payment.dscId,
          },
        });

    if (!orderResult.success) {
      await Payment.findByIdAndUpdate(
        payment._id,
        {
          status: "failed",

          validationErrors: [
            orderResult.error,
          ],
        },
      );

      return NextResponse.json(
        {
          success: false,
          message: orderResult.error,
        },
        {
          status: 502,
        },
      );
    }

    payment.razorpayOrderId =
      orderResult.orderId;

    payment.status = "initiated";

    payment.referenceNumber =
      orderResult.orderId;

    payment.webhookData = {
      order: orderResult.order,
    };

    payment.invoiceUrl = `/api/payments/${String(
      payment._id,
    )}/invoice`;

    payment.notes.push({
      action: "razorpay_order_created",

      by: "system",

      details: `₹1 Razorpay order ${orderResult.orderId} created`,
    });

    await payment.save();

    return NextResponse.json({
      success: true,

      provider: useMockGateway
        ? "mock"
        : "razorpay",

      paymentId: payment._id,

      keyId: useMockGateway
        ? "mock_key"
        : getRazorpayPublicConfig().keyId,

      amount: orderResult.amount,

      currency: orderResult.currency,

      order: orderResult.order,

      breakdown,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to create payment order",
      },
      {
        status: 500,
      },
    );
  }
};

export const POST = withAuth(handler);