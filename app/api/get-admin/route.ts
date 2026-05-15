import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Admin from "@/model/admin";
import { migrateLegacyAdminUser } from "@/app/lib/admin";
import { adminOnly } from "@/app/lib/withAuth";
import type { AuthToken } from "@/app/lib/withAuth";

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
      admin,
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
