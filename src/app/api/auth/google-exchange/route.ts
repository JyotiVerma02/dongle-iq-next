import { NextResponse } from "next/server";

import Admin from "@/models/admin";
import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";
import { enforceRateLimit, getClientIp } from "@/lib/security";
import { setAuthCookie, signAuthToken } from "@/lib/auth";
import { normalizeAdminRole, isAdminRole } from "@/lib/adminRoles";


export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `google-exchange:${ip}`,
      limit: 12,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)) } },
      );
    }

    const body = await req.json();

    const email = String(body.email || "").toLowerCase().trim();
    const name = String(body.name || "").trim();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 401 },
      );
    }

    await connectDB();

    const admin = await Admin.findOne({ email });
    if (admin) {
      if (!admin.isVerified) {
        admin.isVerified = true;
        await admin.save();
      }

      const token = signAuthToken(
        {
          userId: String(admin._id),
          role: normalizeAdminRole(admin.role),
          accountType: "admin",
        },
        "7d",
      );

      const response = NextResponse.json({
        success: true,
        redirectTo: "/admin/dashboard",
      });

      setAuthCookie(response, token, true);

      return response;
    }

    const user = await User.findOne({ email });
    if (user) {
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }

      const token = signAuthToken(
        { userId: String(user._id), role: user.role, accountType: "user" },
        "7d",
      );

      const response = NextResponse.json({
        success: true,
        redirectTo: isAdminRole(user.role) ? "/admin/dashboard" : "/user/dashboard",
      });

      setAuthCookie(response, token, true);

      return response;
    }

    const registerUrl = new URL("/register", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
    registerUrl.searchParams.set("email", email);
    if (name) {
      registerUrl.searchParams.set("name", name);
    }
    registerUrl.searchParams.set("google", "1");

    return NextResponse.json({
      success: true,
      redirectTo: registerUrl.pathname + registerUrl.search,
      needsRegistration: true,
    });
  } catch (error) {
    console.error("Google exchange error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to complete Google login" },
      { status: 500 },
    );
  }
}
