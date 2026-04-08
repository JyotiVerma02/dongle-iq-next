/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";
import cloudinary from "@/app/lib/cloudinary";
import streamifier from "streamifier";

// 🔥 helper to upload buffer to cloudinary
const uploadToCloudinary = async (file: File, folder: string) => {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export async function POST(req: Request) {
  try {
    await connectDB();

    // ✅ GET FORM DATA
    const formData = await req.formData();

    // ✅ TEXT FIELDS
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const pan = formData.get("pan") as string;
    const mobile = formData.get("mobile") as string;

    const gender = formData.get("gender") as string;
    const dob = formData.get("dob") as string;
    const ekycId = formData.get("ekycId") as string;
    const ekycPin = formData.get("ekycPin") as string;
    const bpCode = formData.get("bpCode") as string;

    const address = formData.get("address") as string;
    const pincode = formData.get("pincode") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;

    const certificateClass = formData.get("certificateClass") as string;
    const tokenType = formData.get("tokenType") as string;
    const certType = formData.get("certType") as string;
    const validity = formData.get("validity") as string;

    const internalRemarks = formData.get("internalRemarks") as string;
    const price = Number(formData.get("price"));

    // ✅ FILES
    const photo = formData.get("photo") as File;
    const idProof = formData.get("idProofFile") as File;
    const addressProof = formData.get("addressProofFile") as File;

    // ✅ VALIDATION
    if (!name || !pan || !email || !mobile) {
      return NextResponse.json({
        success: false,
        message: "Required fields missing",
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (
      (photo && !allowedTypes.includes(photo.type)) ||
      (idProof && !allowedTypes.includes(idProof.type)) ||
      (addressProof && !allowedTypes.includes(addressProof.type))
    ) {
      return NextResponse.json({
        success: false,
        message: "Only JPG, PNG, PDF allowed",
      });
    }

    // ✅ UPLOAD FILES TO CLOUDINARY
    let photoUrl = "";
    let idProofUrl = "";
    let addressProofUrl = "";

    if (photo) {
      const res = await uploadToCloudinary(photo, "dongleIQ/photo");
      photoUrl = res.secure_url;
    }

    if (idProof) {
      const res = await uploadToCloudinary(idProof, "dongleIQ/idProof");
      idProofUrl = res.secure_url;
    }

    if (addressProof) {
      const res = await uploadToCloudinary(addressProof, "dongleIQ/addressProof");
      addressProofUrl = res.secure_url;
    }

    // ✅ CHECK EXISTING USER
    const existingUser = await User.findOne({ number: mobile });

    if (existingUser) {
      // 🔄 UPDATE
      existingUser.name = name;
      existingUser.email = email;
      existingUser.gender = gender;
      existingUser.dob = dob;
      existingUser.pan = pan;
      existingUser.ekycId = ekycId;
      existingUser.ekycPin = ekycPin;
      existingUser.bpCode = bpCode;
      existingUser.address = address;
      existingUser.pincode = pincode;
      existingUser.city = city;
      existingUser.state = state;
      existingUser.certificateClass = certificateClass;
      existingUser.tokenType = tokenType;
      existingUser.certType = certType;
      existingUser.validity = validity;
      existingUser.internalRemarks = internalRemarks;
      existingUser.price = price;

      if (photoUrl) existingUser.photo = photoUrl;
      if (idProofUrl) existingUser.idProof = idProofUrl;
      if (addressProofUrl) existingUser.addressProof = addressProofUrl;

      await existingUser.save();

      return NextResponse.json({
        success: true,
        message: "User updated successfully",
      });
    }

    // ✅ CHECK EMAIL
    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return NextResponse.json({
        success: false,
        message: "Email already exists",
      });
    }

    // 🔐 PASSWORD
    const hashedPassword = await bcrypt.hash("temp123", 10);

    // ✅ CREATE USER
    await User.create({
      name,
      email,
      pan,
      number: mobile,
      password: hashedPassword,
      gender,
      dob,
      ekycId,
      ekycPin,
      bpCode,
      address,
      pincode,
      city,
      state,
      certificateClass,
      tokenType,
      certType,
      validity,
      internalRemarks,
      price,
      photo: photoUrl,
      idProof: idProofUrl,
      addressProof: addressProofUrl,
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
    });

  } catch (error: any) {
    console.error("🔥 ERROR:", error);

    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}