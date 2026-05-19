import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import Admin from "@/models/admin";
import { z } from "zod";
import { verifyAuthToken } from "@/lib/auth";
import { broadcastRealtimeEvent } from "@/app/api/realtime/route";

const updateDscSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  mobile: z.string().trim().optional(),
  certificateClass: z.string().optional(),
  certType: z.string().optional(),
  validity: z.string().optional(),
  tokenType: z.string().optional(),
  status: z.string().optional(),
  reason: z.string().optional(),
  resubmissionDocs: z.object({
    photo: z.boolean().optional(),
    idProof: z.boolean().optional(),
    addressProof: z.boolean().optional(),
  }).optional(),
}).strict();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validation = updateDscSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Invalid payload",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const payload = validation.data;

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
        console.error("Token verification failed in PUT dsc-applications route:", err);
      }
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    // Apply basic info edits
    if (payload.name) user.name = payload.name;
    if (payload.email) user.email = payload.email.toLowerCase();
    if (payload.mobile) user.number = payload.mobile;
    if (payload.certificateClass) user.certificateClass = payload.certificateClass;
    if (payload.certType) user.certType = payload.certType;
    if (payload.validity) user.validity = payload.validity;
    if (payload.tokenType) user.tokenType = payload.tokenType;

    // Handle status change & internalRemarks
    if (payload.status) {
      const normalizedStatus = payload.status.toLowerCase();
      user.status = normalizedStatus;
      user.remarksViewed = false; // Reset viewed status when status changes

      let remarks = payload.reason || "";
      user.internalRemarks = normalizedStatus === "approved" ? "" : remarks;

      if (normalizedStatus === "rejected" && payload.resubmissionDocs) {
        user.resubmissionDocs = {
          photo: !!payload.resubmissionDocs.photo,
          idProof: !!payload.resubmissionDocs.idProof,
          addressProof: !!payload.resubmissionDocs.addressProof,
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
        remarks: remarks || `Application status set to ${normalizedStatus}`,
      });
    } else if (payload.reason !== undefined) {
      user.internalRemarks = payload.reason;
    }

    await user.save();

    // Broadcast cache invalidation to client dashboard
    broadcastRealtimeEvent("STATUS_UPDATE", { userId: id });

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
      application: user,
    });
  } catch (error) {
    console.error("UPDATE DSC ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update application",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("DELETE DSC ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete application",
      },
      { status: 500 }
    );
  }
}
