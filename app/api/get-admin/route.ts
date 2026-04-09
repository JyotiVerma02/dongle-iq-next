import { connectDB } from "@/app/lib/mongodb";
import User from "@/model/user";

export async function GET() {
  try {
    await connectDB();

    const admin = await User.findOne({ role: "admin" }).select("-password");

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
