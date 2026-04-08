// eslint-disable-next-line @typescript-eslint/no-unused-vars
import mongoose, { Schema, Document, Model } from "mongoose";


const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    number: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true, // 🔥 NOW NO DUPLICATE
      match: [/^[0-9]{10}$/, "Mobile must be 10 digits"],
    },

    password: {
      type: String,
      required: true,
    },

    role: { type: String, default: "user" },

    isVerified: { type: Boolean, default: false },
    isAadhaarVerified: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // 🔐 PAN VALIDATION
    pan: {
      type: String,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"],
    },

    // 📍 Basic Info
    gender: { type: String },
    dob: { type: String },

    // 📍 KYC
    ekycId: { type: String },
    ekycPin: { type: String },
    bpCode: { type: String },

    // 📍 Address
    address: { type: String },
    pincode: {
      type: String,
      match: [/^[0-9]{6}$/, "Invalid pincode"],
    },
    city: { type: String },
    state: { type: String },

    // 📄 Certificate
    certificateClass: { type: String },
    tokenType: { type: String },
    certType: { type: String },
    validity: { type: String },

    // 📂 Files
    addressProof: { type: String },
    idProof: { type: String },
    photo: { type: String },

    internalRemarks: { type: String },

    price: {
      type: Number,
      min: [0, "Price must be positive"],
    },

    // 🔐 OTP / Tokens
    otp: String,
    otpExpiry: Date,
    aadhaarOtp: String,
    aadhaarOtpExpiry: Date,
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
  
);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;