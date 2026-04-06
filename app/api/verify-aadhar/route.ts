import { NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";

// Rate limit (same as yours)
const rateLimit = new Map<string, { count: number; timestamp: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(identifier);

  if (!limit) {
    rateLimit.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  if (now - limit.timestamp > 15 * 60 * 1000) {
    rateLimit.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  if (limit.count >= 3) return false;

  limit.count++;
  rateLimit.set(identifier, limit);
  return true;
}

export async function POST(req: Request) {
  try {
    const { mobile, otp, action = "send-otp" } = await req.json();

    await connectDB();

    // ✅ Validate mobile
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ success: false, message: "Invalid mobile number" }, { status: 400 });
    }

    // // ✅ Rate limit
    // if (!checkRateLimit(mobile)) {
    //   return NextResponse.json({ success: false, message: "Too many attempts. Try later." }, { status: 429 });
    // }

    // =========================
    // 🔹 SEND OTP
    // =========================
    if (action === "send-otp") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      let user = await User.findOne({ number: mobile });

      if (!user) {
        user = await User.create({
          name: "Pending User",
          email: `${mobile}@temp.com`,
          number: mobile,
          password: "temporary",
          isVerified: false,
          isAadhaarVerified: false,
          status: "pending",
        });
      }

      user.aadhaarOtp = generatedOtp;
      user.aadhaarOtpExpiry = otpExpiry;
      await user.save();

      // 🔥 Show OTP in console (VERY IMPORTANT)
      console.log("📲 Aadhaar OTP for", mobile, "is:", generatedOtp);

      return NextResponse.json({
        success: true,
        message: "OTP generated (check server console)",
      });
    }

    // =========================
    // 🔹 VERIFY OTP
    // =========================
    if (action === "verify") {
      if (!otp || !/^\d{6}$/.test(otp)) {
        return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 });
      }

      const user = await User.findOne({ number: mobile });

      if (!user) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }

      // ✅ Check OTP
      if (user.aadhaarOtp !== otp) {
        return NextResponse.json({ success: false, message: "Wrong OTP" }, { status: 401 });
      }

      if (!user.aadhaarOtpExpiry || user.aadhaarOtpExpiry < new Date()) {
        return NextResponse.json({ success: false, message: "OTP expired" }, { status: 401 });
      }

      // ✅ Update user
      user.isAadhaarVerified = true;
      user.status = "approved";
      user.aadhaarOtp = undefined;
      user.aadhaarOtpExpiry = undefined;

      await user.save();

      return NextResponse.json({
        success: true,
        message: "Aadhaar Verified Successfully",
        user: {
          number: user.number,
          isAadhaarVerified: user.isAadhaarVerified,
        },
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Aadhaar API Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}