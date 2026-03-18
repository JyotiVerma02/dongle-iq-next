import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/model/user";

export async function POST(req: Request) {
  try {
    const { userId, status } = await req.json();

    await connectDB();

    await User.findByIdAndUpdate(userId, { status });

    return NextResponse.json({ message: "Updated" });

  } catch (error) {
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}