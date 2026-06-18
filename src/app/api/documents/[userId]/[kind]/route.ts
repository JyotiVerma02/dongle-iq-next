import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { verifySessionToken, isAdminTokenPayload } from "@/lib/auth";
import User from "@/models/user";
import {
  extractCloudinaryPublicId,
  getDocumentFieldNames,
  type DocumentKind,
} from "@/lib/documentAccess";
import { getCloudinarySignedUrl } from "@/lib/cloudinary";

function isValidKind(kind: string): kind is DocumentKind {
  return kind === "photo" || kind === "idProof" || kind === "addressProof";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; kind: string }> },
) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifySessionToken(token);
    const isAdmin = isAdminTokenPayload(decoded);
    const { userId, kind } = await params;

    if (!isValidKind(kind)) {
      return NextResponse.json({ success: false, message: "Invalid document type" }, { status: 400 });
    }

    if (!isAdmin && String(decoded.userId) !== String(userId)) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const fields = getDocumentFieldNames(kind);
    const user = await User.findById(userId).select(
      `-${fields.publicIdField} ${fields.publicIdField} ${fields.urlField}`,
    );

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const publicIdFromField = String((user as Record<string, unknown>)[fields.publicIdField] || "");
    const legacyUrl = String((user as Record<string, unknown>)[fields.urlField] || "");
    const publicId = publicIdFromField || extractCloudinaryPublicId(legacyUrl);

    if (!publicId) {
      return NextResponse.json(
        { success: false, message: "Document not available" },
        { status: 404 },
      );
    }

    const signedUrl = getCloudinarySignedUrl(publicId, {
      resourceType: fields.resourceType,
      expiresAt: Math.floor(Date.now() / 1000) + 10 * 60,
    });

    return NextResponse.redirect(signedUrl, { status: 302 });
  } catch (error) {
    console.error("[documents:get] failed", error);
    return NextResponse.json(
      { success: false, message: "Failed to access document" },
      { status: 500 },
    );
  }
}
