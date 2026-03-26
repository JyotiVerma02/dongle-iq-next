import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  name: String,
  email: String,
  number: String,
  role: String,
  status: String,
  otp: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AdminModel =
  mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export default AdminModel;