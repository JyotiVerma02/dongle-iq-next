// app/lib/whatsapp.ts

const WHAPI_API_KEY = process.env.WHAPI_API_KEY;
const WHAPI_API_URL = process.env.WHAPI_API_URL || "https://gate.whapi.cloud";

interface WhatsAppResponse {
  success: boolean;
  error?: string;
}

// Format phone number for Whapi.Cloud
function formatPhoneNumber(mobileNumber: string): string {
  // Remove any non-digit characters
  let cleaned = mobileNumber.replace(/\D/g, '');
  
  // Remove leading 0 if present
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Check if it already has country code (starts with 91)
  if (!cleaned.startsWith('91')) {
    // Add India country code (+91)
    cleaned = `91${cleaned}`;
  }
  
  return cleaned;
}

export async function sendWhatsAppMessage(
  mobileNumber: string, 
  message: string
): Promise<WhatsAppResponse> {
  try {
    const formattedNumber = formatPhoneNumber(mobileNumber);
    
    const response = await fetch(`${WHAPI_API_URL}/messages/text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedNumber,
        body: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Whapi.Cloud Error:', data);
      return { 
        success: false, 
        error: data.error?.message || 'Failed to send WhatsApp message' 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('WhatsApp Send Error:', error);
    return { 
      success: false, 
      error: 'Network error while sending WhatsApp message' 
    };
  }
}

export function generateOTPMessage(otp: string, expiryMinutes: number = 5): string {
  return `🔐 *Aadhaar Verification OTP*

Your OTP for Aadhaar verification is: *${otp}*

This OTP is valid for ${expiryMinutes} minutes.

*DongleIQ - Secure Aadhaar Verification*`;
}

export function generateSuccessMessage(): string {
  return `✅ *Aadhaar Verified Successfully!*

Your Aadhaar has been successfully verified for DSC registration.

*DongleIQ - Thank you for verification*`;
}