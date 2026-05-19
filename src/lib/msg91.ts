import { normalizeIndianMobile } from "@/lib/phone";

export type Msg91MessageResult = {
  sid: string;
  status: string | null;
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
}

function formatIndianMobile(input: string) {
  const normalized = normalizeIndianMobile(input);

  if (!/^[6-9]\d{9}$/.test(normalized)) {
    throw new Error("A valid 10-digit Indian mobile number is required");
  }

  return normalized;
}

export function isSmsNotificationsEnabled() {
  return process.env.FEATURE_SMS_NOTIFICATIONS_ENABLED !== "false";
}

export function isWhatsAppNotificationsEnabled() {
  return process.env.FEATURE_WHATSAPP_ENABLED === "true";
}

export function isMsg91SmsConfigured() {
  return Boolean(process.env.MSG91_AUTH_KEY && process.env.MSG91_SENDER_ID);
}

export function isMsg91WhatsAppConfigured() {
  return Boolean(
    process.env.MSG91_WHATSAPP_AUTH_KEY &&
      process.env.MSG91_WHATSAPP_NUMBER &&
      process.env.MSG91_WHATSAPP_TEXT_URL,
  );
}

export async function sendSmsMessage(params: {
  to: string;
  body: string;
}): Promise<Msg91MessageResult> {
  const response = await fetch(
    process.env.MSG91_SMS_URL || "https://api.msg91.com/api/v2/sendsms",
    {
      method: "POST",
      headers: {
        authkey: getRequiredEnv("MSG91_AUTH_KEY"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: getRequiredEnv("MSG91_SENDER_ID"),
        route: process.env.MSG91_ROUTE || "4",
        country: "91",
        sms: [
          {
            message: params.body,
            to: [formatIndianMobile(params.to)],
          },
        ],
      }),
      cache: "no-store",
    },
  );

  const data = (await response.json().catch(() => null)) as
    | {
        type?: string;
        request_id?: string;
        message?: string;
      }
    | null;

  if (!response.ok) {
    throw new Error(
      data?.message || `MSG91 SMS request failed with status ${response.status}`,
    );
  }

  return {
    sid: data?.request_id || `msg91-sms-${Date.now()}`,
    status: data?.type || "submitted",
  };
}

export async function sendWhatsAppMessage(params: {
  to: string;
  body: string;
}): Promise<Msg91MessageResult> {
  const response = await fetch(getRequiredEnv("MSG91_WHATSAPP_TEXT_URL"), {
    method: "POST",
    headers: {
      authkey: getRequiredEnv("MSG91_WHATSAPP_AUTH_KEY"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      integrated_number: getRequiredEnv("MSG91_WHATSAPP_NUMBER"),
      content_type: "text",
      payload: {
        type: "text",
        text: params.body,
      },
      recipients: [
        {
          recipient_type: "individual",
          to: `91${formatIndianMobile(params.to)}`,
        },
      ],
    }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as
    | {
        request_id?: string;
        message?: string;
        type?: string;
      }
    | null;

  if (!response.ok) {
    throw new Error(
      data?.message ||
        `MSG91 WhatsApp request failed with status ${response.status}. MSG91 WhatsApp may require an active session or approved template setup.`,
    );
  }

  return {
    sid: data?.request_id || `msg91-wa-${Date.now()}`,
    status: data?.type || "submitted",
  };
}
