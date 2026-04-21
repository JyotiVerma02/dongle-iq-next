import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// ==================== RATE LIMITER ====================
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count++;
  return false;
}

// ==================== TOKEN VALIDATOR ====================
interface DecodedToken {
  id: string;
  email: string;
  role: "admin" | "user";
  iat: number;
  exp: number;
}

function validateToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as DecodedToken;
    
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error("Token validation error:", error);
    return null;
  }
}

// ==================== ROUTE CONFIGURATIONS ====================
const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/verify-otp",
  "/verify-aadhaar",
  "/admin/register",
  "/api/login",
  "/api/signup",
  "/api/register",
  "/api/send-otp",
  "/api/verify-otp",
  "/api/forgot-password",
  "/api/reset-password",
  "/api/verify",
  "/api/verify-aadhar",
  "/api/resend-otp",
];

const ADMIN_PATHS = [
  "/admin/dashboard",
  "/admin/agents",
  "/api/admin",
];

const USER_PATHS = [
  "/user/dashboard",
  "/api/user-dashboard",
];

// ==================== HELPER FUNCTIONS ====================
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname.startsWith(path));
}

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some(path => pathname.startsWith(path));
}

function isUserPath(pathname: string): boolean {
  return USER_PATHS.some(path => pathname.startsWith(path));
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

// ==================== MAIN MIDDLEWARE ====================
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const clientIp = getClientIp(request);
  const token = request.cookies.get("token")?.value;

  // ✅ Allow public paths
  if (isPublicPath(pathname)) {
    // Rate limiting for sensitive endpoints
    if (pathname === "/api/login" || pathname === "/api/signup" || pathname === "/api/send-otp") {
      if (isRateLimited(clientIp, 5, 15 * 60 * 1000)) {
        return NextResponse.json(
          { message: "Too many requests. Try again later." },
          { status: 429 }
        );
      }
    }
    return NextResponse.next();
  }

  // ❌ Require authentication for protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🔍 Validate token
  const decodedToken = validateToken(token);

  if (!decodedToken) {
    // Token is invalid or expired
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  // 🛡️ Role-based access control
  if (isAdminPath(pathname)) {
    if (decodedToken.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }
  }

  if (isUserPath(pathname)) {
    if (decodedToken.role !== "user" && decodedToken.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: User access required" },
        { status: 403 }
      );
    }
  }

  // ✨ Add user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", decodedToken.id);
  requestHeaders.set("x-user-email", decodedToken.email);
  requestHeaders.set("x-user-role", decodedToken.role);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 🔒 Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: [
    // Public routes
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify/:path*",
    "/admin/register",
    "/bank-telecom-form",
    "/preview",
    
    // Protected routes
    "/admin/:path*",
    "/user/:path*",
    "/api/:path*",
  ],
};