import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/app/lib/auth";

export type AuthToken = {
  userId: string;
  role: "user" | "admin" | "operator" | "superadmin";
};

export type AuthMiddlewareOptions = {
  requireAuth?: boolean;
  requireRoles?: Array<"user" | "admin" | "operator" | "superadmin">;
  allowPublic?: boolean;
};

const DEFAULT_OPTIONS: AuthMiddlewareOptions = {
  requireAuth: true,
  requireRoles: [],
  allowPublic: false,
};

/**
 * withAuth middleware - Protects API routes with JWT authentication
 * Usage:
 *   const handler = async (req, decoded) => { ... }
 *   export const POST = withAuth(handler, { requireRoles: ["admin"] })
 */
export function withAuth<T extends (...args: any[]) => Promise<any>>(
  handler: (req: NextRequest, decoded: AuthToken) => Promise<any>,
  options: AuthMiddlewareOptions = {}
) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return async (req: NextRequest) => {
    try {
      const token = req.cookies.get("token")?.value;

      // Check if auth is required
      if (config.requireAuth && !token) {
        return NextResponse.json(
          { success: false, message: "Unauthorized - Token required" },
          { status: 401 }
        );
      }

      // If public access is allowed and no token, proceed without auth
      if (config.allowPublic && !token) {
        return handler(req, null as any);
      }

      // Verify token
      let decoded: AuthToken;
      try {
        decoded = verifyAuthToken(token!) as AuthToken;
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "Invalid or expired token",
          },
          { status: 401 }
        );
      }

      // Check role-based access
      if (config.requireRoles && config.requireRoles.length > 0) {
        if (!config.requireRoles.includes(decoded.role)) {
          return NextResponse.json(
            {
              success: false,
              message: `Forbidden - Required roles: ${config.requireRoles.join(", ")}`,
            },
            { status: 403 }
          );
        }
      }

      // Attach decoded token to request for use in handler
      // Create a new request with auth context (Next.js 15+ approach)
      return handler(req, decoded);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Variant: For GET requests
 */
export function withAuthGET<
  T extends (req: NextRequest, decoded: AuthToken) => Promise<any>
>(handler: T, options: AuthMiddlewareOptions = {}) {
  return withAuth(handler, options);
}

/**
 * Variant: For POST requests
 */
export function withAuthPOST<
  T extends (req: NextRequest, decoded: AuthToken) => Promise<any>
>(handler: T, options: AuthMiddlewareOptions = {}) {
  return withAuth(handler, options);
}

/**
 * Variant: Admin-only routes
 */
export function adminOnly<
  T extends (req: NextRequest, decoded: AuthToken) => Promise<any>
>(handler: T) {
  return withAuth(handler, { requireAuth: true, requireRoles: ["admin", "superadmin"] });
}

/**
 * Variant: User-only routes
 */
export function userOnly<
  T extends (req: NextRequest, decoded: AuthToken) => Promise<any>
>(handler: T) {
  return withAuth(handler, {
    requireAuth: true,
    requireRoles: ["user"],
  });
}

/**
 * Variant: Public routes (no auth required, but token optional)
 */
export function publicRoute<
  T extends (req: NextRequest, decoded: AuthToken | null) => Promise<any>
>(handler: T) {
  return withAuth(handler as any, {
    requireAuth: false,
    allowPublic: true,
  });
}
