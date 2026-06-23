/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";
import { verifySessionToken } from "@/lib/auth";
import Payment from "@/models/payment";
import SupportTicket from "@/models/supportTicket";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = await verifySessionToken(token);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const latestPayment = await Payment.findOne({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .lean();

    const supportTickets = await SupportTicket.find({ userId: decoded.userId })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .limit(8)
      .lean();

    // Count applications ahead in queue
    const queueLength = await User.countDocuments({
      status: { $in: ["pending", "approved"] },
      createdAt: { $lt: user.createdAt },
      role: { $ne: "admin" }
    });

    const estimatedTimeMinutes = Math.max(15, queueLength * 15);

    return NextResponse.json({
      success: true,
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        number: user.number,
        status: user.status,
        internalRemarks: user.internalRemarks,
        remarksViewed: user.remarksViewed || false,
        resubmissionDocs: user.resubmissionDocs || { photo: false, idProof: false, addressProof: false },
        actionHistory: user.actionHistory || [],
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
        supportTickets: supportTickets.map((ticket) => ({
          _id: String(ticket._id),
          subject: ticket.subject,
          category: ticket.category,
          priority: ticket.priority,
          status: ticket.status,
          lastMessageAt: ticket.lastMessageAt,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          adminNotes: ticket.adminNotes || "",
          assignedTo: ticket.assignedTo || "",
          messages: (ticket.messages || []).map((message: any) => ({
            senderType: message.senderType,
            senderId: message.senderId || "",
            senderName: message.senderName || "",
            message: message.message,
            createdAt: message.createdAt,
          })),
        })),
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
        queueLength,
        estimatedTimeMinutes,
      },
    });
  } catch (error: any) {
    console.error("get-user-data error:", error);
    if (error?.name === "TokenExpiredError" || error?.name === "JsonWebTokenError" || error?.message === "Invalid session") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
