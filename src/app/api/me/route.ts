import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { user: null },
      { status: 401 }
    );
  }

  try {
    await verifySessionToken(token);
  } catch {
    return NextResponse.json(
      { user: null },
      { status: 401 }
    );
  }

  return NextResponse.json(
    { user: { token } }, // replace with real user later
    { status: 200 }
  );
}