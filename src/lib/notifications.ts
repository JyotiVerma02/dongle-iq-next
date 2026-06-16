import logger from "@/lib/logger";
import {
  isMsg91SmsConfigured,
  isMsg91WhatsAppConfigured,
  isSmsNotificationsEnabled,
  isWhatsAppNotificationsEnabled,
  sendSmsMessage,
  sendWhatsAppMessage,
} from "@/lib/msg91";

function logSkipped(channel: "sms" | "whatsapp", reason: string) {
  logger.info(`[${channel.toUpperCase()}] Notification skipped: ${reason}`);
}

export function buildOtpSmsMessage(otp: string, expiryMinutes = 5) {
  return `DongleIQ OTP: ${otp}. It is valid for ${expiryMinutes} minutes. Do not share this code with anyone.`;
}

export function buildStatusNotificationMessage(params: {
  name?: string;
  status: string;
  remarks?: string;
}) {
  const prefix = params.name ? `Hi ${params.name}, ` : "";
  const normalizedStatus = params.status.toLowerCase();
  const baseMessage =
    normalizedStatus === "approved"
      ? `${prefix}your DSC application has been approved.`
      : normalizedStatus === "rejected"
        ? `${prefix}your DSC application needs changes before approval.`
        : normalizedStatus === "dispatched"
          ? `${prefix}your DSC application dispatch has been initiated.`
          : normalizedStatus === "delivered"
            ? `${prefix}your DSC application has been marked delivered.`
        : normalizedStatus === "issued"
          ? `${prefix}your DSC application has been issued successfully.`
          : `${prefix}your DSC application status is now ${normalizedStatus}.`;

  return params.remarks
    ? `${baseMessage} Remarks: ${params.remarks}`
    : baseMessage;
}

export function buildPaymentSuccessMessage(params: {
  amount: number;
  dscId?: string;
}) {
  const parts = [
    `DongleIQ payment received: INR ${params.amount.toFixed(2)}.`,
    params.dscId ? `DSC ID: ${params.dscId}.` : "",
    "Your application is now being processed.",
  ];

  return parts.filter(Boolean).join(" ");
}

export async function sendOtpViaSms(params: {
  mobileNumber: string;
  otp: string;
  expiryMinutes?: number;
}) {

  console.log("\n================ OTP =================");
  console.log("Mobile:", params.mobileNumber);
  console.log("OTP:", params.otp);
  console.log("======================================\n");

  if (!isSmsNotificationsEnabled()) {
    logSkipped("sms", "feature flag disabled");
    return { sent: false as const, channel: "sms" as const };
  }

  const body = buildOtpSmsMessage(
    params.otp,
    params.expiryMinutes ?? 5
  );

  if (!isMsg91SmsConfigured()) {
    logger.warn("[SMS] MSG91 SMS is not configured; OTP SMS was not sent");

    return { sent: false as const, channel: "sms" as const };
  }

  const result = await sendSmsMessage({
    to: params.mobileNumber,
    body,
  });

  return {
    sent: true as const,
    channel: "sms" as const,
    ...result,
  };
}

export async function sendStatusNotifications(params: {
  mobileNumber?: string;
  name?: string;
  status: string;
  remarks?: string;
}) {
  if (!params.mobileNumber) {
    logSkipped("sms", "missing mobile number");
    return;
  }

  const body = buildStatusNotificationMessage({
    name: params.name,
    status: params.status,
    remarks: params.remarks,
  });

  if (isSmsNotificationsEnabled() && isMsg91SmsConfigured()) {
    try {
      await sendSmsMessage({
        to: params.mobileNumber,
        body,
      });
    } catch (error) {
      logger.error("[SMS] Failed to send status notification", error);
    }
  } else {
    logSkipped("sms", "feature disabled or MSG91 SMS not configured");
  }

  if (isWhatsAppNotificationsEnabled() && isMsg91WhatsAppConfigured()) {
    try {
      await sendWhatsAppMessage({
        to: params.mobileNumber,
        body,
      });
    } catch (error) {
      logger.error("[WHATSAPP] Failed to send status notification", error);
    }
  } else {
    logSkipped("whatsapp", "feature disabled or MSG91 WhatsApp not configured");
  }
}

export async function sendPaymentNotifications(params: {
  mobileNumber?: string;
  amount: number;
  dscId?: string;
}) {
  if (!params.mobileNumber) {
    logSkipped("sms", "missing mobile number");
    return;
  }

  const body = buildPaymentSuccessMessage({
    amount: params.amount,
    dscId: params.dscId,
  });

  if (isSmsNotificationsEnabled() && isMsg91SmsConfigured()) {
    try {
      await sendSmsMessage({
        to: params.mobileNumber,
        body,
      });
    } catch (error) {
      logger.error("[SMS] Failed to send payment notification", error);
    }
  } else {
    logSkipped("sms", "feature disabled or MSG91 SMS not configured");
  }

  if (isWhatsAppNotificationsEnabled() && isMsg91WhatsAppConfigured()) {
    try {
      await sendWhatsAppMessage({
        to: params.mobileNumber,
        body,
      });
    } catch (error) {
      logger.error("[WHATSAPP] Failed to send payment notification", error);
    }
  } else {
    logSkipped("whatsapp", "feature disabled or MSG91 WhatsApp not configured");
  }
}

// ==========================================
// DB Notification Service (Role-based & SSE)
// ==========================================

import Notification from "@/models/notification";
import { broadcastRealtimeEvent } from "@/lib/realtime";

export async function createAdminNotification(params: {
  title: string;
  message: string;
  type?: string;
  metadata?: any;
}) {
  try {
    const notif = await Notification.create({
      recipientType: "ADMIN",
      title: params.title,
      message: params.message,
      type: params.type || "general",
      metadata: params.metadata || {},
    });

    broadcastRealtimeEvent("NOTIFICATION_CREATED", { notification: notif }, { recipientType: "ADMIN" });
    return notif;
  } catch (err) {
    logger.error("[NOTIFICATIONS] Failed to create admin notification", err);
  }
}

export async function createUserNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  metadata?: any;
}) {
  try {
    const notif = await Notification.create({
      recipientType: "USER",
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || "general",
      metadata: params.metadata || {},
    });

    broadcastRealtimeEvent("NOTIFICATION_CREATED", { notification: notif }, { recipientType: "USER", userId: params.userId });
    return notif;
  } catch (err) {
    logger.error("[NOTIFICATIONS] Failed to create user notification", err);
  }
}
