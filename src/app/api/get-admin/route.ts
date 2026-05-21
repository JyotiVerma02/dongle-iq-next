import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/admin";
import { migrateLegacyAdminUser } from "@/lib/admin";
import { adminOnly } from "@/lib/withAuth";
import type { AuthToken } from "@/lib/withAuth";
import { normalizeAdminRole } from "@/lib/adminRoles";

const handler = async (req: NextRequest, decoded: AuthToken) => {
  try {
    await connectDB();
    await migrateLegacyAdminUser();

    const admin = await Admin.findById(decoded.userId).select("-password");

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        ...admin.toObject(),
        role: normalizeAdminRole(admin.role),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch admin",
      },
      { status: 500 }
    );
  }
};

export const GET = adminOnly(handler);
