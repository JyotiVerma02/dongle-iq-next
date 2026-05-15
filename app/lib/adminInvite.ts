import crypto from "crypto";

export function generateInviteToken(): {
  token: string;
  hash: string;
} {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  return { token, hash };
}

export function hashInviteToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export function verifyInviteTokenHash(
  storedHash: string,
  providedToken: string
): boolean {
  const providedHash = hashInviteToken(providedToken);
  const left = Buffer.from(storedHash);
  const right = Buffer.from(providedHash);

  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function getInviteExpiryDate(daysValid = 7): Date {
  return new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);
}
