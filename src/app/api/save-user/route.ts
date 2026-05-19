/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import streamifier from "streamifier";

import { connectDB } from "@/lib/mongodb";
import { migrateLegacyAdminUser } from "@/lib/admin";
import { hashField } from "@/lib/encryption";
import { isValidIndianMobile, normalizeIndianMobile } from "@/lib/phone";
import { calculatePricing } from "@/lib/pricing";
import cloudinary from "@/lib/cloudinary";
import User from "@/models/user";

const uploadToCloudinary = async (file: File, folder: string) => {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export async function POST(req: Request) {
  try {
    await connectDB();
    await migrateLegacyAdminUser();

    const formData = await req.formData();

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const pan = String(formData.get("pan") || "")
      .trim()
      .toUpperCase();
    const mobile = normalizeIndianMobile(formData.get("mobile"));

    const gender = String(formData.get("gender") || "").trim();
    const dob = String(formData.get("dob") || "").trim();
    const ekycId = String(formData.get("ekycId") || "").trim();
    const ekycPin = String(formData.get("ekycPin") || "").trim();
    const bpCode = String(formData.get("bpCode") || "").trim();

    const address = String(formData.get("address") || "").trim();
    const pincode = String(formData.get("pincode") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const state = String(formData.get("state") || "").trim();

    const certificateClass = String(
      formData.get("certificateClass") || "",
    ).trim();
    const tokenType = String(formData.get("tokenType") || "").trim();
    const certType = String(formData.get("certType") || "").trim();
    const validity = String(formData.get("validity") || "").trim();
    const assistedService = String(
      formData.get("assistedService") || "Not Required",
    ).trim();

    const internalRemarks = String(
      formData.get("internalRemarks") || "",
    ).trim();

    const photo = formData.get("photo") as File | null;
    const idProof = formData.get("idProofFile") as File | null;
    const addressProof = formData.get("addressProofFile") as File | null;
    const price = calculatePricing({
      certType,
      validity,
      tokenType,
      assistedService,
    }).total;

    if (!name || !pan || !email || !mobile) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields missing",
        },
        { status: 400 },
      );
    }

    if (!isValidIndianMobile(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid Indian mobile number",
        },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (
      (photo && !allowedTypes.includes(photo.type)) ||
      (idProof && !allowedTypes.includes(idProof.type)) ||
      (addressProof && !allowedTypes.includes(addressProof.type))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG and PDF allowed",
        },
        { status: 400 },
      );
    }

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
      const res = await uploadToCloudinary(
        addressProof,
        "dongleIQ/addressProof",
      );
      addressProofUrl = res.secure_url;
    }

    const existingUser = await User.findOne({
      $or: [{ number: mobile }, { email }],
      role: { $ne: "admin" },
    });

    if (existingUser) {
      const emailTakenByAnotherUser = await User.findOne({
        email,
        role: { $ne: "admin" },
        _id: { $ne: existingUser._id },
      });

      if (emailTakenByAnotherUser) {
        return NextResponse.json(
          {
            success: false,
            message: "Email already exists",
          },
          { status: 400 },
        );
      }

      const panTakenByAnotherUser = await User.findOne({
        panHash: hashField(pan),
        role: { $ne: "admin" },
        _id: { $ne: existingUser._id },
      });

      if (panTakenByAnotherUser) {
        return NextResponse.json(
          {
            success: false,
            message: "PAN already exists",
          },
          { status: 400 },
        );
      }

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
      existingUser.assistedService = assistedService;
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

    const hashedPassword = await bcrypt.hash("temp123", 10);

    const panTakenByAnotherUser = await User.findOne({
      panHash: hashField(pan),
      role: { $ne: "admin" },
    });

    if (panTakenByAnotherUser) {
      return NextResponse.json(
        {
          success: false,
          message: "PAN already exists",
        },
        { status: 400 },
      );
    }

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
      assistedService,
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
    console.error("save-user error:", error);

    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      return NextResponse.json(
        {
          success: false,
          message:
            duplicateField === "number"
              ? "Mobile number already exists"
              : "Email already exists",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Server error",
      },
      { status: 500 },
    );
  }
}
