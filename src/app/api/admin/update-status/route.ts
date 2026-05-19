import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { sendStatusNotifications } from "@/lib/notifications";
import User from "@/models/user";
import Admin from "@/models/admin";
import { verifyAuthToken } from "@/lib/auth";
import { broadcastRealtimeEvent } from "@/app/api/realtime/route";

export async function POST(req: Request) {
  try {
    const { userId, status, internalRemarks, resubmissionDocs } = await req.json();

    if (!userId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing data" },
        { status: 400 }
      );
    }

    const normalizedStatus = String(status).toLowerCase();
    const remarks = typeof internalRemarks === "string" ? internalRemarks.trim() : "";

    if (!["pending", "approved", "rejected", "issued"].includes(normalizedStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    if (normalizedStatus === "rejected" && !remarks) {
      return NextResponse.json(
        { success: false, message: "Rejection reason is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch admin details from cookie token
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    let adminNameAndEmail = "Admin";
    if (token) {
      try {
        const decoded = verifyAuthToken(token) as { userId: string };
        const adminUser = await Admin.findById(decoded.userId);
        if (adminUser) {
          adminNameAndEmail = `${adminUser.name} (${adminUser.email})`;
        }
      } catch (err) {
        console.error("Token verification failed in update-status route:", err);
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    user.status = normalizedStatus;
    user.internalRemarks = normalizedStatus === "approved" ? "" : remarks;
    user.remarksViewed = false;

    if (normalizedStatus === "rejected" && resubmissionDocs) {
      user.resubmissionDocs = {
        photo: !!resubmissionDocs.photo,
        idProof: !!resubmissionDocs.idProof,
        addressProof: !!resubmissionDocs.addressProof,
      };
    } else {
      user.resubmissionDocs = {
        photo: false,
        idProof: false,
        addressProof: false,
      };
    }

    user.actionHistory.push({
      action: normalizedStatus,
      performedBy: adminNameAndEmail,
      timestamp: new Date(),
      remarks: remarks || `Application set to ${normalizedStatus}`,
    });

    await user.save();

    // Send notifications (SMS/Email)
    await sendStatusNotifications({
      mobileNumber: user.number,
      name: user.name,
      status: normalizedStatus,
      remarks,
    });

    // Invalidate user cache via real-time EventSource broadcast
    broadcastRealtimeEvent("STATUS_UPDATE", { userId: user._id.toString() });

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      user,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
