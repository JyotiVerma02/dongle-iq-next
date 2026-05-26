import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, deleteAuthSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (token) {
    try {
      await deleteAuthSession(token);
    } catch {
      // Always clear the cookie even if the token is already invalid.
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  clearAuthCookie(response);

  return response;
}
