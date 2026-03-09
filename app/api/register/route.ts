import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { registerSchema } from "@/schemas/registerSchema";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    // 1️⃣ Validate basic fields (name, email, password, number)
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.flatten().fieldErrors;
      const message = Object.values(firstError).flat()[0];
      return NextResponse.json({ message }, { status: 400 });
    }

    const { name, email, password, number } = parsed.data;

    // 2️⃣ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Role Logic 🔥
    let role = "user"; // default role

    if (body.role === "admin") {
      if (body.adminKey !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json(
          { message: "Invalid Admin Secret Key" },
          { status: 400 }
        );
      }
      role = "admin";
    }

    // 5️⃣ Create user
    await User.create({
      name,
      email,
      password: hashedPassword,
      number: number ?? undefined,
      role,
    });

    return NextResponse.json(
      { message: `${role} registered successfully` },
      { status: 201 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}