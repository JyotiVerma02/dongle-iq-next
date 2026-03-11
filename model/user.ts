import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  number: string;
  password: string;
  role: string;
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

const UserSchema: Schema = new Schema(
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  number: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },

  isVerified: { type: Boolean, default: false },

  otp: { type: String },
  otpExpiry: { type: Date },

  resetToken: { type: String },
  resetTokenExpiry: { type: Date }
},
{ timestamps: true }
);

const User: Model<IUser> =
mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;