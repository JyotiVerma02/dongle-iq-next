import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { isAdminRole, normalizeAdminRole, type AdminRole } from "@/lib/adminRoles";
import { ensureRedisConnected, redis } from "@/lib/redis";

export type AuthTokenPayload = {
  userId: string;
  role: string;
  accountType?: "admin" | "user";
  sessionId?: string;
};

type StoredSession = {
  userId: string;
  role: string;
  accountType?: "admin" | "user";
  remember: boolean;
  createdAt: string;
};

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_ISSUER = process.env.JWT_ISSUER || "dongle-iq";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "dongle-iq-app";
const SHORT_SESSION_TTL_SECONDS = 60 * 60;
const LONG_SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const SESSION_PREFIX = "auth:session:";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

function getSessionKey(sessionId: string) {
  return `${SESSION_PREFIX}${sessionId}`;
}

function getSessionTtlSeconds(remember: boolean) {
  return remember ? LONG_SESSION_TTL_SECONDS : SHORT_SESSION_TTL_SECONDS;
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

export async function createAuthSession(
  payload: AuthTokenPayload,
  remember = false,
) {
  const sessionId = randomUUID();
  const sessionPayload: AuthTokenPayload = {
    ...payload,
    sessionId,
  };

  const storedSession: StoredSession = {
    userId: payload.userId,
    role: payload.role,
    accountType: payload.accountType,
    remember,
    createdAt: new Date().toISOString(),
  };

  await ensureRedisConnected();
  await redis.set(getSessionKey(sessionId), JSON.stringify(storedSession), {
    EX: getSessionTtlSeconds(remember),
  });

  const token = signAuthToken(sessionPayload, remember ? "7d" : "1h");

  return {
    token,
    sessionId,
  };
}

export async function verifySessionToken(token: string) {
  const decoded = verifyAuthToken(token);

  if (!decoded.sessionId) {
    throw new Error("Invalid session");
  }

  try {
    await ensureRedisConnected();
    const rawSession = await redis.get(getSessionKey(decoded.sessionId));

    if (rawSession) {
      const session = JSON.parse(rawSession) as StoredSession;

      if (
        session.userId !== decoded.userId ||
        session.role !== decoded.role ||
        session.accountType !== decoded.accountType
      ) {
        await redis.del(getSessionKey(decoded.sessionId));
        throw new Error("Session mismatch");
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message === "Session mismatch") {
      throw err;
    }
    console.warn("Redis session check failed or missing, trusting JWT payload:", err);
  }

  return decoded;
}

export async function setAuthenticatedSession(
  response: NextResponse,
  payload: AuthTokenPayload,
  remember = false,
) {
  const { token, sessionId } = await createAuthSession(payload, remember);
  setAuthCookie(response, token, remember);

  return { token, sessionId };
}

export async function deleteAuthSession(token: string) {
  const decoded = verifyAuthToken(token);

  if (!decoded.sessionId) {
    return false;
  }

  await ensureRedisConnected();
  const deleted = await redis.del(getSessionKey(decoded.sessionId));

  return deleted > 0;
}

export function isAdminTokenPayload(payload: AuthTokenPayload | null | undefined) {
  if (!payload) return false;
  if (payload.accountType === "admin") return true;
  return isAdminRole(payload.role);
}

export function getTokenAdminRole(payload: AuthTokenPayload | null | undefined): AdminRole | null {
  if (!isAdminTokenPayload(payload)) return null;
  return normalizeAdminRole(payload?.role);
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
