import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import { resolveAdminActor } from "@/lib/admin";
import { createAdminInviteEmail } from "@/lib/emailTemplates";
import { transporter } from "@/lib/mailer";
import { enforceRateLimit, getClientIp } from "@/lib/security";
import Admin from "@/models/admin";
import AdminInvite from "@/models/adminInvite";
import { adminOnly } from "@/lib/withAuth";
import type { AuthToken } from "@/lib/withAuth";
import {
  generateInviteToken,
  getInviteExpiryDate,
} from "@/lib/adminInvite";
import {
  ADMIN_ROLES,
  hasAdminPermission,
  normalizeAdminRole,
} from "@/lib/adminRoles";

const inviteSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  role: z.enum(ADMIN_ROLES).default("reviewer"),
});

function getAppBaseUrl(req: NextRequest) {
  const origin = req.nextUrl.origin;

  if (origin && origin !== "null") {
    return origin;
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

const postHandler = async (req: NextRequest, decoded: AuthToken) => {
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

    if (!hasAdminPermission(decoded.role, "invite_admin")) {
      return NextResponse.json(
        { error: "Forbidden - You do not have permission to invite admins" },
        { status: 403 }
      );
    }

    // Verify inviting admin exists
    const invitingAdmin = await resolveAdminActor(decoded.userId);
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

    const { email: inviteEmail, role } = validation.data;
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
      role: normalizeAdminRole(role),
      expiresAt,
    });

    // Send invite email
    const inviteLink = `${getAppBaseUrl(req)}/admin/accept-invite?token=${inviteToken}`;

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
};

const getHandler = async (req: NextRequest, decoded: AuthToken) => {
  try {
    await connectDB();

    if (!hasAdminPermission(decoded.role, "invite_admin")) {
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
};

export const POST = adminOnly(postHandler);
export const GET = adminOnly(getHandler);
