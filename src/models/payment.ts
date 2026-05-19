import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dscId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "USD"],
    },
    breakdown: {
      certificate: { type: Number, default: 0 },
      token: { type: Number, default: 0 },
      assisted: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      subtotal: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    razorpaySignature: String,
    status: {
      type: String,
      enum: [
        "pending",
        "initiated",
        "processing",
        "completed",
        "verified",
        "failed",
        "cancelled",
        "refunded",
        "partial_refund",
      ],
      default: "pending",
      index: true,
    },
    method: {
      type: String,
      enum: ["razorpay", "bank_transfer", "cheque", "cash", "wallet"],
      default: "razorpay",
    },
    orderDetails: {
      certificateType: String,
      certificateValidity: String,
      tokenType: String,
      assistedService: String,
      description: String,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    invoiceDate: Date,
    invoicePath: String,
    invoiceUrl: String,
    gstNumber: String,
    gstRate: { type: Number, default: 18 },
    hsn: String,
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    referenceNumber: String,
    description: String,
    refundDetails: {
      razorpayRefundId: String,
      refundAmount: Number,
      refundDate: Date,
      refundReason: String,
      refundStatus: {
        type: String,
        enum: ["pending", "processed", "failed"],
      },
    },
    webhookData: {
      type: mongoose.Schema.Types.Mixed,
    },
    webhookRetries: {
      type: Number,
      default: 0,
    },
    validationErrors: [String],
    dscDeliveryStatus: {
      type: String,
      enum: ["pending", "generated", "issued", "revoked"],
      default: "pending",
      index: true,
    },
    dscIssuedDate: Date,
    dscExpiryDate: Date,
    notes: [
      {
        timestamp: { type: Date, default: Date.now },
        action: String,
        by: String,
        details: String,
      },
    ],
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    processedDate: Date,
    metadata: {
      ipAddress: String,
      userAgent: String,
      source: { type: String, default: "web" },
      campaignId: String,
      promoCode: String,
    },
  },
  {
    timestamps: true,
    indexes: [
      { userId: 1, createdAt: -1 },
      { status: 1, createdAt: -1 },
      { razorpayOrderId: 1 },
      { dscId: 1 },
    ],
  },
);

PaymentSchema.index({ status: 1, createdAt: 1 });
PaymentSchema.index({ processedBy: 1, createdAt: -1 });
PaymentSchema.index({ invoiceNumber: 1, userId: 1 });

PaymentSchema.virtual("displayAmount").get(function () {
  return `Rs. ${this.amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
});

PaymentSchema.virtual("statusDisplay").get(function () {
  const statusMap: Record<string, string> = {
    pending: "Awaiting Payment",
    initiated: "Processing Payment",
    processing: "Verifying Payment",
    completed: "Payment Completed",
    verified: "Payment Verified",
    failed: "Payment Failed",
    cancelled: "Cancelled",
    refunded: "Refunded",
    partial_refund: "Partially Refunded",
  };

  return statusMap[this.status] || this.status;
});

PaymentSchema.methods.addNote = function (
  action: string,
  details: string,
  by: string = "system",
) {
  this.notes.push({
    timestamp: new Date(),
    action,
    by,
    details,
  });

  return this.save();
};

PaymentSchema.methods.logWebhookRetry = function () {
  this.webhookRetries = (this.webhookRetries || 0) + 1;
  return this.save();
};

PaymentSchema.methods.markAsVerified = function (by?: string) {
  this.status = "verified";

  if (by) {
    this.processedBy = by;
    this.processedDate = new Date();
  }

  return this.addNote("payment_verified", "Payment verified by system", by || "system");
};

PaymentSchema.set("toJSON", { virtuals: true });
PaymentSchema.set("toObject", { virtuals: true });

const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
export type IPayment = typeof Payment;
