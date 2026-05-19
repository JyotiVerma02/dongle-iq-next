export type PricingInput = {
  certType?: string;
  validity?: string;
  tokenType?: string;
  assistedService?: string;
};

export type PricingBreakdown = {
  certificate: number;
  token: number;
  assisted: number;
  total: number;
};

function normalizeCertType(certType?: string) {
  const value = String(certType || "").trim().toLowerCase();

  if (value === "both" || value === "signing & encryption") {
    return "signing-and-encryption";
  }

  if (value === "signing" || value === "signature") {
    return "signature";
  }

  if (value === "encryption") {
    return "encryption";
  }

  return "";
}

export function calculatePricing({
  certType,
  validity,
  tokenType,
  assistedService,
}: PricingInput): PricingBreakdown {
  let certificate = 0;
  const normalizedCertType = normalizeCertType(certType);

  if (normalizedCertType === "signing-and-encryption") {
    if (validity === "1 Year") certificate = 1200;
    if (validity === "2 Years") certificate = 1779;
    if (validity === "3 Years") certificate = 2400;
  } else if (normalizedCertType === "signature") {
    certificate = 800;
  } else if (normalizedCertType === "encryption") {
    certificate = 800;
  }

  const token = tokenType === "USB Token" || tokenType === "Required" ? 500 : 0;
  const assisted = assistedService === "Required" ? 355 : 0;

  return {
    certificate,
    token,
    assisted,
    total: certificate + token + assisted,
  };
}
