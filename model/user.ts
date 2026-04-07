import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  number: string;
  password: string;
  role: string;
  isVerified: boolean;
  isAadhaarVerified: boolean;
  status: string;

  otp?: string;
  otpExpiry?: Date;
  aadhaarOtp?: string;
  aadhaarOtpExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;

  // ✅ NEW FIELDS
  gender?: string;
  dob?: string;
  pan?: string;
  ekycId?: string;
  ekycPin?: string;
  bpCode?: string;
  address?: string;
  pincode?: string;
  city?: string;
  state?: string;
  certificateClass?: string;
  tokenType?: string;
  certType?: string;
  validity?: string;
  addressProof?: string;
  idProof?: string;
  photo?: string;
  internalRemarks?: string;
  price?: number;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    number: { type: String, unique: false, sparse: false },

    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
    isAadhaarVerified: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    otp: { type: String },
    otpExpiry: { type: Date },

    aadhaarOtp: { type: String },
    aadhaarOtpExpiry: { type: Date },

    resetToken: { type: String },
    resetTokenExpiry: { type: Date },

    // ✅ ADD THESE IN SCHEMA (VERY IMPORTANT)
    gender: { type: String },
    dob: { type: String },
    pan: { type: String },
    ekycId: { type: String },
    ekycPin: { type: String },
    bpCode: { type: String },
    address: { type: String },
    pincode: { type: String },
    city: { type: String },
    state: { type: String },
    certificateClass: { type: String },
    tokenType: { type: String },
    certType: { type: String },
    validity: { type: String },
    addressProof: { type: String },
    idProof: { type: String },
    photo: { type: String },
    internalRemarks: { type: String },
    price: { type: Number },
  },
  { timestamps: true },
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
