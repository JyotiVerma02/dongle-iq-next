import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    // ✅ Basic validation
    if (!body.name || !body.pan || !body.email) {
      return Response.json({
        success: false,
        message: "Required fields missing"
      });
    }

    // ✅ Check duplicate PAN (important)
    const existingUser = await User.findOne({ pan: body.pan });
    if (existingUser) {
      return Response.json({
        success: false,
        message: "User with this PAN already exists"
      });
    }

    // ✅ Save user
    const newUser = await User.create(body);

    return Response.json({
      success: true,
      message: "User saved successfully",
      user: newUser
    });

  } catch (error) {
    console.error("Save User Error:", error);

    return Response.json({
      success: false,
      message: "Server Error"
    });
  }
}