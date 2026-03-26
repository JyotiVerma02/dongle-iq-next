import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";

export async function GET() {
  await connectDB();

  const users = await User.find().sort({ createdAt: -1 });

  return Response.json({
    success: true,
    users
  });
}