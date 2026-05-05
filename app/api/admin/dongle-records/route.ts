import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/model/user";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find({ role: { $ne: "admin" } })
   .select(
  `_id name email number pan ekycId bpCode
   certType certificateClass tokenType validity status
   addressProof idProof photo internalRemarks
   price commission gst paymentStatus serviceType
   createdAt updatedAt`
)
      .sort({ updatedAt: -1 })
      .lean();

    const records = users.map((user) => {
      const documentCount = [user.addressProof, user.idProof, user.photo].filter(Boolean).length;

 return {
  _id: String(user._id),
  name: user.name || "",
  email: user.email || "",
  mobile: user.number || "",

  // existing...
  pan: user.pan || "",
  ekycId: user.ekycId || "",
  bpCode: user.bpCode || "",

  // 🔥 NEW
  price: user.price || 0,
  commission: user.commission || 0,
  gst: user.gst || 0,
  paymentStatus: user.paymentStatus || "pending",
  serviceType: user.serviceType || "dsc",

  certType: user.certType || "",
  certificateClass: user.certificateClass || "",
  tokenType: user.tokenType || "",
  validity: user.validity || "",
  status: user.status || "pending",

  internalRemarks: user.internalRemarks || "",
  addressProof: user.addressProof || "",
  idProof: user.idProof || "",
  photo: user.photo || "",

  createdAt: user.createdAt,
  updatedAt: user.updatedAt,

  documentCount,
  documentsReady: documentCount === 3,
};
    });

    return NextResponse.json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("DONGLE RECORDS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch dongle records" },
      { status: 500 }
    );
  }
}
