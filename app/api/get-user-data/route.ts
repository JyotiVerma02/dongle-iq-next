/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { verifyAuthToken } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded: any = verifyAuthToken(token);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        number: user.number,
        status: user.status,
        internalRemarks: user.internalRemarks,
        isVerified: user.isVerified,
        isAadhaarVerified: user.isAadhaarVerified,
        pan: user.pan,
        gender: user.gender,
        dob: user.dob,
        ekycId: user.ekycId,
        certificateClass: user.certificateClass,
        certType: user.certType,
        validity: user.validity,
        tokenType: user.tokenType,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        photo: user.photo,
        idProof: user.idProof,
        addressProof: user.addressProof,
        price: user.price,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
