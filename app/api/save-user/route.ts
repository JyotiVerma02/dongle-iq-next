import { NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    console.log("📦 Incoming Data:", body);

    if (!body.name || !body.pan || !body.email || !body.mobile) {
      return NextResponse.json({
        success: false,
        message: "Required fields missing"
      });
    }

    // ✅ FIND USER
    const user = await User.findOne({ number: body.mobile });

    if (user) {
      // ✅ FORCE UPDATE FIELD BY FIELD (IMPORTANT)
      user.name = body.name;
      user.email = body.email;
      user.gender = body.gender;
      user.dob = body.dob;
      user.pan = body.pan;
      user.ekycId = body.ekycId;
      user.ekycPin = body.ekycPin;
      user.bpCode = body.bpCode;
      user.address = body.address;
      user.pincode = body.pincode;
      user.city = body.city;
      user.state = body.state;
      user.certificateClass = body.certificateClass;
      user.tokenType = body.tokenType;
      user.certType = body.certType;
      user.validity = body.validity;
      user.addressProof = body.addressProof;
      user.idProof = body.idProof;
      user.photo = body.photo;
      user.internalRemarks = body.internalRemarks;
      user.price = body.price;

      await user.save();

      return NextResponse.json({
        success: true,
        message: "User updated successfully"
      });
    }

    // ✅ CREATE NEW USER
    await User.create({
      ...body,
      number: body.mobile,
      password: "temp123"
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully"
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("🔥 ERROR:", error);

    return NextResponse.json({
      success: false,
      message: error.message
    });
  }
}