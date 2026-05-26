import { NextRequest, NextResponse } from "next/server";
import { getTokenAdminRole, verifySessionToken } from "@/lib/auth";
import type { AdminRole } from "@/lib/adminRoles";

export type AuthToken = {
  userId: string;
  role: string;
  accountType?: "admin" | "user";
};

export type AuthMiddlewareOptions = {
  requireAuth?: boolean;
  requireRoles?: string[];
  allowPublic?: boolean;
};

const DEFAULT_OPTIONS: AuthMiddlewareOptions = {
  requireAuth: true,
  requireRoles: [],
  allowPublic: false,
};

type AuthenticatedHandler<ResponseType> = (
  req: NextRequest,
  decoded: AuthToken,
) => Promise<ResponseType>;

type PublicHandler<ResponseType> = (
  req: NextRequest,
  decoded: AuthToken | null,
) => Promise<ResponseType>;

/**
 * withAuth middleware - Protects API routes with JWT authentication
 * Usage:
 *   const handler = async (req, decoded) => { ... }
 *   export const POST = withAuth(handler, { requireRoles: ["admin"] })
 */
export function withAuth<ResponseType>(
  handler: PublicHandler<ResponseType>,
  options: AuthMiddlewareOptions & { allowPublic: true; requireAuth?: false },
): (req: NextRequest) => Promise<ResponseType | NextResponse>;
export function withAuth<ResponseType>(
  handler: AuthenticatedHandler<ResponseType>,
  options?: AuthMiddlewareOptions,
): (req: NextRequest) => Promise<ResponseType | NextResponse>;
export function withAuth<ResponseType>(
  handler: AuthenticatedHandler<ResponseType> | PublicHandler<ResponseType>,
  options: AuthMiddlewareOptions = {},
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
        return (handler as PublicHandler<ResponseType>)(req, null);
      }

      // Verify token
      let decoded: AuthToken;
      try {
        decoded = await verifySessionToken(token!) as AuthToken;
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
  ResponseType
>(handler: AuthenticatedHandler<ResponseType>, options: AuthMiddlewareOptions = {}) {
  return withAuth(handler, options);
}

/**
 * Variant: For POST requests
 */
export function withAuthPOST<
  ResponseType
>(handler: AuthenticatedHandler<ResponseType>, options: AuthMiddlewareOptions = {}) {
  return withAuth(handler, options);
}

/**
 * Variant: Admin-only routes
 */
export function adminOnly<
  ResponseType
>(handler: AuthenticatedHandler<ResponseType>) {
  return withAuth(async (req, decoded) => {
    const adminRole = getTokenAdminRole(decoded);

    if (!adminRole) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    return handler(
      req,
      {
        ...decoded,
        role: adminRole,
        accountType: "admin",
      } as AuthToken & { role: AdminRole; accountType: "admin" }
    );
  }, { requireAuth: true });
}

/**
 * Variant: User-only routes
 */
export function userOnly<
  ResponseType
>(handler: AuthenticatedHandler<ResponseType>) {
  return withAuth(handler, {
    requireAuth: true,
    requireRoles: ["user"],
  });
}

/**
 * Variant: Public routes (no auth required, but token optional)
 */
export function publicRoute<
  ResponseType
>(handler: PublicHandler<ResponseType>) {
  return withAuth(handler, {
    requireAuth: false,
    allowPublic: true,
  });
}
