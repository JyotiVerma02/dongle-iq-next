import { NextResponse } from "next/server";

import jwt from "jsonwebtoken";

import Admin from "@/model/admin";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";


export async function POST(req: Request) {
  try {
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

      const token = jwt.sign(
        { userId: admin._id, role: "admin" },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" },
      );

      const response = NextResponse.json({
        success: true,
        redirectTo: "/admin/dashboard",
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: "strict",
      });

      return response;
    }

    const user = await User.findOne({ email });
    if (user) {
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" },
      );

      const response = NextResponse.json({
        success: true,
        redirectTo: user.role === "admin" ? "/admin/dashboard" : "/user/dashboard",
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: "strict",
      });

      return response;
    }

const signupUrl = new URL("/signup", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
    signupUrl.searchParams.set("email", email);
    if (name) {
      signupUrl.searchParams.set("name", name);
    }
    signupUrl.searchParams.set("google", "1");

    return NextResponse.json({
      success: true,
      redirectTo: signupUrl.pathname + signupUrl.search,
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
