export function normalizeIndianMobile(input: unknown) {
  const raw = String(input ?? "").trim();
  const digits = raw.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }

  return digits;
}

export function isValidIndianMobile(input: unknown) {
  const normalized = normalizeIndianMobile(input);
  return /^[6-9]\d{9}$/.test(normalized);
}

export function formatIndianMobileLabel(input: unknown) {
  const normalized = normalizeIndianMobile(input);
  return normalized ? `+91 ${normalized}` : "+91";
}
