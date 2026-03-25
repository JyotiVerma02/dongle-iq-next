import { NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { sendWhatsAppMessage, generateOTPMessage, generateSuccessMessage } from "@/app/lib/whatsapp";

// In-memory rate limiting (use Redis in production)
const rateLimit = new Map<string, { count: number; timestamp: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(identifier);
  
  if (!limit) {
    rateLimit.set(identifier, { count: 1, timestamp: now });
    return true;
  }
  
  // Reset after 15 minutes
  if (now - limit.timestamp > 15 * 60 * 1000) {
    rateLimit.set(identifier, { count: 1, timestamp: now });
    return true;
  }
  
  // Allow 3 attempts per 15 minutes
  if (limit.count >= 3) {
    return false;
  }
  
  limit.count++;
  rateLimit.set(identifier, limit);
  return true;
}

export async function POST(req: Request) {
  try {
    const { mobile, otp, action = "send-otp" } = await req.json();
    
    await connectDB();
    
    // Validate mobile number
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile number format. Please enter a valid 10-digit number." },
        { status: 400 }
      );
    }
    
    // Rate limiting
    if (!checkRateLimit(mobile)) {
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please try after 15 minutes." },
        { status: 429 }
      );
    }
    
    // SEND OTP
    if (action === "send-otp") {
      // Generate 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      // Find or create user
      let user = await User.findOne({ number: mobile });
      
      if (user) {
        // Update existing user with Aadhaar OTP
        user.aadhaarOtp = generatedOtp;
        user.aadhaarOtpExpiry = otpExpiry;
        await user.save();
      } else {
        // Create temporary user record
        user = await User.create({
          name: "Pending User",
          email: `${mobile}@temp.com`,
          number: mobile,
          password: "temporary",
          role: "user",
          isVerified: false,
          isAadhaarVerified: false,
          status: "pending",
          aadhaarOtp: generatedOtp,
          aadhaarOtpExpiry: otpExpiry,
        });
      }
      
      // Generate WhatsApp message
      const message = generateOTPMessage(generatedOtp, 5);
      
      // Send OTP via WhatsApp using Whapi.Cloud
      const whatsappResult = await sendWhatsAppMessage(mobile, message);
      
      if (!whatsappResult.success) {
        console.error("WhatsApp send failed:", whatsappResult.error);
        
        return NextResponse.json(
          { success: false, message: "Failed to send OTP. Please make sure your WhatsApp number is valid and try again." },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully to your WhatsApp number"
      });
    }
    
    // VERIFY OTP
    if (action === "verify") {
      if (!otp || !/^\d{6}$/.test(otp)) {
        return NextResponse.json(
          { success: false, message: "Invalid OTP format. Please enter a 6-digit OTP." },
          { status: 400 }
        );
      }
      
      // Find user with valid OTP
      const user = await User.findOne({
        number: mobile,
        aadhaarOtp: otp,
        aadhaarOtpExpiry: { $gt: new Date() }
      });
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: "Invalid or expired OTP. Please request a new OTP." },
          { status: 401 }
        );
      }
      
      // Update user record
      user.isAadhaarVerified = true;
      user.status = "approved";
      user.aadhaarOtp = undefined;
      user.aadhaarOtpExpiry = undefined;
      await user.save();
      
      // Send success message via WhatsApp
      const successMessage = generateSuccessMessage();
      await sendWhatsAppMessage(mobile, successMessage).catch(console.error);
      
      return NextResponse.json({
        success: true,
        message: "Aadhaar Verified Successfully",
        user: {
          name: user.name,
          number: user.number,
          isAadhaarVerified: user.isAadhaarVerified
        }
      });
    }
    
    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
    
  } catch (error) {
    console.error("Aadhaar Route Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}