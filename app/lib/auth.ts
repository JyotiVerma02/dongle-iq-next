import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

type AuthTokenPayload = {
  userId: string;
  role: string;
};

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_ISSUER = process.env.JWT_ISSUER || "dongle-iq";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "dongle-iq-app";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

export function signAuthToken(
  payload: AuthTokenPayload,
  expiresIn: "1h" | "7d" = "1h",
) { 
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  }) as AuthTokenPayload;
}

export function setAuthCookie(
  response: NextResponse,
  token: string,
  remember = false,
) {
  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: remember ? 7 * 24 * 60 * 60 : 60 * 60,
  });
}

export function clearAuthCookie(response: NextResponse) {
  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
  });
}
