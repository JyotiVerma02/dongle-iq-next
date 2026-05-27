import Admin from "@/models/admin";
import User from "@/models/user";
import { normalizeAdminRole } from "@/lib/adminRoles";

export type ResolvedAdminActor = {
  _id: string;
  name: string;
  email: string;
  role: string;
  toObject?: () => Record<string, unknown>;
};

export async function migrateLegacyAdminUser() {
  const legacyAdmin = await User.findOne({ role: "admin" });

  if (!legacyAdmin) {
    return null;
  }

  let admin = await Admin.findOne({ email: legacyAdmin.email });

  if (!admin) {
    admin = await Admin.create({
      _id: legacyAdmin._id,
      name: legacyAdmin.name,
      email: legacyAdmin.email,
      number: legacyAdmin.number,
      password: legacyAdmin.password,
      role: normalizeAdminRole(legacyAdmin.role),
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

export async function resolveAdminActor(userId: string) {
  const admin = await Admin.findById(userId).select("-password");
  if (admin) {
    return admin;
  }

  const legacyAdmin = await User.findOne({
    _id: userId,
    role: { $in: ["admin", "super_admin"] },
  }).select("-password");

  if (legacyAdmin) {
    const existingAdmin = await Admin.findOne({ email: legacyAdmin.email });

    if (!existingAdmin) {
      const migratedAdmin = await Admin.create({
        _id: legacyAdmin._id,
        name: legacyAdmin.name,
        email: legacyAdmin.email,
        number: legacyAdmin.number,
        password: legacyAdmin.password,
        role: normalizeAdminRole(legacyAdmin.role),
        status: legacyAdmin.status || "pending",
        otp: legacyAdmin.otp,
        otpExpiry: legacyAdmin.otpExpiry,
        isVerified: legacyAdmin.isVerified ?? false,
        resetToken: legacyAdmin.resetToken,
        resetTokenExpiry: legacyAdmin.resetTokenExpiry,
      });

      await User.deleteOne({ _id: legacyAdmin._id });
      return migratedAdmin;
    }

    return {
      _id: String(legacyAdmin._id),
      name: legacyAdmin.name,
      email: legacyAdmin.email,
      role: normalizeAdminRole(legacyAdmin.role),
      toObject: () => ({
        _id: String(legacyAdmin._id),
        name: legacyAdmin.name,
        email: legacyAdmin.email,
        number: legacyAdmin.number,
        role: normalizeAdminRole(legacyAdmin.role),
        status: legacyAdmin.status,
        isVerified: legacyAdmin.isVerified,
        createdAt: legacyAdmin.createdAt,
        updatedAt: legacyAdmin.updatedAt,
      }),
    };
  }

  return Admin.findOne({}).sort({ createdAt: 1 }).select("-password");
}
