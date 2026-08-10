import { NextResponse } from "next/server";

import { PERMISSIONS } from "@/constants/permissions";
import { requireAuth, requirePermission } from "@/services/auth/guards";
import { canManageFinance } from "@/services/payments/access";
import { paymentErrorResponse } from "@/app/api/payments/_utils";
import {
  listKycDocuments,
  reviewPassport,
  uploadPassport,
} from "@/services/payments/kyc-document-service";
import { ensurePaymentsSeeded } from "@/services/payments/seed";

export async function GET() {
  try {
    ensurePaymentsSeeded();
    const user = await requireAuth();
    const docs = canManageFinance(user) ? listKycDocuments() : listKycDocuments(user.id);
    return NextResponse.json({ success: true, data: docs, error: null });
  } catch (error) {
    return paymentErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    ensurePaymentsSeeded();
    const user = await requireAuth();
    await requirePermission(PERMISSIONS.BILLING_OWN);

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { success: false, data: null, error: "file required" },
          { status: 400 },
        );
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      const doc = await uploadPassport({
        userId: user.id,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        bytes,
      });
      return NextResponse.json({ success: true, data: doc, error: null }, { status: 201 });
    }

    const body = (await request.json().catch(() => null)) as {
      action?: string;
      documentId?: string;
      status?: "verified" | "rejected";
      rejectionReason?: string;
    } | null;

    if (body?.action === "review" && body.documentId && body.status) {
      await requirePermission(PERMISSIONS.SYSTEM_PAYMENTS);
      const doc = reviewPassport({
        documentId: body.documentId,
        status: body.status,
        actorId: user.id,
        rejectionReason: body.rejectionReason,
      });
      return NextResponse.json({ success: true, data: doc, error: null });
    }

    return NextResponse.json(
      { success: false, data: null, error: "Unsupported KYC request" },
      { status: 400 },
    );
  } catch (error) {
    return paymentErrorResponse(error);
  }
}
