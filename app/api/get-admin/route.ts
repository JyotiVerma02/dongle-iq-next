import { connectDB } from "@/app/lib/mongodb";
import Admin from "@/model/admin";
import { migrateLegacyAdminUser } from "@/app/lib/admin";

export async function GET() {
  try {
    await connectDB();
    await migrateLegacyAdminUser();

    const admin = await Admin.findOne().select("-password");

    return Response.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error(error);
    return Response.json({
      success: false,
      message: "Failed to fetch admin",
    });
  }
}
