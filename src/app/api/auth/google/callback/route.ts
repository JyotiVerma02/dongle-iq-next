import { NextResponse } from "next/server";
import Admin from "@/models/admin";
import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";
import { setAuthCookie, signAuthToken } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (error) {
    return NextResponse.json({ message: `Google OAuth error: ${error}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ message: "Google authorization code is required." }, { status: 400 });
  }

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ message: "Google OAuth is not configured." }, { status: 500 });
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.id_token) {
    return NextResponse.json(
      {
        message: tokenData.error_description || tokenData.error || "Failed to exchange Google authorization code.",
      },
      { status: 500 }
    );
  }

  const payload = JSON.parse(
    Buffer.from(String(tokenData.id_token).split(".")[1] || "", "base64url").toString("utf8")
  ) as { email?: string; email_verified?: boolean; name?: string } | null;
  const email = String(payload?.email || "").toLowerCase();
  const emailVerified = Boolean(payload?.email_verified);

  if (!email || !emailVerified) {
    return NextResponse.json({ message: "Unable to verify Google email address." }, { status: 403 });
  }

  await connectDB();

  const admin = await Admin.findOne({ email });
  if (admin) {
    if (!admin.isVerified) {
      admin.isVerified = true;
      await admin.save();
    }

    const token = signAuthToken({ userId: String(admin._id), role: "admin" }, "7d");

    const response = NextResponse.redirect("/admin/dashboard");
    setAuthCookie(response, token, true);

    return response;
  }

  const user = await User.findOne({ email });
  if (user) {
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = signAuthToken({ userId: String(user._id), role: user.role }, "7d");

    const response = NextResponse.redirect(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
    setAuthCookie(response, token, true);

    return response;
  }

  const redirectUrl = new URL("/signup", req.url);
  redirectUrl.searchParams.set("email", email);

  if (payload?.name) {
    redirectUrl.searchParams.set("name", payload.name);
  }

  redirectUrl.searchParams.set("google", "1");

  return NextResponse.redirect(redirectUrl);
}
