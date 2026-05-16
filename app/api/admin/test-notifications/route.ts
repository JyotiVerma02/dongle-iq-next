import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withAuth } from "@/app/lib/withAuth";
import {
  isMsg91SmsConfigured,
  isMsg91WhatsAppConfigured,
  sendSmsMessage,
  sendWhatsAppMessage,
} from "@/app/lib/msg91";
import { normalizeIndianMobile } from "@/app/lib/phone";

const testNotificationSchema = z.object({
  channel: z.enum(["sms", "whatsapp"]),
  mobileNumber: z.string().trim().min(10, "Mobile number is required"),
  message: z
    .string()
    .trim()
    .max(500, "Message must be 500 characters or fewer")
    .optional(),
});

const handler = async (req: NextRequest) => {
  const body = await req.json();
  const parsed = testNotificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          parsed.error.issues[0]?.message || "Invalid notification request",
      },
      { status: 400 },
    );
  }

  const normalizedMobile = normalizeIndianMobile(parsed.data.mobileNumber);

  if (!/^[6-9]\d{9}$/.test(normalizedMobile)) {
    return NextResponse.json(
      {
        success: false,
        message: "Enter a valid 10-digit Indian mobile number",
      },
      { status: 400 },
    );
  }

  const baseMessage =
    parsed.data.message ||
    `DongleIQ test ${parsed.data.channel === "sms" ? "SMS" : "WhatsApp"} message sent successfully.`;

  if (parsed.data.channel === "sms") {
    if (!isMsg91SmsConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "MSG91 SMS is not configured. Fill MSG91_AUTH_KEY and MSG91_SENDER_ID.",
        },
        { status: 400 },
      );
    }

    const result = await sendSmsMessage({
      to: normalizedMobile,
      body: baseMessage,
    });

    return NextResponse.json({
      success: true,
      message: "Test SMS sent successfully",
      sid: result.sid,
      status: result.status,
    });
  }

  if (!isMsg91WhatsAppConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message:
          "MSG91 WhatsApp is not configured. Fill MSG91_WHATSAPP_AUTH_KEY, MSG91_WHATSAPP_NUMBER, and MSG91_WHATSAPP_TEXT_URL.",
      },
      { status: 400 },
    );
  }

  const result = await sendWhatsAppMessage({
    to: normalizedMobile,
    body: baseMessage,
  });

  return NextResponse.json({
    success: true,
    message: "Test WhatsApp message sent successfully",
    sid: result.sid,
    status: result.status,
  });
};

export const POST = withAuth(handler, {
  requireAuth: true,
  requireRoles: ["admin", "superadmin"],
});
