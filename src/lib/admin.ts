import Admin from "@/models/admin";
import User from "@/models/user";

export async function migrateLegacyAdminUser() {
  const legacyAdmin = await User.findOne({ role: "admin" });

  if (!legacyAdmin) {
    return null;
  }

  let admin = await Admin.findOne({ email: legacyAdmin.email });

  if (!admin) {
    admin = await Admin.create({
      name: legacyAdmin.name,
      email: legacyAdmin.email,
      number: legacyAdmin.number,
      password: legacyAdmin.password,
      role: "admin",
      status: legacyAdmin.status || "pending",
      otp: legacyAdmin.otp,
      otpExpiry: legacyAdmin.otpExpiry,
      isVerified: legacyAdmin.isVerified ?? false,
      resetToken: legacyAdmin.resetToken,
      resetTokenExpiry: legacyAdmin.resetTokenExpiry,
    });
  }

  await User.deleteOne({ _id: legacyAdmin._id });

  return admin;
}

export async function findAdminByIdentifier(identifier: { email?: string; number?: string }) {
  await migrateLegacyAdminUser();

  if (identifier.email) {
    return Admin.findOne({ email: identifier.email });
  }

  if (identifier.number) {
    return Admin.findOne({ number: identifier.number });
  }

  return null;
}
