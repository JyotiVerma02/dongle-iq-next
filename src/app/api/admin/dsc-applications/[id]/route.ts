import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { z } from "zod";

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
    const updateData: Record<string, unknown> = {};

    if (payload.name) updateData.name = payload.name;
    if (payload.email) updateData.email = payload.email.toLowerCase();
    if (payload.mobile) updateData.number = payload.mobile;
    if (payload.certificateClass) updateData.certificateClass = payload.certificateClass;
    if (payload.certType) updateData.certType = payload.certType;
    if (payload.validity) updateData.validity = payload.validity;
    if (payload.tokenType) updateData.tokenType = payload.tokenType;
    if (payload.status) updateData.status = payload.status;

    // Handle reason by updating internalRemarks
    if (payload.reason !== undefined) {
      const existingUser = await User.findById(id);
      if (existingUser) {
        let remarks: Record<string, unknown> = {};
        if (existingUser.internalRemarks) {
          try {
            remarks = JSON.parse(existingUser.internalRemarks);
          } catch {
            remarks = { raw: existingUser.internalRemarks };
          }
        }
        remarks.reason = payload.reason;
        updateData.internalRemarks = JSON.stringify(remarks);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
      application: updatedUser,
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
