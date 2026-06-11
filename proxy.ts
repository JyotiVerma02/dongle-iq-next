import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_ROLES } from "@/lib/adminRoles";

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
  userId: string;
  email?: string;
  role: string;
  accountType?: "admin" | "user";
  iat?: number;
  exp?: number;
}

const LEGACY_ADMIN_ROLE_SET = new Set<string>([
  ...ADMIN_ROLES,
  "admin",
  "superadmin",
]);

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    return atob(normalized + padding);
  } catch {
    return null;
  }
}

async function createHmacSignature(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );

  const bytes = new Uint8Array(signature);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function validateToken(token: string): Promise<DecodedToken | null> {
  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("Token validation error: JWT_SECRET is not set.");
      return null;
    }

    const [headerPart, payloadPart, signaturePart] = token.split(".");

    if (!headerPart || !payloadPart || !signaturePart) {
      return null;
    }

    const headerJson = decodeBase64Url(headerPart);
    const payloadJson = decodeBase64Url(payloadPart);

    if (!headerJson || !payloadJson) {
      return null;
    }

    const header = JSON.parse(headerJson) as { alg?: string; typ?: string };

    if (header.alg !== "HS256") {
      console.error(`Token validation error: Unsupported JWT alg "${header.alg}".`);
      return null;
    }

    const expectedSignature = await createHmacSignature(
      `${headerPart}.${payloadPart}`,
      secret
    );

    if (expectedSignature !== signaturePart) {
      return null;
    }

    const decoded = JSON.parse(payloadJson) as DecodedToken;

    if (!decoded.userId || !decoded.role) {
      return null;
    }

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Token validation error:", error);
    return null;
  }
}

function getTokenAccountType(decoded: DecodedToken): "admin" | "user" | null {
  if (decoded.accountType === "admin" || decoded.accountType === "user") {
    return decoded.accountType;
  }

  const normalizedRole = String(decoded.role || "").trim().toLowerCase();

  if (normalizedRole === "user") {
    return "user";
  }

  if (LEGACY_ADMIN_ROLE_SET.has(normalizedRole)) {
    return "admin";
  }

  return null;
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
  "/api/admin/register",
  "/api/admin/login",
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

function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/");
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
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const clientIp = getClientIp(request);
  const token = request.cookies.get("token")?.value;

  // ✅ Allow public paths
  if (isPublicPath(pathname)) {
    // Rate limiting for sensitive endpoints
    if (pathname === "/api/login" || pathname === "/api/signup" || pathname === "/api/send-otp") {
      if (isRateLimited(clientIp, 10, 5 * 60 * 1000)) {
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
    if (isApiPath(pathname)) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🔍 Validate token
  const decodedToken = await validateToken(token);

  if (!decodedToken) {
    // Token is invalid or expired
    const response = isApiPath(pathname)
      ? NextResponse.json({ message: "Invalid or expired token" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
      
    response.cookies.delete("token");
    return response;
  }

  const tokenAccountType = getTokenAccountType(decodedToken);

  // 🛡️ Role-based access control
  if (isAdminPath(pathname)) {
    if (tokenAccountType !== "admin") {
      if (isApiPath(pathname)) {
        return NextResponse.json(
          { message: "Unauthorized: Admin access required" },
          { status: 403 }
        );
      }

      return NextResponse.redirect(new URL("/admin/register", request.url));
    }
  }

  if (isUserPath(pathname)) {
    if (tokenAccountType !== "user" && tokenAccountType !== "admin") {
      if (isApiPath(pathname)) {
        return NextResponse.json(
          { message: "Unauthorized: User access required" },
          { status: 403 }
        );
      }

      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ✨ Add user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", decodedToken.userId);
  requestHeaders.set("x-user-email", decodedToken.email || "");
  requestHeaders.set("x-user-role", tokenAccountType || decodedToken.role);

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


