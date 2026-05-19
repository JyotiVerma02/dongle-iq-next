/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";
import { verifyAuthToken } from "@/lib/auth";
import Payment from "@/models/payment";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = verifyAuthToken(token);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const latestPayment = await Payment.findOne({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      user: {
         _id: String(user._id),
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
        assistedService: user.assistedService,
        paymentStatus: user.paymentStatus,
        latestPayment: latestPayment
          ? {
              _id: String(latestPayment._id),
              amount: latestPayment.amount,
              status: latestPayment.status,
              method: latestPayment.method,
              invoiceNumber: latestPayment.invoiceNumber,
              invoiceDate: latestPayment.invoiceDate,
              invoiceUrl: latestPayment.invoiceUrl,
              razorpayOrderId: latestPayment.razorpayOrderId,
              razorpayPaymentId: latestPayment.razorpayPaymentId,
              createdAt: latestPayment.createdAt,
              updatedAt: latestPayment.updatedAt,
            }
          : null,
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
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
