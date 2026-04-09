import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/model/user";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";

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

    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    const emailTaken = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: admin._id },
    });

    if (emailTaken) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 }
      );
    }

    const numberTaken = await User.findOne({
      number: normalizedNumber,
      _id: { $ne: admin._id },
    });

    if (numberTaken) {
      return NextResponse.json(
        { success: false, message: "Mobile number already exists" },
        { status: 400 }
      );
    }

    admin.name = String(name).trim();
    admin.email = normalizedEmail;
    admin.number = normalizedNumber;
    admin.role = String(role || admin.role || "admin").trim();

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
