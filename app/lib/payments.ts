import mongoose from "mongoose";

import { calculatePricing } from "@/app/lib/pricing";
import Payment from "@/model/payment";
import User from "@/model/user";
import type { RazorpayPayment } from "@/app/lib/razorpay";

const DEFAULT_GST_RATE = 18;

export type PaymentBreakdown = {
  certificate: number;
  token: number;
  assisted: number;
  discount: number;
  subtotal: number;
  gst: number;
  total: number;
};

type PaymentNote = {
  timestamp: Date;
  action: string;
  by: string;
  details: string;
};

type InvoiceUser = {
  _id?: string;
  name?: string;
  email?: string;
  number?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pan?: string;
  dscId?: string;
  certType?: string;
  validity?: string;
  tokenType?: string;
};

type PaymentDocumentLike = {
  _id: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  breakdown?: Partial<PaymentBreakdown>;
  invoiceNumber?: string;
  invoiceDate?: Date;
  invoiceUrl?: string;
  razorpayPaymentId?: string;
  transactionId?: string;
  referenceNumber?: string;
  method?: string;
  webhookData?: unknown;
  validationErrors?: string[];
  status?: string;
  notes?: PaymentNote[];
  gstNumber?: string;
  gstRate?: number;
  dscId?: string;
  orderDetails?: {
    certificateType?: string;
    certificateValidity?: string;
    tokenType?: string;
  };
  statusDisplay?: string;
  save: () => Promise<unknown>;
};

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function buildPaymentBreakdown(user: {
  certType?: string;
  validity?: string;
  tokenType?: string;
  assistedService?: string;
  price?: number;
  gst?: number;
}) {
  const pricing = calculatePricing({
    certType: user.certType,
    validity: user.validity,
    tokenType: user.tokenType,
    assistedService: user.assistedService,
  });

  const subtotal =
    typeof user.price === "number" && user.price > 0 ? user.price : pricing.total;
  const gst = typeof user.gst === "number" && user.gst > 0
    ? roundCurrency(user.gst)
    : roundCurrency((subtotal * DEFAULT_GST_RATE) / 100);
  const total = roundCurrency(subtotal + gst);

  return {
    certificate: pricing.certificate,
    token: pricing.token,
    assisted: pricing.assisted,
    discount: 0,
    subtotal: roundCurrency(subtotal),
    gst,
    total,
  } satisfies PaymentBreakdown;
}

export function amountToPaise(amount: number) {
  return Math.round(amount * 100);
}

