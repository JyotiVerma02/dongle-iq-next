import { sendWhatsAppMessage as sendMsg91WhatsAppMessage } from "@/app/lib/msg91";

interface WhatsAppResponse {
  success: boolean;
  error?: string;
}

export async function sendWhatsAppMessage(
  mobileNumber: string,
  message: string,
): Promise<WhatsAppResponse> {
  try {
    await sendMsg91WhatsAppMessage({
      to: mobileNumber,
      body: message,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Network error while sending WhatsApp message",
    };
  }
}

export function generateOTPMessage(otp: string, expiryMinutes = 5) {
  return `DongleIQ Aadhaar OTP: ${otp}. It is valid for ${expiryMinutes} minutes.`;
}

export function generateSuccessMessage() {
  return "DongleIQ: Your Aadhaar has been verified successfully for DSC registration.";
}
