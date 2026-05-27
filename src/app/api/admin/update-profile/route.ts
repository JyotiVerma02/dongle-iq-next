import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/admin";
import User from "@/models/user";
import { isValidIndianMobile, normalizeIndianMobile } from "@/lib/phone";
import { migrateLegacyAdminUser } from "@/lib/admin";
import { normalizeAdminRole } from "@/lib/adminRoles";

export async function POST(req: Request) {
  try {
    const { name, email, number, role } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedNumber = normalizeIndianMobile(number);

    if (!name || !normalizedEmail || !normalizedNumber) {
      return NextResponse.json(
        { success: false, message: "Name, email, and number are required" },
        { status: 400 }
      );
    }

    if (!isValidIndianMobile(normalizedNumber)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid Indian mobile number" },
        { status: 400 }
      );
    }

    await connectDB();
    await migrateLegacyAdminUser();

    const admin = await Admin.findOne();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    const emailTakenByUser = await User.findOne({ email: normalizedEmail });
    const emailTakenByOtherAdmin = await Admin.findOne({
      email: normalizedEmail,
      _id: { $ne: admin._id },
    });

    if (emailTakenByUser || emailTakenByOtherAdmin) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    const numberTakenByUser = await User.findOne({ number: normalizedNumber });
    const numberTakenByOtherAdmin = await Admin.findOne({
      number: normalizedNumber,
      _id: { $ne: admin._id },
    });

    if (numberTakenByUser || numberTakenByOtherAdmin) {
      return NextResponse.json(
        { success: false, message: "Mobile number already exists" },
        { status: 400 }
      );
    }

    admin.name = String(name).trim();
    admin.email = normalizedEmail;
    admin.number = normalizedNumber;
    admin.role = normalizeAdminRole(String(role || admin.role || "super_admin"));

    await admin.save();

    return NextResponse.json({
      success: true,
      message: "Admin profile updated successfully",
      admin,
    });
  } catch (error) {
    console.error("ADMIN UPDATE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update admin profile" },
      { status: 500 }
    );
  }
}
