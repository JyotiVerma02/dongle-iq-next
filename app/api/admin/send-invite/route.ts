import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/app/lib/mongodb";
import { verifyAuthToken } from "@/app/lib/auth";
import { createAdminInviteEmail } from "@/app/lib/emailTemplates";
import { transporter } from "@/app/lib/mailer";
import { enforceRateLimit, getClientIp } from "@/app/lib/security";
import Admin from "@/model/admin";
import AdminInvite from "@/model/adminInvite";
import {
  generateInviteToken,
  getInviteExpiryDate,
} from "@/app/lib/adminInvite";

const inviteSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

type DecodedToken = {
  userId: string;
  role: string;
};

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `admin-invite:${ip}`,
      limit: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many invite attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)),
          },
        }
      );
    }

    await connectDB();

    // Verify admin token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Admin token required" },
        { status: 401 }
      );
    }

    let decoded: DecodedToken;
    try {
      decoded = verifyAuthToken(token) as DecodedToken;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Verify inviting admin exists
    const invitingAdmin = await Admin.findById(decoded.userId);
    if (!invitingAdmin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validation = inviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error:
            validation.error.issues[0]?.message ||
            "Invalid email address",
        },
        { status: 400 }
      );
    }

    const { email: inviteEmail } = validation.data;
    const normalizedEmail = inviteEmail.toLowerCase();

    // Check if email already has admin account
    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          error: "This email already has an admin account",
        },
        { status: 400 }
      );
    }

    // Check if invite already exists and is still pending
    const existingInvite = await AdminInvite.findOne({
      email: normalizedEmail,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      return NextResponse.json(
        {
          error: "An active invite already exists for this email",
        },
        { status: 400 }
      );
    }

    // Generate invite token
    const { token: inviteToken, hash: inviteTokenHash } =
      generateInviteToken();
    const expiresAt = getInviteExpiryDate(7);

    // Create invite record
    const adminInvite = await AdminInvite.create({
      email: normalizedEmail,
      inviteToken,
      inviteTokenHash,
      invitedBy: decoded.userId,
      expiresAt,
    });

    // Send invite email
    const inviteLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/accept-invite?token=${inviteToken}`;

    const inviteEmailContent = createAdminInviteEmail({
      inviteLink,
      invitingAdminName: invitingAdmin.name,
    });
    await transporter.sendMail({
      to: normalizedEmail,
      subject: inviteEmailContent.subject,
      text: inviteEmailContent.text,
      html: inviteEmailContent.html,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Invite sent successfully",
        inviteId: String(adminInvite._id),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin Invite Error:", error);

    return NextResponse.json(
      {
        error: "Failed to send admin invitation",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Verify admin token
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let decoded: DecodedToken;
    try {
      decoded = verifyAuthToken(token) as DecodedToken;
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get pending invites for this admin
    const invites = await AdminInvite.find({
      invitedBy: decoded.userId,
    })
      .sort({ createdAt: -1 })
      .select("-inviteToken"); // Don't return tokens to frontend

    return NextResponse.json(
      {
        success: true,
        invites,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Admin Invites Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch invites",
      },
      { status: 500 }
    );
  }
}
