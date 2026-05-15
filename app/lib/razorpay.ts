import crypto from "crypto";

const RAZORPAY_BASE_URL = "https://api.razorpay.com/v1";

export function isMockPaymentGatewayEnabled() {
  if (process.env.USE_MOCK_PAYMENT_GATEWAY === "true") {
    return true;
  }

  return (
    process.env.NODE_ENV !== "production" &&
    (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
  );
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
}

function getAuthHeader() {
  const keyId = getRequiredEnv("RAZORPAY_KEY_ID");
  const keySecret = getRequiredEnv("RAZORPAY_KEY_SECRET");

  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function razorpayRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${RAZORPAY_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as
    | (T & { error?: { description?: string } })
    | null;

  if (!response.ok || !data) {
    const errorMessage =
      data?.error?.description || `Razorpay request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export type RazorpayOrder = {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
};

export type RazorpayPayment = {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string | null;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  fee: number | null;
  tax: number | null;
  error_code: string | null;
  error_description: string | null;
  created_at: number;
  notes: Record<string, string>;
};

export type RazorpayRefund = {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  receipt: string | null;
  status: string;
  speed_processed: string | null;
  speed_requested: string | null;
  created_at: number;
};

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  receipt: string;
  description: string;
  notes?: Record<string, string>;
}

export interface PaymentVerifyParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface RefundParams {
  paymentId: string;
  amount?: number;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(params: CreateOrderParams) {
  try {
    const order = await razorpayRequest<RazorpayOrder>("/orders", {
      method: "POST",
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency || "INR",
        receipt: params.receipt,
        notes: params.notes,
      }),
    });

    return {
      success: true as const,
      order,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

export function verifyPaymentSignature(params: PaymentVerifyParams): boolean {
  try {
    const secret = getRequiredEnv("RAZORPAY_KEY_SECRET");
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
      .digest("hex");

    return safeCompare(expectedSignature, params.razorpaySignature);
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  try {
    const secret = getRequiredEnv("RAZORPAY_WEBHOOK_SECRET");
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    return safeCompare(expectedSignature, signature);
  } catch {
    return false;
  }
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export async function fetchPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpayRequest<RazorpayPayment>(`/payments/${paymentId}`);
    return { success: true as const, payment };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch payment",
    };
  }
}

export async function fetchOrderDetails(orderId: string) {
  try {
    const order = await razorpayRequest<RazorpayOrder>(`/orders/${orderId}`);
    return { success: true as const, order };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch order",
    };
  }
}

export async function createRefund(params: RefundParams) {
  try {
    const refund = await razorpayRequest<RazorpayRefund>(
      `/payments/${params.paymentId}/refund`,
      {
        method: "POST",
        body: JSON.stringify({
          ...(typeof params.amount === "number" ? { amount: params.amount } : {}),
          notes: params.notes || {},
        }),
      },
    );

    return {
      success: true as const,
      refund,
      refundId: refund.id,
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create refund",
    };
  }
}

export async function fetchRefundDetails(refundId: string) {
  try {
    const refund = await razorpayRequest<RazorpayRefund>(`/refunds/${refundId}`);
    return { success: true as const, refund };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch refund",
    };
  }
}

export async function checkPaymentStatus(paymentId: string) {
  try {
    const payment = await razorpayRequest<RazorpayPayment>(`/payments/${paymentId}`);
    return {
      success: true as const,
      status: payment.status,
      payment,
      isCompleted: payment.status === "captured",
      isFailed: payment.status === "failed",
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to check payment status",
    };
  }
}

export function getRazorpayPublicConfig() {
  return {
    keyId: getRequiredEnv("RAZORPAY_KEY_ID"),
  };
}
