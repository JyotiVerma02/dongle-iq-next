import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import {
  buildInvoiceHtml,
  createInvoiceNumber,
  getPaymentWithUser,
} from "@/lib/payments";
import { verifySessionToken } from "@/lib/auth";
import { isAdminRole } from "@/lib/adminRoles";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ paymentId: string }> },
) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = await verifySessionToken(token) as { userId: string; role: string };
    const { paymentId } = await context.params;
    const payment = await getPaymentWithUser(paymentId);

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 },
      );
    }

    const user = payment.userId as {
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
    } | null;
    const isOwner = String(user?._id) === decoded.userId;
    const isAdmin = isAdminRole(decoded.role);

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    if (!payment.invoiceNumber) {
      payment.invoiceNumber = createInvoiceNumber();
      payment.invoiceDate = payment.invoiceDate || new Date();
      payment.invoiceUrl = `/api/payments/${String(payment._id)}/invoice`;
      await payment.save();
    }

    const safeUser = user || {};
    const html = buildInvoiceHtml({ payment, user: safeUser });
    const download = req.nextUrl.searchParams.get("download") === "1";
    const filename = `${payment.invoiceNumber || "invoice"}.html`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to generate invoice",
      },
      { status: 500 },
    );
  }
}