export function createInvoiceNumber(date = new Date()) {
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DIQ-INV-${stamp}-${random}`;
}

export function createPaymentReceipt(paymentId: string) {
  return `diq-${paymentId.slice(-10)}-${Date.now().toString().slice(-6)}`;
}

export function mapGatewayStatus(status: string) {
  switch (status) {
    case "captured":
      return "completed";
    case "authorized":
    case "created":
      return "processing";
    case "failed":
      return "failed";
    case "refunded":
      return "refunded";
    default:
      return "processing";
  }
}

export async function markUserPaymentState(
  userId: mongoose.Types.ObjectId | string,
  status: "paid" | "pending" | "unpaid",
  gst?: number,
) {
  await User.findByIdAndUpdate(userId, {
    paymentStatus: status,
    ...(typeof gst === "number" ? { gst } : {}),
  });
}

export async function finalizeCapturedPayment(params: {
  paymentDocument: PaymentDocumentLike;
  gatewayPayment: Pick<RazorpayPayment, "id" | "order_id"> & Record<string, unknown>;
  source: "webhook" | "checkout-verification" | "admin";
}) {
  const { paymentDocument, gatewayPayment, source } = params;
  const now = new Date();

  if (!paymentDocument.invoiceNumber) {
    paymentDocument.invoiceNumber = createInvoiceNumber(now);
  }

  paymentDocument.status = "verified";
  paymentDocument.invoiceDate = paymentDocument.invoiceDate || now;
  paymentDocument.razorpayPaymentId = gatewayPayment.id;
  paymentDocument.transactionId = gatewayPayment.id;
  paymentDocument.referenceNumber = gatewayPayment.order_id;
  paymentDocument.method = "razorpay";
  paymentDocument.webhookData = gatewayPayment;
  paymentDocument.validationErrors = [];
  paymentDocument.notes = [
    ...(paymentDocument.notes || []),
    {
      timestamp: now,
      action: "payment_verified",
      by: source === "admin" ? "admin" : "system",
      details: `Payment captured through ${source}`,
    },
  ];

  await paymentDocument.save();
  await markUserPaymentState(paymentDocument.userId, "paid", paymentDocument.breakdown?.gst);

  return paymentDocument;
}

export async function markPaymentFailed(params: {
  paymentDocument: PaymentDocumentLike;
  details?: Record<string, unknown>;
  reason?: string;
  source: "webhook" | "checkout-verification" | "admin";
}) {
  const { paymentDocument, details, reason, source } = params;

  paymentDocument.status = "failed";
  paymentDocument.webhookData = details || paymentDocument.webhookData;
  paymentDocument.validationErrors = reason ? [reason] : paymentDocument.validationErrors;
  paymentDocument.notes = [
    ...(paymentDocument.notes || []),
    {
      timestamp: new Date(),
      action: "payment_failed",
      by: source === "admin" ? "admin" : "system",
      details: reason || `Payment failed via ${source}`,
    },
  ];

  await paymentDocument.save();
  await markUserPaymentState(paymentDocument.userId, "unpaid");

  return paymentDocument;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: Date | string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function buildInvoiceHtml(params: {
  payment: PaymentDocumentLike;
  user: InvoiceUser;
  company?: {
    name: string;
    address: string;
    email: string;
    phone: string;
    gstNumber?: string;
  };
}) {
  const { payment, user } = params;
  const company = params.company || {
    name: "Dongle IQ",
    address: process.env.OFFICE_ADDRESS || "Office address not configured",
    email: process.env.SUPPORT_EMAIL || "support@dongleiq.com",
    phone: process.env.CONTACT_PHONE || "",
    gstNumber: payment.gstNumber || process.env.COMPANY_GST_NUMBER || "",
  };

  const rows = [
    ["Certificate", payment.breakdown?.certificate || 0],
    ["USB Token", payment.breakdown?.token || 0],
    ["Assisted Service", payment.breakdown?.assisted || 0],
    ["Discount", -(payment.breakdown?.discount || 0)],
  ]
    .filter(([, amount]) => Number(amount) !== 0)
    .map(
      ([label, amount]) => `
        <tr>
          <td>${escapeHtml(String(label))}</td>
          <td style="text-align:right">${formatCurrency(Number(amount))}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice ${escapeHtml(payment.invoiceNumber || "")}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #f4f7fb; color: #10212b; }
      .page { max-width: 900px; margin: 24px auto; background: #fff; padding: 40px; box-shadow: 0 12px 40px rgba(16,33,43,0.08); }
      .header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #dce8f2; padding-bottom: 20px; }
      .brand h1 { margin: 0; font-size: 32px; letter-spacing: 0.04em; }
      .muted { color: #5f7384; font-size: 13px; line-height: 1.5; }
      .section { margin-top: 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
      .card { border: 1px solid #dce8f2; border-radius: 12px; padding: 18px; }
      h2 { margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.14em; color: #2f6d8c; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th, td { padding: 12px 10px; border-bottom: 1px solid #e6eef5; font-size: 14px; }
      th { text-align: left; color: #5f7384; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
      .totals { margin-top: 16px; margin-left: auto; width: 320px; }
      .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
      .grand { border-top: 2px solid #10212b; font-weight: 700; font-size: 18px; margin-top: 8px; padding-top: 12px; }
      .footer { margin-top: 32px; color: #5f7384; font-size: 12px; line-height: 1.6; }
      @media print { body { background: #fff; } .page { margin: 0; box-shadow: none; } }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <div class="brand">
          <div class="muted">Tax Invoice</div>
          <h1>${escapeHtml(company.name)}</h1>
          <div class="muted">${escapeHtml(company.address)}</div>
          <div class="muted">${escapeHtml(company.email)}${company.phone ? ` | ${escapeHtml(company.phone)}` : ""}</div>
          ${company.gstNumber ? `<div class="muted">GSTIN: ${escapeHtml(company.gstNumber)}</div>` : ""}
        </div>
        <div>
          <div class="muted">Invoice No</div>
          <div><strong>${escapeHtml(payment.invoiceNumber || "-")}</strong></div>
          <div class="muted" style="margin-top:12px;">Invoice Date</div>
          <div><strong>${formatDate(payment.invoiceDate)}</strong></div>
          <div class="muted" style="margin-top:12px;">Payment Ref</div>
          <div><strong>${escapeHtml(payment.razorpayPaymentId || payment.transactionId || "-")}</strong></div>
        </div>
      </div>

      <div class="section">
        <div class="card">
          <h2>Billed To</h2>
          <div><strong>${escapeHtml(user.name || "Customer")}</strong></div>
          <div class="muted">${escapeHtml(user.email || "-")}</div>
          <div class="muted">${escapeHtml(user.number || "-")}</div>
          <div class="muted">${escapeHtml([user.address, user.city, user.state, user.pincode].filter(Boolean).join(", ") || "-")}</div>
          ${user.pan ? `<div class="muted">PAN: ${escapeHtml(user.pan)}</div>` : ""}
        </div>
        <div class="card">
          <h2>Service Details</h2>
          <div class="muted">DSC ID: ${escapeHtml(payment.dscId || user.dscId || "-")}</div>
          <div class="muted">Certificate Type: ${escapeHtml(payment.orderDetails?.certificateType || user.certType || "-")}</div>
          <div class="muted">Validity: ${escapeHtml(payment.orderDetails?.certificateValidity || user.validity || "-")}</div>
          <div class="muted">Token: ${escapeHtml(payment.orderDetails?.tokenType || user.tokenType || "-")}</div>
          <div class="muted">Status: ${escapeHtml(payment.statusDisplay || payment.status || "-")}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row"><span>Subtotal</span><strong>${formatCurrency(payment.breakdown?.subtotal || 0)}</strong></div>
        <div class="totals-row"><span>GST (${payment.gstRate || DEFAULT_GST_RATE}%)</span><strong>${formatCurrency(payment.breakdown?.gst || 0)}</strong></div>
        <div class="totals-row grand"><span>Total</span><strong>${formatCurrency(payment.breakdown?.total || 0)}</strong></div>
      </div>

      <div class="footer">
        This is a system-generated invoice for the DSC application payment. For support, contact ${escapeHtml(company.email)}.
      </div>
    </div>
  </body>
</html>`;
}

export async function getPaymentWithUser(paymentId: string) {
  return Payment.findById(paymentId).populate("userId", "-password");
}
