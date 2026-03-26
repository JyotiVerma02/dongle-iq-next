import { connectDB } from "@/app/lib/db";
import AdminModel from "@/model/admin";

export async function GET() {
  try {
    await connectDB();

    const admin = await AdminModel.findOne();

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
