import crypto from "crypto";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

export function generateNumericOtp(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length;
  return crypto.randomInt(min, max).toString();
}

export function hashOtp(otp: string) {
  return crypto
    .createHash("sha256")
    .update(`${otp}:${process.env.OTP_SECRET || process.env.JWT_SECRET || "dongle-iq-otp"}`)
    .digest("hex");
}

export function verifyOtpHash(storedHash: string | undefined, inputOtp: string) {
  if (!storedHash) return false;

  const inputHash = hashOtp(inputOtp);
  const left = Buffer.from(storedHash);
  const right = Buffer.from(inputHash);

  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export function enforceRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const current = rateLimitStore.get(options.key);

  if (!current || now >= current.resetAt) {
    rateLimitStore.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      allowed: true,
      retryAfterMs: 0,
    };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      retryAfterMs: Math.max(0, current.resetAt - now),
    };
  }

  current.count += 1;
  rateLimitStore.set(options.key, current);

  return {
    allowed: true,
    retryAfterMs: 0,
  };
}

export function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
