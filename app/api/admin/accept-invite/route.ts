import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/app/lib/mongodb";
import { enforceRateLimit, getClientIp } from "@/app/lib/security";
import Admin from "@/model/admin";
import AdminInvite from "@/model/adminInvite";
import { verifyInviteTokenHash } from "@/app/lib/adminInvite";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";
import { transporter } from "@/app/lib/mailer";
import { setAuthCookie, signAuthToken } from "@/app/lib/auth";

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

    // Find the invite
    const adminInvite = await AdminInvite.findOne({ inviteTokenHash: undefined });
    
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
      role: "admin",
      isVerified: true, // Auto-verified via email invitation
      status: "active",
    });

    // Mark invite as accepted
    validInvite.status = "accepted";
    validInvite.acceptedAt = new Date();
    validInvite.acceptedBy = newAdmin._id;
    await validInvite.save();

    // Send welcome email
    await transporter.sendMail({
      from: `"DongleIQ Admin" <${process.env.EMAIL_USER}>`,
      to: validInvite.email,
      subject: "Welcome to DongleIQ Admin Panel",
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Your admin account has been successfully created.</p>
        
        <p>You can now log in to the admin dashboard:</p>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/dashboard"
           style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Go to Admin Dashboard
        </a>
        
        <p style="color: #666; margin-top: 20px; font-size: 12px;">
          Keep your credentials secure. Never share your password with anyone.
        </p>
      `,
    });

    // Create JWT token
    const jwtToken = signAuthToken(
      {
        userId: String(newAdmin._id),
        role: "admin",
      },
      "7d"
    );

    // Set cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Admin account created successfully",
      },
      { status: 201 }
    );

    setAuthCookie(response, jwtToken, true);

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
