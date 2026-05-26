import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import { enforceRateLimit, getClientIp } from "@/lib/security";
import Admin from "@/models/admin";
import AdminInvite from "@/models/adminInvite";
import { verifyInviteTokenHash } from "@/lib/adminInvite";
import { isValidIndianMobile, normalizeIndianMobile } from "@/lib/phone";
import { createAdminWelcomeEmail } from "@/lib/emailTemplates";
import { transporter } from "@/lib/mailer";
import { setAuthenticatedSession } from "@/lib/auth";
import { ADMIN_ROLES, normalizeAdminRole } from "@/lib/adminRoles";

const acceptInviteSchema = z.object({
  token: z.string().trim().min(1, "Invite token is required"),
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  number: z.string().trim().min(10, "Valid mobile number is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
  role: z.enum(ADMIN_ROLES).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `accept-invite:${ip}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)),
          },
        }
      );
    }

    await connectDB();

    const body = await req.json();
    const validation = acceptInviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error:
            validation.error.issues[0]?.message ||
            "Invalid input",
        },
        { status: 400 }
      );
    }

    const { token, name, number, password } = validation.data;
    const normalizedNumber = normalizeIndianMobile(number);

    if (!isValidIndianMobile(normalizedNumber)) {
      return NextResponse.json(
        { error: "Enter a valid Indian mobile number" },
        { status: 400 }
      );
    }

    // Get all pending, non-expired invites and verify token
    const pendingInvites = await AdminInvite.find({
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    let validInvite = null;
    for (const invite of pendingInvites) {
      if (verifyInviteTokenHash(invite.inviteTokenHash, token)) {
        validInvite = invite;
        break;
      }
    }

    if (!validInvite) {
      return NextResponse.json(
        {
          error: "Invalid or expired invitation",
        },
        { status: 400 }
      );
    }

    // Check if email/number already taken
    const existingAdmin = await Admin.findOne({
      $or: [{ email: validInvite.email }, { number: normalizedNumber }],
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          error: "Email or mobile number already in use",
        },
        { status: 400 }
      );
    }

    // Create admin account
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name: String(name).trim(),
      email: validInvite.email,
      number: normalizedNumber,
      password: hashedPassword,
      role: normalizeAdminRole(validInvite.role),
      isVerified: true, // Auto-verified via email invitation
      status: "active",
    });

    // Mark invite as accepted
    validInvite.status = "accepted";
    validInvite.acceptedAt = new Date();
    validInvite.acceptedBy = newAdmin._id;
    await validInvite.save();

    // Send welcome email
    const dashboardUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/dashboard`;
    const welcomeEmail = createAdminWelcomeEmail({
      name,
      dashboardUrl,
    });
    await transporter.sendMail({
      to: validInvite.email,
      subject: welcomeEmail.subject,
      text: welcomeEmail.text,
      html: welcomeEmail.html,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Admin account created successfully",
      },
      { status: 201 }
    );

    await setAuthenticatedSession(
      response,
      {
        userId: String(newAdmin._id),
        role: normalizeAdminRole(newAdmin.role),
        accountType: "admin",
      },
      true,
    );

    return response;
  } catch (error) {
    console.error("Accept Invite Error:", error);

    return NextResponse.json(
      {
        error: "Failed to accept invitation",
      },
      { status: 500 }
    );
  }
}
