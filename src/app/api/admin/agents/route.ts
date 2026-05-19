import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET() {
  try {
    await connectDB();

    // 🔥 ONLY AGENTS (not admin)
    const agents = await User.find({ role: "user" });

    return Response.json({
      success: true,
      agents,
    });
  } catch {
    return Response.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
